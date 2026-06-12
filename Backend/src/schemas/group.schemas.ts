import z from "zod";
import { PropertyGroupStatus } from "@prisma/client";

export const createGroupSchema = z.object({
  propertyId: z.string().uuid("Property ID must be a valid UUID"),
  rmId: z.string().uuid("RM ID must be a valid UUID"),
  name: z.string().min(3, "Group name must be at least 3 characters"),
  minGroupSize: z.coerce.number().int().positive("Min group size must be positive"),
  targetGroupSize: z.coerce.number().int().positive("Target group size must be positive"),
  targetDiscount: z.coerce.number().positive("Target discount must be positive"),
  status: z.nativeEnum(PropertyGroupStatus).optional().default(PropertyGroupStatus.GROUP_FORMING),
});

export const updateGroupSchema = createGroupSchema.partial();
