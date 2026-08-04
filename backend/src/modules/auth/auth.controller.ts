import type { NextFunction, Request, Response } from "express";

import { registerSchema } from "./auth.validation.js";
import { registerUser, loginUser, getCurrentUser } from "./auth.services.js";
import { loginSchema } from "./auth.validation.js";
import { success } from "zod";
import { AppError } from "../../common/errors/AppError.js";

export async function registerController(
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

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);

    const result = await loginUser(input);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMeController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication is required", 401);
    }

    const user = await getCurrentUser(
      req.user.id,
    );

    res.status(200).json({
      success: true,
      message: "Current user retrieved successfully",
      data: {
        user,
      },
    });

  } catch (error) {
    next(error);
  }
}
