
import { rateLimit } from "express-rate-limit";

export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,

  // Each authenticated user gets an independent limit.
  keyGenerator: (req) => req.user!.id,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many upload requests. Please try again later.",
    });
  },
});
