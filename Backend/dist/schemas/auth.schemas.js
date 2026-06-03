import z from "zod";
export const createUserSchema = z.object({
    firstName: z.string().min(3),
    lastName: z.string().min(3),
    email: z.string().email(),
    phone: z.string().length(10),
    password: z.string().min(8),
});
export const loginSchema = z.object({
    email: z.string().email().optional(),
    phone: z.string().length(10).optional(),
    password: z.string().min(8),
}).refine((data) => data.email || data.phone, {
    message: "Either email or phone is required",
    path: ["email"],
});
//# sourceMappingURL=auth.schemas.js.map