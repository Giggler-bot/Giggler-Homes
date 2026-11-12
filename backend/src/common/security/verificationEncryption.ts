import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  type DecipherGCM,
} from "node:crypto";

import { env } from "../../config/env.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const VERSION_PREFIX = "enc:v1";

export function encryptVerificationNumber(value: string): string {
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, env.verificationEncryptionKey, iv);

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    VERSION_PREFIX,
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}


export function decryptVerificationNumber(value: string): string {
  const [
    prefix,
    version,
    ivEncoded,
    authTagEncoded,
    encryptedEncoded,
    ...extra
  ] = value.split(":");

  if (
    prefix !== "enc" ||
    version !== "v1" ||
    !ivEncoded ||
    !authTagEncoded ||
    !encryptedEncoded ||
    extra.length > 0
  ) {
    throw new Error("Invalid or unsupported encrypted verification number");
  }

  const iv = Buffer.from(ivEncoded, "base64");
  const authTag = Buffer.from(authTagEncoded, "base64");
  const encrypted = Buffer.from(encryptedEncoded, "base64");

  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted verification number format");
  }

  const decipher: DecipherGCM = createDecipheriv(
    ALGORITHM,
    env.verificationEncryptionKey,
    iv,
  );

  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}
