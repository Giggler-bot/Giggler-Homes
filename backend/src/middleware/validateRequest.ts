import type { RequestHandler } from "express";
import { z } from "zod";

export function validateRequest<T extends z.ZodTypeAny>(
  schema: T,
): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      next(result.error);
      return;
    }

    const data = result.data as Partial<{
      body: unknown;
      params: unknown;
      query: Record<string, unknown>;
    }>;

    if (data.body !== undefined) req.body = data.body as typeof req.body;
    if (data.params !== undefined)
      req.params = data.params as typeof req.params;
    if (data.query !== undefined) {
      Object.defineProperty(req, "query", {
        value: data.query,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    next();
  };
}

