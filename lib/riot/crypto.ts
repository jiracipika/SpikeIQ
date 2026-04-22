import "server-only";
import { createCipheriv, randomBytes } from "node:crypto";

const TOKEN_PREFIX = "enc:v1";
const KEY_BYTES = 32; // AES-256
const IV_BYTES = 12; // GCM nonce length

interface EncryptOptions {
  allowPlaintextFallback: boolean;
}

export function encryptTokenForStorage(value: string | null, options: EncryptOptions): string | null {
  if (!value) return null;

  const key = parseEncryptionKey(process.env.RIOT_TOKEN_ENCRYPTION_KEY ?? "");
  if (!key) {
    if (options.allowPlaintextFallback) {
      return value;
    }
    throw new Error(
      "Missing RIOT_TOKEN_ENCRYPTION_KEY. Configure a 32-byte base64 key to store Riot tokens securely.",
    );
  }

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${TOKEN_PREFIX}:${toBase64Url(iv)}:${toBase64Url(tag)}:${toBase64Url(ciphertext)}`;
}

function parseEncryptionKey(raw: string): Buffer | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const decoded = Buffer.from(padded, "base64");

  if (decoded.length !== KEY_BYTES) {
    throw new Error(
      `RIOT_TOKEN_ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes (got ${decoded.length}).`,
    );
  }
  return decoded;
}

function toBase64Url(buffer: Buffer): string {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
