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

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: getNumberEnv("PORT", 5000),
  frontendUrl: process.env.frontend_url || "http://localhost:5173",
  databaseUrl: getRequiredEnv("DATABASE_URL"),
  jwtAccessSecret: getRequiredEnv("JWT_ACCESS_SECRET"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  bcryptSaltRounds: getNumberEnv("BCRYPT_SALT_ROUNDS", 12),
};
