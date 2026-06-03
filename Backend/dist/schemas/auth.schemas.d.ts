import z from "zod";
export declare const createUserSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    password: z.ZodString;
}, z.z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, z.z.core.$strip>;
//# sourceMappingURL=auth.schemas.d.ts.map