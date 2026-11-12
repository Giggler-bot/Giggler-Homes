
import test from "node:test";
import assert from "node:assert/strict";

import {
  encryptVerificationNumber,
  decryptVerificationNumber,
} from "../src/common/security/verificationEncryption.js";

test("encrypts and decrypts an identity number", () => {
  const original = "GHA-123456789-0";

  const encrypted = encryptVerificationNumber(original);
  const decrypted = decryptVerificationNumber(encrypted);

  assert.notEqual(encrypted, original);
  assert.ok(encrypted.startsWith("enc:v1:"));
  assert.equal(decrypted, original);
});

test("generates different ciphertext for the same identity number", () => {
  const original = "GHA-123456789-0";

  const first = encryptVerificationNumber(original);
  const second = encryptVerificationNumber(original);

  assert.notEqual(first, second);
  assert.equal(decryptVerificationNumber(first), original);
  assert.equal(decryptVerificationNumber(second), original);
});

test("rejects tampered ciphertext", () => {
  const encrypted = encryptVerificationNumber("GHA-123456789-0");
  const parts = encrypted.split(":");

  const ciphertext = Buffer.from(parts[4], "base64");

  // Change one byte in the encrypted data.
  ciphertext[0] ^= 1;

  parts[4] = ciphertext.toString("base64");

  assert.throws(() => decryptVerificationNumber(parts.join(":")));
});


test("rejects an unsupported encryption version", () => {
  const encrypted = encryptVerificationNumber("GHA-123456789-0");
  const unsupported = encrypted.replace("enc:v1:", "enc:v2:");

  assert.throws(() => decryptVerificationNumber(unsupported));
});
