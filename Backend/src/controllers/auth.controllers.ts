import type { Request, Response, NextFunction } from "express"

import { tryCatch } from "../utils/tryCatch.js";
import AppError from "../utils/error.utils.js";
import { createUserSchema } from "../schemas/auth.schemas.js";
import { prisma } from "../db/db.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import { loginSchema } from "../schemas/auth.schemas.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const register = tryCatch(async (req, res, next) => {
  const result = createUserSchema.safeParse(req.body);  

    if (!result.success) {
        // This error will be automatically caught by tryCatch and passed to errorMiddleware
        throw new AppError(result.error.issues[0]?.message || "Validation failed", 400); 
    }

    const {firstName,lastName,email,phone,password}=result.data
    const userExist = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { phone }
            ]
        }
    });

    if (userExist) {
      throw new AppError("User with this email or phone already exists", 400);
    }

    const hashPassword = await bcrypt.hash(password,10)

    const user = await prisma.user.create({
            data:{
            firstName,
            lastName,
            email,
            phone,
            password:hashPassword
            }
    })

    res.status(201).json({
        success: true,
        message: "User registered successfully"
    });
});

export const login = tryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || "Validation failed", 400);
  }

  const { email, phone, password } = result.data;

  // Find user by email or phone
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : [])
      ]
    }
  });

  if (!user) {
    throw new AppError("Invalid email/phone or password", 401);
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email/phone or password", 401);
  }

  // Generate JWT token
  const jwtSecret = process.env.JWT_SECRET || "fallback-secret-key";
  const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: "7d" });

  // Send cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

export const logout = tryCatch(async (req: Request, res: Response, next: NextFunction) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

export const me = tryCatch(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError("User profile not found", 404);
  }

  res.status(200).json({
    success: true,
    user: req.user,
  });
});