import { Buffer } from "node:buffer";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function normalizeBase32(value) {
  return `${value ?? ""}`.toUpperCase().replace(/[^A-Z2-7]/gu, "");
}

function encodeBase32(buffer) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

export function decodeBase32(value) {
  const normalized = normalizeBase32(value);

  if (!normalized) {
    throw new Error("Missing TOTP secret.");
  }

  let bits = 0;
  let aggregate = 0;
  const bytes = [];

  for (const character of normalized) {
    const index = BASE32_ALPHABET.indexOf(character);

    if (index === -1) {
      throw new Error("Invalid TOTP secret.");
    }

    aggregate = (aggregate << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((aggregate >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

export function generateTotpSecret(byteLength = 20) {
  return encodeBase32(randomBytes(byteLength));
}

export function formatTotpSecret(secret) {
  return normalizeBase32(secret)
    .replace(/(.{4})/gu, "$1 ")
    .trim();
}

export function normalizeTotpCode(value) {
  return `${value ?? ""}`.replace(/\D/gu, "");
}

function generateHotp(secretBytes, counter, digits = 6) {
  const counterBuffer = Buffer.alloc(8);

  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac("sha1", secretBytes).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return `${code % 10 ** digits}`.padStart(digits, "0");
}

export function generateTotpCode({ secret, now = Date.now(), period = 30, digits = 6 }) {
  const secretBytes = decodeBase32(secret);
  const counter = Math.floor(now / 1000 / period);

  return generateHotp(secretBytes, counter, digits);
}

export function verifyTotpCode({
  secret,
  code,
  now = Date.now(),
  period = 30,
  digits = 6,
  window = 1
}) {
  const normalizedCode = normalizeTotpCode(code);

  if (normalizedCode.length !== digits) {
    return false;
  }

  const secretBytes = decodeBase32(secret);
  const currentCounter = Math.floor(now / 1000 / period);

  for (let offset = -window; offset <= window; offset += 1) {
    const candidate = generateHotp(secretBytes, currentCounter + offset, digits);

    if (
      timingSafeEqual(Buffer.from(candidate, "utf8"), Buffer.from(normalizedCode, "utf8"))
    ) {
      return true;
    }
  }

  return false;
}

export function buildTotpOtpAuthUrl({ secret, email, issuer = "EncouragingYou CMS" }) {
  const label = `${issuer}:${email}`.replace(/\s+/gu, " ").trim();
  const url = new URL(`otpauth://totp/${encodeURIComponent(label)}`);

  url.searchParams.set("secret", normalizeBase32(secret));
  url.searchParams.set("issuer", issuer);
  url.searchParams.set("digits", "6");
  url.searchParams.set("period", "30");

  return url.toString();
}
