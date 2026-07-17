import z from "zod";

export const createSubscriptionPlanSchema = z.object({
  type: z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "LIFE_TIME"]),
  price: z.number().positive("Price must be a positive number"),
});

export const updateSubscriptionPlanSchema = createSubscriptionPlanSchema.partial();
