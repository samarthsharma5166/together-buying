import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db/db.js";
import AppError from "../utils/error.utils.js";
import { tryCatch } from "../utils/tryCatch.js";
import type { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    phone: string;
    role: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    subscriptions?: Array<{
      id: string;
      status: string;
      expiresAt: Date | null;
      createdAt: Date;
    }>;
  };
}

interface JWTPayload {
  id: string;
}

export const isAuthenticated = tryCatch(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    throw new AppError("Not authenticated, please login", 401);
  }

  const jwtSecret = process.env.JWT_SECRET || "fallback-secret-key";
  let decoded: JWTPayload;

  try {
    decoded = jwt.verify(token, jwtSecret) as JWTPayload;
  } catch (error) {
    throw new AppError("Invalid or expired session token, please login again", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
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
    },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  req.user = user;
  console.log(req.user)
  next();
});



export const authorizedRoles=(...roles:Array<"USER" | "BUYER_PREMIUM" | "RM" | "ADMIN" |"SUPER_ADMIN">)=>async(req:AuthenticatedRequest,res:Response,next:NextFunction)=>{
      console.log("authorizedRoles called");
    console.log("User role:", req.user?.role);
    console.log("Allowed roles:", roles);
  const currentUserRoles = req.user?.role as "USER" | "BUYER_PREMIUM" | "RM" | "ADMIN" |"SUPER_ADMIN";
  if(!currentUserRoles || !roles.includes(currentUserRoles)){
    return next(
     new AppError("you do not have permission to access this routes",403)
    )
  }
  next();
}
