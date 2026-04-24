import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import {
  getLocalAdminBootstrapFixtures,
  resolveAdminAuthPolicy,
  resolveAdminDevBootstrapEnabled,
  resolveAdminKeyRing,
  resolveAdminStorageDir
} from "./admin-config.js";
import {
  buildAuditChainHash,
  generateOpaqueToken,
  hashOpaqueToken,
  hashPassword,
  hashRecoveryCode,
  sealAdminSecret
} from "./admin-crypto.js";

const STORE_VERSION = "2026-04-24";
const STORE_NAMES = {
  accounts: "accounts.json",
  invitations: "invitations.json",
  sessions: "sessions.json",
  audit: "audit.json"
};

let adminStoreQueue = globalThis.__encouragingYouAdminStoreQueue ?? Promise.resolve();

globalThis.__encouragingYouAdminStoreQueue = adminStoreQueue;

function enqueue(task) {
  const nextTask = adminStoreQueue.then(task, task);

  adminStoreQueue = nextTask.catch(() => {});
  globalThis.__encouragingYouAdminStoreQueue = adminStoreQueue;

  return nextTask;
}

function getStorePath(storageDir, storeName) {
  return resolve(storageDir, STORE_NAMES[storeName]);
}

function createEmptyStore(storeName) {
  switch (storeName) {
    case "accounts":
      return {
        version: STORE_VERSION,
        accounts: []
      };
    case "invitations":
      return {
        version: STORE_VERSION,
        invitations: []
      };
    case "sessions":
      return {
        version: STORE_VERSION,
        sessions: []
      };
    default:
      return {
        version: STORE_VERSION,
        events: []
      };
  }
}

async function readStore(storageDir, storeName) {
  const filePath = getStorePath(storageDir, storeName);

  try {
    const source = await readFile(filePath, "utf8");
    const parsed = JSON.parse(source);

    return {
      ...createEmptyStore(storeName),
      ...parsed
    };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return createEmptyStore(storeName);
    }

    throw error;
  }
}

async function writeStore(storageDir, storeName, value) {
  const filePath = getStorePath(storageDir, storeName);
  const tempPath = `${filePath}.${globalThis.process?.pid ?? "proc"}.${Date.now()}.tmp`;

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(tempPath, filePath);
}

async function ensureBootstrapAccounts({
  storageDir,
  env = globalThis.process?.env ?? {},
  deploymentChannel
}) {
  const shouldBootstrap = resolveAdminDevBootstrapEnabled({
    env,
    deploymentChannel
  });

  if (!shouldBootstrap) {
    return;
  }

  const accountsStore = await readStore(storageDir, "accounts");

  if (accountsStore.accounts.length > 0) {
    return;
  }

  const keyRing = resolveAdminKeyRing({
    env,
    deploymentChannel
  });
  const now = new Date().toISOString();
  const seededAccounts = [];

  for (const fixture of getLocalAdminBootstrapFixtures()) {
    const passwordHash = await hashPassword(fixture.password);

    seededAccounts.push({
      id: `bootstrap-${fixture.roleId}`,
      email: fixture.email,
      displayName: fixture.displayName,
      roleId: fixture.roleId,
      state: "active",
      invitationId: null,
      createdAt: now,
      activatedAt: now,
      suspendedAt: null,
      failedPasswordCount: 0,
      lockoutUntil: null,
      lastFailedPasswordAt: null,
      lastLoginAt: null,
      password: {
        algorithm: "argon2id",
        hash: passwordHash,
        changedAt: now
      },
      mfa: {
        method: "totp",
        required: true,
        enrolledAt: now,
        secretSealed: sealAdminSecret(fixture.totpSecret, keyRing),
        recoveryCodes: fixture.recoveryCodes.map((code) => ({
          hash: hashRecoveryCode(code),
          usedAt: null
        }))
      }
    });
  }

  await writeStore(storageDir, "accounts", {
    version: STORE_VERSION,
    accounts: seededAccounts
  });
}

export async function withAdminStoreLock(task) {
  return enqueue(task);
}

export async function listAdminAccounts(options = {}) {
  const storageDir = resolveAdminStorageDir(options);

  await ensureBootstrapAccounts({
    storageDir,
    env: options.env,
    deploymentChannel: options.deploymentChannel
  });

  return (await readStore(storageDir, "accounts")).accounts;
}

export async function getAdminAccountByEmail(email, options = {}) {
  const normalizedEmail = `${email ?? ""}`.trim().toLowerCase();
  const accounts = await listAdminAccounts(options);

  return accounts.find((account) => account.email === normalizedEmail) ?? null;
}

export async function getAdminAccountById(accountId, options = {}) {
  const accounts = await listAdminAccounts(options);

  return accounts.find((account) => account.id === accountId) ?? null;
}

export async function mutateAdminAccounts(mutator, options = {}) {
  const storageDir = resolveAdminStorageDir(options);

  return withAdminStoreLock(async () => {
    await ensureBootstrapAccounts({
      storageDir,
      env: options.env,
      deploymentChannel: options.deploymentChannel
    });

    const store = await readStore(storageDir, "accounts");
    const result = await mutator(store.accounts);

    await writeStore(storageDir, "accounts", {
      ...store,
      accounts: store.accounts
    });

    return result;
  });
}

export async function saveAdminAccount(account, options = {}) {
  return mutateAdminAccounts((accounts) => {
    accounts.push(account);

    return account;
  }, options);
}

export async function updateAdminAccount(accountId, updater, options = {}) {
  return mutateAdminAccounts((accounts) => {
    const index = accounts.findIndex((entry) => entry.id === accountId);

    if (index === -1) {
      return null;
    }

    const nextValue = updater({
      ...accounts[index]
    });

    if (!nextValue) {
      return null;
    }

    accounts[index] = nextValue;

    return nextValue;
  }, options);
}

export async function listAdminInvitations(options = {}) {
  const storageDir = resolveAdminStorageDir(options);

  return (await readStore(storageDir, "invitations")).invitations;
}

export async function getAdminInvitationByToken(token, options = {}) {
  const invitations = await listAdminInvitations(options);
  const tokenHash = hashOpaqueToken(token);

  return invitations.find((invitation) => invitation.tokenHash === tokenHash) ?? null;
}

export async function createAdminInvitation(
  {
    email,
    displayName,
    roleId,
    purpose = "invite",
    issuedByAccountId,
    resetTargetAccountId = null
  },
  options = {}
) {
  const storageDir = resolveAdminStorageDir(options);
  const authPolicy = resolveAdminAuthPolicy(options.env);
  const now = new Date();
  const rawToken = generateOpaqueToken(24);
  const invitation = {
    id: randomUUID(),
    email: `${email ?? ""}`.trim().toLowerCase(),
    displayName: `${displayName ?? ""}`.trim(),
    roleId,
    purpose,
    resetTargetAccountId,
    issuedByAccountId,
    issuedAt: now.toISOString(),
    expiresAt: new Date(
      now.getTime() + authPolicy.invitationExpiryHours * 60 * 60 * 1000
    ).toISOString(),
    consumedAt: null,
    tokenHash: hashOpaqueToken(rawToken)
  };

  await withAdminStoreLock(async () => {
    const store = await readStore(storageDir, "invitations");

    store.invitations.push(invitation);
    await writeStore(storageDir, "invitations", store);
  });

  return {
    invitation,
    rawToken
  };
}

export async function consumeAdminInvitation(invitationId, options = {}) {
  return withAdminStoreLock(async () => {
    const storageDir = resolveAdminStorageDir(options);
    const store = await readStore(storageDir, "invitations");
    const invitation = store.invitations.find((entry) => entry.id === invitationId);

    if (!invitation) {
      return null;
    }

    invitation.consumedAt = new Date().toISOString();
    await writeStore(storageDir, "invitations", store);

    return invitation;
  });
}

export async function listAdminSessions(options = {}) {
  const storageDir = resolveAdminStorageDir(options);

  return (await readStore(storageDir, "sessions")).sessions;
}

export async function createAdminSession(sessionInput, options = {}) {
  const storageDir = resolveAdminStorageDir(options);
  const rawToken = generateOpaqueToken(32);
  const sessionRecord = {
    ...sessionInput,
    id: randomUUID(),
    tokenHash: hashOpaqueToken(rawToken)
  };

  await withAdminStoreLock(async () => {
    const store = await readStore(storageDir, "sessions");

    store.sessions.push(sessionRecord);
    await writeStore(storageDir, "sessions", store);
  });

  return {
    rawToken,
    session: sessionRecord
  };
}

export async function getAdminSessionByToken(token, { kind, ...options } = {}) {
  const tokenHash = hashOpaqueToken(token);
  const sessions = await listAdminSessions(options);

  return (
    sessions.find(
      (session) =>
        session.tokenHash === tokenHash && (kind ? session.kind === kind : true)
    ) ?? null
  );
}

export async function updateAdminSession(sessionId, updater, options = {}) {
  return withAdminStoreLock(async () => {
    const storageDir = resolveAdminStorageDir(options);
    const store = await readStore(storageDir, "sessions");
    const index = store.sessions.findIndex((entry) => entry.id === sessionId);

    if (index === -1) {
      return null;
    }

    const nextValue = updater({
      ...store.sessions[index]
    });

    if (!nextValue) {
      return null;
    }

    store.sessions[index] = nextValue;
    await writeStore(storageDir, "sessions", store);

    return nextValue;
  });
}

export async function revokeAdminSession(
  sessionId,
  { reason = "manual-revocation", ...options } = {}
) {
  return updateAdminSession(
    sessionId,
    (session) => ({
      ...session,
      revokedAt: new Date().toISOString(),
      revokeReason: reason
    }),
    options
  );
}

export async function revokeAllAdminSessionsForAccount(
  accountId,
  { exceptSessionId = null, reason = "account-reset", ...options } = {}
) {
  return withAdminStoreLock(async () => {
    const storageDir = resolveAdminStorageDir(options);
    const store = await readStore(storageDir, "sessions");
    let revokedCount = 0;

    for (const session of store.sessions) {
      if (session.accountId !== accountId || session.id === exceptSessionId) {
        continue;
      }

      if (!session.revokedAt) {
        session.revokedAt = new Date().toISOString();
        session.revokeReason = reason;
        revokedCount += 1;
      }
    }

    await writeStore(storageDir, "sessions", store);

    return revokedCount;
  });
}

export async function appendAdminAuditEvent(eventInput, options = {}) {
  const storageDir = resolveAdminStorageDir(options);

  return withAdminStoreLock(async () => {
    const store = await readStore(storageDir, "audit");
    const previousHash = store.events.at(-1)?.hash ?? "";
    const eventRecord = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...eventInput
    };
    const hash = buildAuditChainHash(previousHash, eventRecord);

    store.events.push({
      ...eventRecord,
      previousHash,
      hash
    });
    await writeStore(storageDir, "audit", store);

    return store.events.at(-1) ?? null;
  });
}

export async function listAdminAuditEvents({ limit = 50, ...options } = {}) {
  const storageDir = resolveAdminStorageDir(options);
  const store = await readStore(storageDir, "audit");

  return store.events.slice(-limit).reverse();
}
