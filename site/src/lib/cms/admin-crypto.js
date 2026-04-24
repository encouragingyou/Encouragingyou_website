import { Buffer } from "node:buffer";
import {
  argon2,
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual
} from "node:crypto";
import { promisify } from "node:util";

const argon2Async = promisify(argon2);

const ARGON2_PARAMS = {
  memory: 65_536,
  passes: 3,
  parallelism: 1,
  tagLength: 32
};

function normalizePassword(value) {
  return `${value ?? ""}`.normalize("NFKC");
}

function parsePasswordHash(storedHash) {
  const parts = `${storedHash ?? ""}`.split("$");

  if (parts.length !== 5 || parts[0] !== "argon2id" || parts[1] !== "v=1") {
    return null;
  }

  const params = Object.fromEntries(
    parts[2]
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => entry.split("="))
  );

  return {
    memory: Number(params.m),
    passes: Number(params.t),
    parallelism: Number(params.p),
    tagLength: Number(params.l),
    nonce: Buffer.from(parts[3], "base64url"),
    digest: Buffer.from(parts[4], "base64url")
  };
}

export async function hashPassword(password) {
  const normalizedPassword = normalizePassword(password);
  const nonce = randomBytes(16);
  const digest = await argon2Async("argon2id", {
    message: Buffer.from(normalizedPassword, "utf8"),
    nonce,
    memory: ARGON2_PARAMS.memory,
    passes: ARGON2_PARAMS.passes,
    parallelism: ARGON2_PARAMS.parallelism,
    tagLength: ARGON2_PARAMS.tagLength
  });

  return [
    "argon2id",
    "v=1",
    `m=${ARGON2_PARAMS.memory},t=${ARGON2_PARAMS.passes},p=${ARGON2_PARAMS.parallelism},l=${ARGON2_PARAMS.tagLength}`,
    nonce.toString("base64url"),
    Buffer.from(digest).toString("base64url")
  ].join("$");
}

export async function verifyPassword(password, storedHash) {
  const parsedHash = parsePasswordHash(storedHash);

  if (!parsedHash) {
    return false;
  }

  const digest = await argon2Async("argon2id", {
    message: Buffer.from(normalizePassword(password), "utf8"),
    nonce: parsedHash.nonce,
    memory: parsedHash.memory,
    passes: parsedHash.passes,
    parallelism: parsedHash.parallelism,
    tagLength: parsedHash.tagLength
  });

  const computedDigest = Buffer.from(digest);

  return (
    computedDigest.length === parsedHash.digest.length &&
    timingSafeEqual(computedDigest, parsedHash.digest)
  );
}

export function generateOpaqueToken(size = 32) {
  return randomBytes(size).toString("base64url");
}

export function hashOpaqueToken(token) {
  return createHash("sha256")
    .update(`${token ?? ""}`, "utf8")
    .digest("hex");
}

export function hashFingerprint(value) {
  return createHash("sha256")
    .update(`${value ?? ""}`, "utf8")
    .digest("hex");
}

function getKeyById(keyRing, keyId) {
  return keyRing.find((entry) => entry.id === keyId) ?? null;
}

export function sealAdminSecret(secret, keyRing, purpose = "totp") {
  if (!Array.isArray(keyRing) || keyRing.length === 0) {
    throw new Error("Admin encryption keys are not configured.");
  }

  const [activeKey] = keyRing;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", activeKey.key, iv);
  const aad = Buffer.from(`encouragingyou:${purpose}:v1`, "utf8");

  cipher.setAAD(aad);

  const ciphertext = Buffer.concat([
    cipher.update(`${secret ?? ""}`, "utf8"),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  return [
    "v1",
    purpose,
    activeKey.id,
    iv.toString("base64url"),
    ciphertext.toString("base64url"),
    authTag.toString("base64url")
  ].join(".");
}

export function openAdminSecret(sealedSecret, keyRing) {
  const parts = `${sealedSecret ?? ""}`.split(".");

  if (parts.length !== 6 || parts[0] !== "v1") {
    throw new Error("Invalid admin secret envelope.");
  }

  const [, purpose, keyId, rawIv, rawCiphertext, rawAuthTag] = parts;
  const keyEntry = getKeyById(keyRing, keyId);

  if (!keyEntry) {
    throw new Error(`Missing admin key ${keyId}.`);
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    keyEntry.key,
    Buffer.from(rawIv, "base64url")
  );

  decipher.setAAD(Buffer.from(`encouragingyou:${purpose}:v1`, "utf8"));
  decipher.setAuthTag(Buffer.from(rawAuthTag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(rawCiphertext, "base64url")),
    decipher.final()
  ]).toString("utf8");
}

export function generateRecoveryCodes(count = 8) {
  return Array.from({ length: count }, () => {
    const raw = randomBytes(5)
      .toString("base64url")
      .replace(/[^A-Z0-9]/giu, "");

    return `${raw.slice(0, 4).toUpperCase()}-${raw.slice(4, 8).toUpperCase()}`;
  });
}

export function hashRecoveryCode(value) {
  return createHash("sha256")
    .update(`${value ?? ""}`.replace(/[^A-Z0-9]/giu, "").toUpperCase(), "utf8")
    .digest("hex");
}

export function buildAuditChainHash(previousHash, eventRecord) {
  return createHash("sha256")
    .update(`${previousHash ?? ""}|${JSON.stringify(eventRecord)}`, "utf8")
    .digest("hex");
}
