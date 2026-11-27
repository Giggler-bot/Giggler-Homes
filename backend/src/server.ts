import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import {
  startPropertyCleanupJobs,
  stopPropertyCleanupJobs,
} from "./jobs/property-cleanup.job.js";

const SHUTDOWN_TIMEOUT_MS = 30_000;

let isShuttingDown = false;
let hasStarted = false;

const server = app.listen(env.port, () => {
  hasStarted = true;

  console.log(`Giggler Homes API running on http://localhost:${env.port}`);

  startPropertyCleanupJobs();
});

// Tune these values to your actual reverse proxy/load balancer.
server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

function closeHttpServer(): Promise<void> {
  if (!server.listening) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

    server.closeIdleConnections();
  });
}

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(
    `[Server] Received ${signal}. Starting graceful shutdown...`,
  );

  let shutdownCompleted = false;

  const forceExit = setTimeout(() => {
    console.error("[Server] Shutdown timed out. Forcing exit.");

    server.closeAllConnections();
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  try {
    // Stop scheduled jobs and close HTTP traffic concurrently.
    const results = await Promise.allSettled([
      stopPropertyCleanupJobs(),
      closeHttpServer(),
    ]);

    let shutdownFailed = false;

    for (const result of results) {
      if (result.status === "rejected") {
        shutdownFailed = true;

        console.error(
          "[Server] Shutdown operation failed:",
          result.reason,
        );
      }
    }

    if (shutdownFailed) {
      // Ensure remaining HTTP connections cannot keep the process alive.
      server.closeAllConnections();
      process.exitCode = 1;
    }

    // Attempt database disconnection even if another shutdown
    // operation failed.
    try {
      await prisma.$disconnect();
      console.log("[Database] Prisma disconnected.");
    } catch (error) {
      shutdownFailed = true;
      process.exitCode = 1;

      console.error(
        "[Database] Failed to disconnect Prisma:",
        error,
      );
    }

    if (!shutdownFailed) {
      shutdownCompleted = true;

      console.log("[Server] Graceful shutdown completed.");
    }
  } catch (error) {
    console.error("[Server] Unexpected shutdown error:", error);

    process.exitCode = 1;
    server.closeAllConnections();
  } finally {
    if (shutdownCompleted) {
      clearTimeout(forceExit);
    }
  }
}

server.on("error", (error) => {
  console.error("[Server] Server error:", error);

  process.exitCode = 1;

  if (hasStarted) {
    void shutdown("server error");
  } else {
    // The server failed to bind before background jobs started.
    void prisma.$disconnect().catch((disconnectError) => {
      console.error(
        "[Database] Failed to disconnect Prisma:",
        disconnectError,
      );
    });
  }
});

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

// An unhandled rejection is treated as a fatal application error.
process.on("unhandledRejection", (reason) => {
  console.error("[Server] Unhandled rejection:", reason);

  process.exitCode = 1;
  void shutdown("unhandledRejection");
});

// Observe uncaught exceptions without overriding Node's default
// behaviour of terminating the process.
process.on("uncaughtExceptionMonitor", (error, origin) => {
  console.error(
    `[Server] Uncaught exception (${origin}):`,
    error,
  );
});
