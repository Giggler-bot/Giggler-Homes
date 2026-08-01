import "dotenv/config";


function getRequiredEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(
        `Missing required environment variable: ${name}`,
    );
    }
    return value;
    
}

const PORT = Number(process.env.PORT) || 5000;

export const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: PORT,
    frontendUrl: process.env.frontend_url || "http://localhost:5173",
    databaseUrl: getRequiredEnv("DATABASE_URL"),
    
}