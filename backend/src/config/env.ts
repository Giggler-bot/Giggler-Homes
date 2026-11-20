
import "dotenv/config";

// -----------------------------------------------------------------------------
// Environment variable helpers
// -----------------------------------------------------------------------------

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getSecretEnv(name: string, minLength = 32): string {
  const value = getRequiredEnv(name);

  if (
    Buffer.byteLength(value, "utf8") < minLength ||
    /^your[_-]/i.test(value)
  ) {
    throw new Error(
      `${name} must be a real secret of at least ${minLength} bytes`,
    );
  }

  return value;
}

function getIntEnv(
  name: string,
  defaultValue: number,
  min = 1,
  max = Number.MAX_SAFE_INTEGER,
): number {
  const raw = process.env[name]?.trim();

  if (!raw) {
    return defaultValue;
  }

  const value = Number(raw);

  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(
      `${name} must be an integer between ${min} and ${max}, but got: ${raw}`,
    );
  }

  return value;
}

function getUrlEnv(name: string, defaultValue: string): string {
  const value = process.env[name]?.trim() || defaultValue;

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error(`${name} must use HTTP or HTTPS`);
  }

  return value.replace(/\/+$/, "");
}

// -----------------------------------------------------------------------------
// Node environment
// -----------------------------------------------------------------------------

const nodeEnv = process.env.NODE_ENV?.trim() || "development";

if (!["development", "test", "production"].includes(nodeEnv)) {
  throw new Error(
    `NODE_ENV must be development, test or production, but got: ${nodeEnv}`,
  );
}

// -----------------------------------------------------------------------------
// Verification encryption key
// -----------------------------------------------------------------------------

const verificationEncryptionKey = getRequiredEnv(
  "VERIFICATION_ENCRYPTION_KEY",
);

const decodedEncryptionKey = Buffer.from(
  verificationEncryptionKey,
  "base64",
);

if (
  decodedEncryptionKey.length !== 32 ||
  decodedEncryptionKey.toString("base64") !== verificationEncryptionKey
) {
  throw new Error(
    "VERIFICATION_ENCRYPTION_KEY must be a valid Base64-encoded 32-byte key",
  );
}

// -----------------------------------------------------------------------------
// JWT configuration
// -----------------------------------------------------------------------------

const jwtAccessSecret = getSecretEnv("JWT_ACCESS_SECRET");

const jwtAccessExpiresIn =
  process.env.JWT_ACCESS_EXPIRES_IN?.trim() || "15m";

if (!/^[1-9]\d*[smhd]$/.test(jwtAccessExpiresIn)) {
  throw new Error(
    'JWT_ACCESS_EXPIRES_IN must be a positive duration like "15m", "1h" or "7d"',
  );
}

// -----------------------------------------------------------------------------
// Application configuration
// -----------------------------------------------------------------------------

const port = getIntEnv("PORT", 5000, 1, 65535);

const propertyRetentionDays = getIntEnv(
  "PROPERTY_RETENTION_DAYS",
  30,
);

const bcryptSaltRounds = getIntEnv(
  "BCRYPT_SALT_ROUNDS",
  12,
  10,
  15,
);

const frontendUrl = getUrlEnv(
  "FRONTEND_URL",
  "http://localhost:5173",
);

// -----------------------------------------------------------------------------
// Export validated environment configuration
// -----------------------------------------------------------------------------

export const env = {
  nodeEnv: nodeEnv as "development" | "test" | "production",

  port,

  frontendUrl,

  databaseUrl: getRequiredEnv("DATABASE_URL"),

  jwtAccessSecret,
  jwtAccessExpiresIn,

  bcryptSaltRounds,

  verificationEncryptionKey: decodedEncryptionKey,

  propertyRetentionDays,

  cloudinaryCloudName: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: getRequiredEnv("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: getRequiredEnv("CLOUDINARY_API_SECRET"),
};
