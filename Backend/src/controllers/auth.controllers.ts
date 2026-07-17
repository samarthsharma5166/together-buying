import type { Request, Response, NextFunction } from "express"

import { tryCatch } from "../utils/tryCatch.js";
import AppError from "../utils/error.utils.js";
import { createUserSchema, loginSchema, updateUserSchema } from "../schemas/auth.schemas.js";
import { prisma } from "../db/db.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
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
    },
    include: {
      subscriptions: {
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
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
      subscriptions: user.subscriptions,
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

export const updateProfile = tryCatch(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;

  const result = updateUserSchema.safeParse(req.body);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || "Validation failed", 400);
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    password
  } = result.data;

  // Check unique constraints if email or phone is updated
  if (email || phone) {
    const conflicts = await prisma.user.findFirst({
      where: {
        id: { not: userId },
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      }
    });

    if (conflicts) {
      throw new AppError("Email or phone number is already registered to another user", 400);
    }
  }

  const updateData: any = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (addressLine1 !== undefined) updateData.addressLine1 = addressLine1;
  if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2;
  if (city !== undefined) updateData.city = city;
  if (state !== undefined) updateData.state = state;
  if (pincode !== undefined) updateData.pincode = pincode;

  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      pincode: true,
      subscriptions: {
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    }
  });

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: updatedUser
  });
});