import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { notFound } from "./middleware/notfound.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { prisma } from "./lib/prisma.js";

const app = express();

// security middleware
app.use(helmet());

app.use(
    cors({
        origin: env.frontendUrl,
    }),
);

app.use(compression());

// logging middleware
app.use(morgan("dev"));

app.use(express.json());

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Giggler Homes Api is running successfully",
        env: env.nodeEnv,
    });
});

app.get("/api/v1/health/database", async(req, res, next) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
            success: true,
            message: "Database connection is working",
        });
    } catch (error) {
        next(error);
    }
})

// Handles routes that are not found
app.use(notFound);

// Handles errors
app.use(errorHandler);

export default app;