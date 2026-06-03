import jwt from "jsonwebtoken";
import { prisma } from "../db/db.js";
import AppError from "../utils/error.utils.js";
import { tryCatch } from "../utils/tryCatch.js";
export const isAuthenticated = tryCatch(async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        throw new AppError("Not authenticated, please login", 401);
    }
    const jwtSecret = process.env.JWT_SECRET || "fallback-secret-key";
    let decoded;
    try {
        decoded = jwt.verify(token, jwtSecret);
    }
    catch (error) {
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
        },
    });
    if (!user) {
        throw new AppError("User not found", 404);
    }
    req.user = user;
    next();
});
//# sourceMappingURL=auth.middleware.js.map