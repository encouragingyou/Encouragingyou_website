import { randomUUID } from "node:crypto";

import { getCmsRole } from "./scope.js";
import {
  adminSessionKinds,
  isAdminCryptoReady,
  isAdminMfaRequired,
  resolveAdminAllowedOrigins,
  resolveAdminAuthPolicy,
  resolveAdminCookieNames,
  resolveAdminCookieOptions,
  resolveAdminOriginUrl,
  resolveAdminPortalEnabled,
  resolveAdminKeyRing
} from "./admin-config.js";
import {
  generateRecoveryCodes,
  hashFingerprint,
  hashPassword,
  hashRecoveryCode,
  openAdminSecret,
  sealAdminSecret,
  verifyPassword
} from "./admin-crypto.js";
import {
  appendAdminAuditEvent,
  consumeAdminInvitation,
  createAdminInvitation,
  createAdminSession,
  getAdminAccountByEmail,
  getAdminAccountById,
  getAdminInvitationByToken,
  getAdminSessionByToken,
  listAdminAccounts,
  listAdminAuditEvents,
  listAdminInvitations,
  listAdminSessions,
  revokeAdminSession,
  revokeAllAdminSessionsForAccount,
  saveAdminAccount,
  updateAdminAccount,
  updateAdminSession
} from "./admin-store.js";
import {
  buildTotpOtpAuthUrl,
  formatTotpSecret,
  generateTotpSecret,
  verifyTotpCode
} from "./admin-totp.js";
import { isTrustedSameOriginRequest } from "../security/request-guards.js";

function readCookieValue(cookies, name) {
  const value = cookies?.get?.(name);

  return typeof value === "string" ? value : (value?.value ?? null);
}

function deleteCookie(cookies, name, options = {}) {
  cookies.delete(name, {
    path: "/",
    ...options
  });
}

function buildAccessResponse({
  enabled = true,
  authenticated = false,
  authReadiness = "ready",
  boundaryMode = "server-managed-opaque-session",
  reason = "login-required"
} = {}) {
  return {
    enabled,
    authenticated,
    accountId: null,
    email: null,
    displayName: null,
    roleId: "anonymous",
    roleTitle: "Not signed in",
    roleDescription: "A valid invitation, password, and MFA challenge are required.",
    capabilities: [],
    restrictions: [],
    boundaryMode,
    authReadiness,
    reason,
    csrfToken: null,
    mfaRequired: false,
    lastAuthenticatedAt: null,
    sessionId: null
  };
}

function normalizeEmail(value) {
  return `${value ?? ""}`.trim().toLowerCase();
}

function normalizeDisplayName(value) {
  return `${value ?? ""}`.trim().replace(/\s+/gu, " ");
}

function buildRequestFingerprint(headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? headers.get("x-real-ip") ?? "";
  const userAgent = headers.get("user-agent") ?? "";

  return {
    ipHash: hashFingerprint(ipAddress),
    userAgentHash: hashFingerprint(userAgent)
  };
}

function isIsoDateInFuture(value, now = new Date()) {
  return typeof value === "string" && new Date(value).getTime() > now.getTime();
}

function buildSessionView(account, sessionRecord) {
  const role = getCmsRole(account.roleId);

  return {
    enabled: true,
    authenticated: true,
    accountId: account.id,
    email: account.email,
    displayName: account.displayName,
    roleId: account.roleId,
    roleTitle: role?.title ?? account.roleId,
    roleDescription: role?.description ?? "",
    capabilities: role?.can ?? [],
    restrictions: role?.cannot ?? [],
    boundaryMode: "server-managed-opaque-session",
    authReadiness: "prompt-54-live",
    reason: "authenticated",
    csrfToken: sessionRecord.csrfToken,
    mfaRequired: Boolean(account.mfa?.required),
    lastAuthenticatedAt: sessionRecord.lastAuthenticatedAt ?? sessionRecord.createdAt,
    sessionId: sessionRecord.id
  };
}

function validatePassword(password, authPolicy) {
  const normalizedPassword = `${password ?? ""}`.normalize("NFKC");

  if (normalizedPassword.length < authPolicy.passwordMinimumLength) {
    return {
      ok: false,
      code: "password-too-short",
      message: `Use at least ${authPolicy.passwordMinimumLength} characters.`
    };
  }

  if (normalizedPassword.length > 128) {
    return {
      ok: false,
      code: "password-too-long",
      message: "Keep the password within 128 characters."
    };
  }

  if (!/[A-Za-z]/u.test(normalizedPassword) || !/\d/u.test(normalizedPassword)) {
    return {
      ok: false,
      code: "password-too-weak",
      message: "Use a passphrase that includes both letters and numbers."
    };
  }

  return {
    ok: true,
    code: "",
    message: ""
  };
}

function validatePendingInvitation(invitation, now = new Date()) {
  if (!invitation) {
    return {
      ok: false,
      status: 404,
      code: "invalid-invitation"
    };
  }

  if (invitation.consumedAt) {
    return {
      ok: false,
      status: 410,
      code: "invitation-used"
    };
  }

  if (!isIsoDateInFuture(invitation.expiresAt, now)) {
    return {
      ok: false,
      status: 410,
      code: "invitation-expired"
    };
  }

  return {
    ok: true,
    status: 200,
    code: ""
  };
}

async function recordAuditEvent(type, sessionOrAccount, details = {}, options = {}) {
  const roleId = sessionOrAccount?.roleId ?? null;

  return appendAdminAuditEvent(
    {
      type,
      actorAccountId: sessionOrAccount?.accountId ?? sessionOrAccount?.id ?? null,
      actorRoleId: roleId,
      details
    },
    options
  );
}

export function adminCan(adminSession, capability) {
  return Boolean(
    adminSession?.authenticated && adminSession.capabilities.includes(capability)
  );
}

export async function validateAdminSessionRequest({
  requestUrl,
  headers,
  cookies,
  ...options
}) {
  if (!resolveAdminPortalEnabled(options.env)) {
    return buildAccessResponse({
      enabled: false,
      authenticated: false,
      authReadiness: "portal-disabled",
      reason: "portal-disabled"
    });
  }

  if (!isAdminCryptoReady(options)) {
    return buildAccessResponse({
      enabled: true,
      authenticated: false,
      authReadiness: "crypto-config-missing",
      reason: "crypto-config-missing"
    });
  }

  const cookieNames = resolveAdminCookieNames({
    requestUrl,
    headers
  });
  const sessionToken = readCookieValue(cookies, cookieNames.session);

  if (!sessionToken) {
    return buildAccessResponse();
  }

  const sessionRecord = await getAdminSessionByToken(sessionToken, {
    kind: adminSessionKinds.active,
    ...options
  });

  if (!sessionRecord || sessionRecord.revokedAt) {
    return buildAccessResponse();
  }

  const now = new Date();

  if (
    new Date(sessionRecord.idleExpiresAt).getTime() <= now.getTime() ||
    new Date(sessionRecord.absoluteExpiresAt).getTime() <= now.getTime()
  ) {
    await revokeAdminSession(sessionRecord.id, {
      reason: "session-expired",
      ...options
    });

    return buildAccessResponse({
      reason: "session-expired"
    });
  }

  const account = await getAdminAccountById(sessionRecord.accountId, options);

  if (!account || account.state !== "active") {
    await revokeAdminSession(sessionRecord.id, {
      reason: "account-unavailable",
      ...options
    });

    return buildAccessResponse({
      reason: "account-unavailable"
    });
  }

  const authPolicy = resolveAdminAuthPolicy(options.env);
  const nextIdleExpiresAt = new Date(
    now.getTime() + authPolicy.sessionIdleMinutes * 60 * 1000
  ).toISOString();

  await updateAdminSession(
    sessionRecord.id,
    (currentSession) => ({
      ...currentSession,
      lastSeenAt: now.toISOString(),
      idleExpiresAt: nextIdleExpiresAt
    }),
    options
  );

  return buildSessionView(account, {
    ...sessionRecord,
    lastSeenAt: now.toISOString(),
    idleExpiresAt: nextIdleExpiresAt
  });
}

async function enforceActiveSessionLimit(accountId, options = {}) {
  const authPolicy = resolveAdminAuthPolicy(options.env);
  const activeSessions = (await listAdminSessions(options))
    .filter(
      (session) =>
        session.accountId === accountId &&
        session.kind === adminSessionKinds.active &&
        !session.revokedAt
    )
    .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));

  if (activeSessions.length < authPolicy.maxConcurrentSessions) {
    return;
  }

  const sessionsToRevoke = activeSessions.slice(
    0,
    activeSessions.length - authPolicy.maxConcurrentSessions + 1
  );

  for (const session of sessionsToRevoke) {
    await revokeAdminSession(session.id, {
      reason: "concurrent-session-limit",
      ...options
    });
  }
}

export async function requireAdminCapability(adminSession, capability) {
  return adminCan(adminSession, capability);
}

export async function authenticateAdminPassword(
  { email, password, headers },
  options = {}
) {
  const normalizedEmail = normalizeEmail(email);
  const account = await getAdminAccountByEmail(normalizedEmail, options);
  const authPolicy = resolveAdminAuthPolicy(options.env);
  const now = new Date();
  const requestFingerprint = buildRequestFingerprint(headers);

  if (!account || account.state !== "active") {
    await recordAuditEvent(
      "admin-login-failed",
      null,
      {
        email: normalizedEmail,
        reason: "invalid-credentials",
        ...requestFingerprint
      },
      options
    );

    return {
      ok: false,
      state: "invalid-credentials"
    };
  }

  if (account.lockoutUntil && new Date(account.lockoutUntil).getTime() > now.getTime()) {
    await recordAuditEvent(
      "admin-login-blocked",
      account,
      {
        reason: "lockout-active",
        ...requestFingerprint
      },
      options
    );

    return {
      ok: false,
      state: "locked"
    };
  }

  const passwordMatches = await verifyPassword(password, account.password.hash);

  if (!passwordMatches) {
    const failedCount = (account.failedPasswordCount ?? 0) + 1;
    const lockoutUntil =
      failedCount >= authPolicy.maxFailedPasswords
        ? new Date(
            now.getTime() + authPolicy.loginLockoutMinutes * 60 * 1000
          ).toISOString()
        : null;

    await updateAdminAccount(
      account.id,
      (currentAccount) => ({
        ...currentAccount,
        failedPasswordCount: failedCount,
        lockoutUntil,
        lastFailedPasswordAt: now.toISOString()
      }),
      options
    );

    await recordAuditEvent(
      "admin-login-failed",
      account,
      {
        reason: lockoutUntil ? "lockout-triggered" : "invalid-credentials",
        failedPasswordCount: failedCount,
        ...requestFingerprint
      },
      options
    );

    return {
      ok: false,
      state: lockoutUntil ? "locked" : "invalid-credentials"
    };
  }

  await updateAdminAccount(
    account.id,
    (currentAccount) => ({
      ...currentAccount,
      failedPasswordCount: 0,
      lockoutUntil: null,
      lastFailedPasswordAt: null
    }),
    options
  );

  const pendingUntil = new Date(
    now.getTime() + authPolicy.pendingMfaMinutes * 60 * 1000
  ).toISOString();
  const { rawToken, session } = await createAdminSession(
    {
      accountId: account.id,
      roleId: account.roleId,
      kind: adminSessionKinds.pendingMfa,
      createdAt: now.toISOString(),
      lastSeenAt: now.toISOString(),
      idleExpiresAt: pendingUntil,
      absoluteExpiresAt: pendingUntil,
      lastAuthenticatedAt: null,
      csrfToken: null,
      revokedAt: null,
      ...requestFingerprint
    },
    options
  );

  await recordAuditEvent(
    "admin-password-verified",
    account,
    {
      pendingSessionId: session.id,
      mfaRequired: isAdminMfaRequired(account.roleId),
      ...requestFingerprint
    },
    options
  );

  return {
    ok: true,
    state: "mfa-required",
    account,
    pendingToken: rawToken
  };
}

async function consumeRecoveryCode(account, code, options) {
  const codeHash = hashRecoveryCode(code);
  const recoveryCode = account.mfa?.recoveryCodes?.find(
    (entry) => entry.hash === codeHash && !entry.usedAt
  );

  if (!recoveryCode) {
    return false;
  }

  recoveryCode.usedAt = new Date().toISOString();
  await updateAdminAccount(account.id, () => account, options);

  return true;
}

export async function completeAdminMfaChallenge(
  { pendingToken, code, headers },
  options = {}
) {
  const pendingSession = await getAdminSessionByToken(pendingToken, {
    kind: adminSessionKinds.pendingMfa,
    ...options
  });

  if (!pendingSession || pendingSession.revokedAt) {
    return {
      ok: false,
      state: "mfa-expired"
    };
  }

  const account = await getAdminAccountById(pendingSession.accountId, options);

  if (!account || account.state !== "active") {
    return {
      ok: false,
      state: "mfa-expired"
    };
  }

  const keyRing = resolveAdminKeyRing(options);
  const totpSecret = openAdminSecret(account.mfa.secretSealed, keyRing);
  const trimmedCode = `${code ?? ""}`.trim();
  const requestFingerprint = buildRequestFingerprint(headers);
  const now = new Date();
  const isTotpCode = /^\d{6}$/u.test(trimmedCode);
  const method = isTotpCode ? "totp" : "recovery-code";
  const mfaVerified = isTotpCode
    ? verifyTotpCode({
        secret: totpSecret,
        code: trimmedCode
      })
    : await consumeRecoveryCode(account, trimmedCode, options);

  if (!mfaVerified) {
    await recordAuditEvent(
      "admin-mfa-failed",
      account,
      {
        pendingSessionId: pendingSession.id,
        ...requestFingerprint
      },
      options
    );

    return {
      ok: false,
      state: "invalid-mfa"
    };
  }

  const authPolicy = resolveAdminAuthPolicy(options.env);
  await enforceActiveSessionLimit(account.id, options);
  const { rawToken, session } = await createAdminSession(
    {
      accountId: account.id,
      roleId: account.roleId,
      kind: adminSessionKinds.active,
      createdAt: now.toISOString(),
      lastSeenAt: now.toISOString(),
      idleExpiresAt: new Date(
        now.getTime() + authPolicy.sessionIdleMinutes * 60 * 1000
      ).toISOString(),
      absoluteExpiresAt: new Date(
        now.getTime() + authPolicy.sessionAbsoluteHours * 60 * 60 * 1000
      ).toISOString(),
      lastAuthenticatedAt: now.toISOString(),
      csrfToken: randomUUID(),
      revokedAt: null,
      ...requestFingerprint
    },
    options
  );

  await revokeAdminSession(pendingSession.id, {
    reason: "mfa-completed",
    ...options
  });
  await updateAdminAccount(
    account.id,
    (currentAccount) => ({
      ...currentAccount,
      lastLoginAt: now.toISOString()
    }),
    options
  );

  await recordAuditEvent(
    "admin-login-succeeded",
    account,
    {
      sessionId: session.id,
      mfaMethod: method,
      ...requestFingerprint
    },
    options
  );

  return {
    ok: true,
    state: "authenticated",
    account,
    sessionToken: rawToken
  };
}

export async function createAdminActivationModel(invitationToken, options = {}) {
  const invitation = await getAdminInvitationByToken(invitationToken, options);
  const invitationStatus = validatePendingInvitation(invitation);

  if (!invitationStatus.ok) {
    return {
      invitation: null,
      invitationStatus,
      totpSecret: null,
      formattedTotpSecret: null,
      otpauthUrl: null
    };
  }

  const totpSecret = generateTotpSecret();

  return {
    invitation,
    invitationStatus,
    totpSecret,
    formattedTotpSecret: formatTotpSecret(totpSecret),
    otpauthUrl: buildTotpOtpAuthUrl({
      secret: totpSecret,
      email: invitation.email
    })
  };
}

export async function activateAdminInvitation(
  { invitationToken, displayName, password, totpSecret, totpCode, headers },
  options = {}
) {
  const invitation = await getAdminInvitationByToken(invitationToken, options);
  const invitationStatus = validatePendingInvitation(invitation);
  const authPolicy = resolveAdminAuthPolicy(options.env);

  if (!invitationStatus.ok) {
    return {
      ok: false,
      state: invitationStatus.code
    };
  }

  const passwordValidation = validatePassword(password, authPolicy);

  if (!passwordValidation.ok) {
    return {
      ok: false,
      state: passwordValidation.code,
      message: passwordValidation.message
    };
  }

  if (
    !verifyTotpCode({
      secret: totpSecret,
      code: totpCode
    })
  ) {
    return {
      ok: false,
      state: "invalid-mfa"
    };
  }

  const normalizedName = normalizeDisplayName(displayName) || invitation.displayName;
  const normalizedEmail = normalizeEmail(invitation.email);
  const keyRing = resolveAdminKeyRing(options);
  const passwordHash = await hashPassword(password);
  const recoveryCodes = generateRecoveryCodes(8);
  const sealedTotpSecret = sealAdminSecret(totpSecret, keyRing);
  const existingAccount = await getAdminAccountByEmail(normalizedEmail, options);
  const now = new Date();
  const requestFingerprint = buildRequestFingerprint(headers);
  const accountId = existingAccount?.id ?? randomUUID();

  if (invitation.purpose === "invite" && existingAccount) {
    return {
      ok: false,
      state: "account-exists"
    };
  }

  if (invitation.purpose === "reset" && !existingAccount) {
    return {
      ok: false,
      state: "reset-target-missing"
    };
  }

  const accountRecord = {
    id: accountId,
    email: normalizedEmail,
    displayName: normalizedName,
    roleId: invitation.roleId,
    state: "active",
    invitationId: invitation.id,
    createdAt: existingAccount?.createdAt ?? now.toISOString(),
    activatedAt: now.toISOString(),
    suspendedAt: null,
    failedPasswordCount: 0,
    lockoutUntil: null,
    lastFailedPasswordAt: null,
    lastLoginAt: null,
    password: {
      algorithm: "argon2id",
      hash: passwordHash,
      changedAt: now.toISOString()
    },
    mfa: {
      method: "totp",
      required: true,
      enrolledAt: now.toISOString(),
      secretSealed: sealedTotpSecret,
      recoveryCodes: recoveryCodes.map((codeValue) => ({
        hash: hashRecoveryCode(codeValue),
        usedAt: null
      }))
    }
  };

  if (existingAccount) {
    await updateAdminAccount(existingAccount.id, () => accountRecord, options);
    await revokeAllAdminSessionsForAccount(existingAccount.id, options);
  } else {
    await saveAdminAccount(accountRecord, options);
  }

  await consumeAdminInvitation(invitation.id, options);
  await recordAuditEvent(
    invitation.purpose === "reset"
      ? "admin-password-reset-completed"
      : "admin-account-activated",
    accountRecord,
    {
      invitationId: invitation.id,
      ...requestFingerprint
    },
    options
  );

  const authResult = await authenticateAdminPassword(
    {
      email: normalizedEmail,
      password,
      headers
    },
    options
  );

  if (!authResult.ok || !authResult.pendingToken) {
    return {
      ok: false,
      state: "activation-signin-failed"
    };
  }

  const mfaResult = await completeAdminMfaChallenge(
    {
      pendingToken: authResult.pendingToken,
      code: totpCode,
      headers
    },
    options
  );

  if (!mfaResult.ok) {
    return {
      ok: false,
      state: "activation-signin-failed"
    };
  }

  return {
    ok: true,
    state:
      invitation.purpose === "reset" ? "password-reset-complete" : "account-activated",
    sessionToken: mfaResult.sessionToken,
    recoveryCodes
  };
}

export async function getAdminPendingMfaChallenge(
  { requestUrl, headers, cookies },
  options = {}
) {
  const cookieNames = resolveAdminCookieNames({
    requestUrl,
    headers
  });
  const pendingToken = readCookieValue(cookies, cookieNames.pendingMfa);

  if (!pendingToken) {
    return null;
  }

  const pendingSession = await getAdminSessionByToken(pendingToken, {
    kind: adminSessionKinds.pendingMfa,
    ...options
  });

  if (!pendingSession || pendingSession.revokedAt) {
    return null;
  }

  const account = await getAdminAccountById(pendingSession.accountId, options);

  if (!account) {
    return null;
  }

  return {
    token: pendingToken,
    accountId: account.id,
    email: account.email,
    roleId: account.roleId,
    expiresAt: pendingSession.absoluteExpiresAt
  };
}

/**
 * @param {{
 *   cookies: import("astro").AstroCookies;
 *   requestUrl: string;
 *   headers: Headers;
 *   sessionToken?: string | null;
 *   pendingToken?: string | null;
 *   env?: Record<string, string | undefined>;
 * }} input
 */
export function setAdminSessionCookies({
  cookies,
  requestUrl,
  headers,
  sessionToken,
  pendingToken = null,
  env = globalThis.process?.env ?? {}
}) {
  const cookieNames = resolveAdminCookieNames({
    requestUrl,
    headers
  });
  const authPolicy = resolveAdminAuthPolicy(env);

  if (sessionToken) {
    cookies.set(
      cookieNames.session,
      sessionToken,
      resolveAdminCookieOptions({
        requestUrl,
        headers,
        maxAge: authPolicy.sessionAbsoluteHours * 60 * 60
      })
    );
  }

  if (pendingToken) {
    cookies.set(
      cookieNames.pendingMfa,
      pendingToken,
      resolveAdminCookieOptions({
        requestUrl,
        headers,
        maxAge: authPolicy.pendingMfaMinutes * 60
      })
    );
  } else {
    deleteCookie(cookies, cookieNames.pendingMfa);
  }
}

/**
 * @param {{
 *   cookies: import("astro").AstroCookies;
 *   requestUrl: string;
 *   headers: Headers;
 * }} input
 */
export function clearAdminSessionCookies({ cookies, requestUrl, headers }) {
  const cookieNames = resolveAdminCookieNames({
    requestUrl,
    headers
  });

  deleteCookie(cookies, cookieNames.session);
  deleteCookie(cookies, cookieNames.pendingMfa);
}

export async function logoutAdminSession(
  { requestUrl, headers, cookies, adminSession },
  options = {}
) {
  if (adminSession?.sessionId) {
    await revokeAdminSession(adminSession.sessionId, {
      reason: "manual-logout",
      ...options
    });
    await recordAuditEvent(
      "admin-logout",
      adminSession,
      buildRequestFingerprint(headers),
      options
    );
  }

  clearAdminSessionCookies({
    cookies,
    requestUrl,
    headers
  });
}

/**
 * @param {{
 *   requestUrl: string;
 *   headers: Headers;
 *   env?: Record<string, string | undefined>;
 *   deploymentChannel?: "local" | "ci" | "preview" | "production";
 * }} input
 */
export function isTrustedAdminOriginRequest({
  requestUrl,
  headers,
  env = globalThis.process?.env ?? {},
  deploymentChannel = undefined
}) {
  if (!isTrustedSameOriginRequest({ requestUrl, headers })) {
    return false;
  }

  const allowedOrigins = resolveAdminAllowedOrigins({
    requestUrl,
    headers,
    env,
    deploymentChannel
  });
  const origin = headers.get("origin");

  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(origin);
}

export function verifyAdminCsrf(adminSession, submittedToken) {
  return Boolean(
    adminSession?.authenticated &&
    adminSession.csrfToken &&
    submittedToken &&
    adminSession.csrfToken === submittedToken
  );
}

export async function listAdminSecurityOverview(adminSession, options = {}) {
  const accounts = adminCan(adminSession, "manage-editor-access")
    ? await listAdminAccounts(options)
    : [];
  const invitations = adminCan(adminSession, "manage-editor-access")
    ? await listAdminInvitations(options)
    : [];
  const sessions = adminSession?.accountId
    ? (await listAdminSessions(options)).filter(
        (session) => session.accountId === adminSession.accountId && !session.revokedAt
      )
    : [];
  const auditEvents = adminCan(adminSession, "view-audit-log")
    ? await listAdminAuditEvents(options)
    : [];

  return {
    accounts,
    invitations,
    sessions,
    auditEvents
  };
}

async function verifyStepUpCode(adminSession, code, options = {}) {
  const account = await getAdminAccountById(adminSession.accountId, options);

  if (!account) {
    return false;
  }

  const secret = openAdminSecret(account.mfa.secretSealed, resolveAdminKeyRing(options));

  return verifyTotpCode({
    secret,
    code
  });
}

export async function performAdminAccessAction(
  { adminSession, action, payload = {}, requestUrl, headers },
  options = {}
) {
  if (!adminSession?.authenticated) {
    return {
      ok: false,
      status: 401,
      state: "unauthenticated"
    };
  }

  if (action === "revoke-session") {
    const sessionId = `${payload.sessionId ?? ""}`.trim();
    const sessions = await listAdminSessions(options);
    const targetSession = sessions.find((session) => session.id === sessionId);

    if (!targetSession || targetSession.accountId !== adminSession.accountId) {
      return {
        ok: false,
        status: 404,
        state: "session-not-found"
      };
    }

    await revokeAdminSession(targetSession.id, {
      reason: "user-revoked",
      ...options
    });
    await recordAuditEvent(
      "admin-session-revoked",
      adminSession,
      {
        revokedSessionId: targetSession.id,
        ...buildRequestFingerprint(headers)
      },
      options
    );

    return {
      ok: true,
      status: 200,
      state: "session-revoked"
    };
  }

  if (!adminCan(adminSession, "manage-editor-access")) {
    return {
      ok: false,
      status: 403,
      state: "forbidden"
    };
  }

  const stepUpCode = `${payload.stepUpCode ?? ""}`.trim();

  if (!(await verifyStepUpCode(adminSession, stepUpCode, options))) {
    return {
      ok: false,
      status: 403,
      state: "step-up-required"
    };
  }

  if (action === "issue-invitation") {
    const roleId = `${payload.roleId ?? ""}`.trim();
    const email = normalizeEmail(payload.email);
    const displayName = normalizeDisplayName(payload.displayName);

    if (!getCmsRole(roleId)) {
      return {
        ok: false,
        status: 400,
        state: "invalid-role"
      };
    }

    const { rawToken } = await createAdminInvitation(
      {
        email,
        displayName,
        roleId,
        issuedByAccountId: adminSession.accountId
      },
      options
    );

    const activationPath = `/admin/activate/${rawToken}/`;

    await recordAuditEvent(
      "admin-invitation-issued",
      adminSession,
      {
        invitedEmail: email,
        invitedRoleId: roleId,
        activationPath,
        requestOrigin: resolveAdminOriginUrl({
          requestUrl,
          headers,
          env: options.env
        })
      },
      options
    );

    return {
      ok: true,
      status: 200,
      state: "invitation-issued",
      activationPath
    };
  }

  if (action === "suspend-account" || action === "resume-account") {
    const accountId = `${payload.accountId ?? ""}`.trim();
    const nextState = action === "suspend-account" ? "suspended" : "active";

    const updatedAccount = await updateAdminAccount(
      accountId,
      (currentAccount) =>
        currentAccount
          ? {
              ...currentAccount,
              state: nextState,
              suspendedAt: nextState === "suspended" ? new Date().toISOString() : null
            }
          : null,
      options
    );

    if (!updatedAccount) {
      return {
        ok: false,
        status: 404,
        state: "account-not-found"
      };
    }

    if (nextState === "suspended") {
      await revokeAllAdminSessionsForAccount(updatedAccount.id, options);
    }

    await recordAuditEvent(
      action === "suspend-account" ? "admin-account-suspended" : "admin-account-resumed",
      adminSession,
      {
        targetAccountId: updatedAccount.id,
        targetEmail: updatedAccount.email
      },
      options
    );

    return {
      ok: true,
      status: 200,
      state: action === "suspend-account" ? "account-suspended" : "account-resumed"
    };
  }

  if (action === "issue-reset-link") {
    const accountId = `${payload.accountId ?? ""}`.trim();
    const targetAccount = await getAdminAccountById(accountId, options);

    if (!targetAccount) {
      return {
        ok: false,
        status: 404,
        state: "account-not-found"
      };
    }

    const { rawToken } = await createAdminInvitation(
      {
        email: targetAccount.email,
        displayName: targetAccount.displayName,
        roleId: targetAccount.roleId,
        purpose: "reset",
        issuedByAccountId: adminSession.accountId,
        resetTargetAccountId: targetAccount.id
      },
      options
    );

    const activationPath = `/admin/activate/${rawToken}/`;

    await recordAuditEvent(
      "admin-password-reset-issued",
      adminSession,
      {
        targetAccountId: targetAccount.id,
        targetEmail: targetAccount.email,
        activationPath
      },
      options
    );

    return {
      ok: true,
      status: 200,
      state: "reset-issued",
      activationPath
    };
  }

  return {
    ok: false,
    status: 400,
    state: "unknown-action"
  };
}

export async function performAdminWorkflowAction(
  {
    adminSession,
    action,
    documentId,
    documentTitle,
    changedFields = [],
    note = "",
    headers
  },
  options = {}
) {
  const capabilityMap = {
    "save-draft": "create-draft",
    "request-review": "request-review",
    approve: "approve-content",
    publish: "publish-content",
    revert: "revert-content"
  };
  const capability = capabilityMap[action];

  if (!capability) {
    return {
      ok: false,
      status: 400,
      state: "unknown-action"
    };
  }

  if (!adminCan(adminSession, capability)) {
    return {
      ok: false,
      status: 403,
      state: "forbidden"
    };
  }

  await recordAuditEvent(
    "admin-workflow-action",
    adminSession,
    {
      action,
      documentId,
      documentTitle,
      changedFields,
      note,
      ...buildRequestFingerprint(headers)
    },
    options
  );

  return {
    ok: true,
    status: 202,
    state: action
  };
}
