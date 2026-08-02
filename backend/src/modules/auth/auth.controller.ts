import type {
  NextFunction,
  Request,
  Response
} from "express";

import { registerSchema } from "./auth.validation.js";
import { registerUser } from "./auth.services.js";

export async function registercontroller(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);

    const user = await registerUser(input);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
      },
    });

  } catch (error) {
    next(error);
  }
}