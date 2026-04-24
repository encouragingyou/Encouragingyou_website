# Prompt 54 - Credential, Cryptography, and Key Handling

## Protection model

The admin portal now distinguishes clearly between materials that are hashed, encrypted, or stored only in transient form.

## Passwords

Passwords are hashed server-side with Argon2id in `site/src/lib/cms/admin-crypto.js`.

- Algorithm: `argon2id`
- Parameters:
  `memory=65536`, `passes=3`, `parallelism=1`, `tagLength=32`
- Storage format:
  versioned encoded string containing parameters, nonce, and digest

Passwords are never reversibly encrypted and are never returned to the browser after submission.

## Tokens and recovery artifacts

The following materials are hashed with SHA-256 before persistence:

- active session tokens
- pending MFA session tokens
- invitation tokens
- password reset tokens
- recovery codes
- request fingerprints for audit context

That means store compromise does not reveal usable bearer tokens or recovery artifacts directly.

## TOTP secrets

TOTP MFA secrets are encrypted at rest, not hashed, because the server must recover them to verify MFA codes.

- Algorithm:
  `AES-256-GCM`
- Envelope format:
  `v1.<purpose>.<keyId>.<iv>.<ciphertext>.<authTag>`
- Associated data:
  `encouragingyou:<purpose>:v1`
- Active key selection:
  the first configured key in `ADMIN_TOTP_ENCRYPTION_KEYS`

The browser sees the enrollment secret only during invitation activation so the user can register it with an authenticator app. The long-term key ring never leaves the server.

## Audit integrity

Audit events are chained with a rolling SHA-256 hash in `buildAuditChainHash(...)`.

- each event stores `previousHash`
- each event stores its own `hash`
- later tampering changes the downstream chain

This is tamper-evident rather than tamper-proof, which is appropriate for the current file-backed implementation.

## Key handling

`ADMIN_TOTP_ENCRYPTION_KEYS` is a comma-separated key ring of `key-id:base64-key` entries.

- Each key must decode to 32 bytes.
- The first key is the active write key.
- Existing encrypted secrets remain decryptable by their recorded key id.

## Rotation model

1. Add a new 32-byte key to the front of `ADMIN_TOTP_ENCRYPTION_KEYS`.
2. Keep the previous key in the ring so existing accounts still decrypt.
3. Allow new invitations and resets to seal secrets with the new active key.
4. Re-enroll or reset remaining accounts still sealed under the old key.
5. Remove the retired key only after no stored records depend on it.

## Browser boundary

These operations do not happen in the browser:

- password hashing
- session minting
- token hashing
- TOTP secret encryption or decryption
- recovery-code hashing
- audit-chain hashing

The browser only submits credentials over HTTPS and receives opaque session cookies plus one-time enrollment data where necessary.
