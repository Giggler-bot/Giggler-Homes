import "dotenv/config";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getNumberEnv(name: string, defaultvalue: number): number {
  const value = process.env[name];
  if (!value) {
    return defaultvalue;
  }
  const numbervalue = Number(value);
  if (isNaN(numbervalue)) {
    throw new Error(
      `Environment variable ${name} must be a number, but got: ${value}`,
    );
  }
  return numbervalue;
}

const verificationEncryptionKey = getRequiredEnv("VERIFICATION_ENCRYPTION_KEY");

const decodedEncryptionKey = Buffer.from(verificationEncryptionKey, "base64");

if (
  decodedEncryptionKey.length !== 32 ||
  decodedEncryptionKey.toString("base64") !== verificationEncryptionKey
) {
  throw new Error(
    "VERIFICATION_ENCRYPTION_KEY must be a valid Base64-encoded 32-byte key",
  )
}
  export const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: getNumberEnv("PORT", 5000),
    frontendUrl: process.env.frontend_url || "http://localhost:5173",
    databaseUrl: getRequiredEnv("DATABASE_URL"),
    jwtAccessSecret: getRequiredEnv("JWT_ACCESS_SECRET"),
    verificationEncryptionKey: decodedEncryptionKey,
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    bcryptSaltRounds: getNumberEnv("BCRYPT_SALT_ROUNDS", 12),
    cloudinaryCloudName: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
    cloudinaryApiKey: getRequiredEnv("CLOUDINARY_API_KEY"),
    cloudinaryApiSecret: getRequiredEnv("CLOUDINARY_API_SECRET"),
  };
