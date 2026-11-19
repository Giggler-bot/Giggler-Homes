import app from "./app.js";
import { env } from "./config/env.js";
import { startPropertyCleanupJobs } from "./jobs/property-cleanup.job.js";

startPropertyCleanupJobs();

app.listen(env.port, () => {
    console.log(`Giggler Homes Api running on http://localhost:${env.port}`);
});

