import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { resolveDeploymentChannel } from "../deployment/context.js";
import { isSecureTransport } from "../security/policy.js";

export const adminSessionKinds = {
  active: "active",
  pendingMfa: "pending-mfa"
};

export const adminCookieBaseNames = {
  session: "ey-admin-session",
  pendingMfa: "ey-admin-mfa"
};

export const adminFixtureAccounts = Object.freeze([
  {
    email: "publisher@encouragingyou.local",
    displayName: "Local Publisher",
    roleId: "publisher",
    password: "LocalOnly!Publisher54",
    totpSecret: "JBSWY3DPEHPK3PXP",
    recoveryCodes: ["PUBL-5H4M", "PUBL-8Q2K", "PUBL-1T7N", "PUBL-9C6R"]
  },
  {
    email: "maintainer@encouragingyou.local",
    displayName: "Local Maintainer",
    roleId: "technical-maintainer",
    password: "LocalOnly!Maintainer54",
    totpSecret: "KRSXG5BRGIZTINJW",
    recoveryCodes: ["MAIN-7D3P", "MAIN-4L8Q", "MAIN-6N2W", "MAIN-9F5T"]
  },
  {
    email: "editor@encouragingyou.local",
    displayName: "Local Client Editor",
    roleId: "client-editor",
    password: "LocalOnly!Editor54",
    totpSecret: "MFRGGZDFMZTWQ2LK",
    recoveryCodes: ["EDIT-3S6J", "EDIT-8V4M", "EDIT-5K7R", "EDIT-2P9X"]
  }
]);

function normalizeBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  return !["0", "false", "no", "off"].includes(`${value}`.trim().toLowerCase());
}

function normalizeAbsoluteUrl(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).toString();
  } catch {
    return null;
  }
}

function parseInteger(value, defaultValue) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : defaultValue;
}

function deriveLocalFallbackKey(seed) {
  return createHash("sha256").update(seed).digest();
}

function parseKeyRing(value) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry, index) => {
      const [rawId, rawKey] = entry.includes(":")
        ? entry.split(/:(.+)/u)
        : [`key-${index + 1}`, entry];
      const key = Buffer.from(rawKey, "base64");

      if (key.length !== 32) {
        throw new Error(`Admin key ${rawId} must decode to 32 bytes.`);
      }

      return {
        id: rawId.trim() || `key-${index + 1}`,
        key
      };
    });
}

export function resolveAdminPortalEnabled(env = globalThis.process?.env ?? {}) {
  return normalizeBoolean(env.ADMIN_PORTAL_ENABLED, true);
}

export function resolveAdminDevBootstrapEnabled({
  env = globalThis.process?.env ?? {},
  deploymentChannel = resolveDeploymentChannel()
} = {}) {
  if (!["local", "ci"].includes(deploymentChannel)) {
    return false;
  }

  return normalizeBoolean(env.ADMIN_ENABLE_DEV_BOOTSTRAP, false);
}

export function resolveAdminStorageDir({
  storageDir = globalThis.process?.env?.ADMIN_STORAGE_DIR,
  deploymentChannel = resolveDeploymentChannel()
} = {}) {
  if (deploymentChannel === "preview" || deploymentChannel === "ci") {
    return resolve(tmpdir(), "encouragingyou", deploymentChannel, "admin");
  }

  return storageDir ?? resolve(globalThis.process?.cwd?.() ?? ".", "var/admin");
}

export function resolveAdminKeyRing({
  env = globalThis.process?.env ?? {},
  deploymentChannel = resolveDeploymentChannel()
} = {}) {
  const configuredKeyRing = parseKeyRing(env.ADMIN_TOTP_ENCRYPTION_KEYS);

  if (configuredKeyRing.length > 0) {
    return configuredKeyRing;
  }

  if (["local", "ci"].includes(deploymentChannel)) {
    return [
      {
        id: "local-dev-key",
        key: deriveLocalFallbackKey("encouragingyou:admin-totp-encryption-key:2026-04-24")
      }
    ];
  }

  return [];
}

export function isAdminCryptoReady(options = {}) {
  return resolveAdminKeyRing(options).length > 0;
}

export function resolveAdminAuthPolicy(env = globalThis.process?.env ?? {}) {
  return {
    sessionIdleMinutes: parseInteger(env.ADMIN_SESSION_IDLE_MINUTES, 30),
    sessionAbsoluteHours: parseInteger(env.ADMIN_SESSION_ABSOLUTE_HOURS, 8),
    pendingMfaMinutes: parseInteger(env.ADMIN_PENDING_MFA_MINUTES, 10),
    invitationExpiryHours: parseInteger(env.ADMIN_INVITATION_EXPIRY_HOURS, 168),
    loginLockoutMinutes: parseInteger(env.ADMIN_LOGIN_LOCKOUT_MINUTES, 15),
    maxFailedPasswords: parseInteger(env.ADMIN_MAX_FAILED_PASSWORDS, 5),
    recentAuthMinutes: parseInteger(env.ADMIN_RECENT_AUTH_MINUTES, 10),
    maxConcurrentSessions: parseInteger(env.ADMIN_MAX_CONCURRENT_SESSIONS, 5),
    passwordMinimumLength: parseInteger(env.ADMIN_PASSWORD_MIN_LENGTH, 12)
  };
}

export function resolveAdminCookieNames({ requestUrl, headers }) {
  const secure = requestUrl
    ? isSecureTransport(requestUrl, headers)
    : normalizeBoolean(globalThis.process?.env?.FORCE_SECURE_COOKIES, false);
  const prefix = secure ? "__Host-" : "";

  return {
    session: `${prefix}${adminCookieBaseNames.session}`,
    pendingMfa: `${prefix}${adminCookieBaseNames.pendingMfa}`
  };
}

export function resolveAdminCookieOptions({ requestUrl, headers, maxAge, path = "/" }) {
  const secure = isSecureTransport(requestUrl, headers);

  return {
    path,
    httpOnly: true,
    sameSite: "strict",
    secure,
    maxAge
  };
}

export function resolveAdminOriginUrl({
  requestUrl,
  headers,
  env = globalThis.process?.env ?? {}
}) {
  const configuredOrigin = normalizeAbsoluteUrl(env.ADMIN_ORIGIN_URL);

  if (configuredOrigin) {
    return configuredOrigin;
  }

  const forwardedHost = headers?.get("x-forwarded-host");
  const host = forwardedHost ?? headers?.get("host");

  if (host) {
    const protocol = (
      headers?.get("x-forwarded-proto") ?? new URL(requestUrl).protocol
    ).replace(/:$/u, "");

    return `${protocol}://${host}`;
  }

  return new URL(requestUrl).origin;
}

export function resolveAdminAllowedOrigins({
  requestUrl,
  headers,
  env = globalThis.process?.env ?? {},
  deploymentChannel = resolveDeploymentChannel()
} = {}) {
  const origins = new Set();
  const primaryOrigin = resolveAdminOriginUrl({
    requestUrl,
    headers,
    env
  });

  if (primaryOrigin) {
    origins.add(primaryOrigin);
  }

  const configuredOrigins = `${env.ADMIN_ADDITIONAL_ALLOWED_ORIGINS ?? ""}`
    .split(",")
    .map((entry) => normalizeAbsoluteUrl(entry))
    .filter(Boolean);

  for (const origin of configuredOrigins) {
    origins.add(origin);
  }

  if (["local", "ci"].includes(deploymentChannel)) {
    origins.add("http://127.0.0.1:4173");
    origins.add("http://localhost:4173");
    origins.add("http://127.0.0.1:4321");
    origins.add("http://localhost:4321");
  }

  return [...origins];
}

export function isAdminMfaRequired(roleId) {
  return ["client-editor", "publisher", "technical-maintainer"].includes(roleId);
}

export function getLocalAdminBootstrapFixtures() {
  return adminFixtureAccounts;
}
