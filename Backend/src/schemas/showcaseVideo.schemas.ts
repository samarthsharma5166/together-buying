import z from "zod";

export const createShowcaseVideoSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  subtitle: z.string().min(2, "Subtitle must be at least 2 characters"),
  videoUrl: z.string().optional().nullable(),
  posterUrl: z.string().optional().nullable(),
  sortOrder: z.preprocess((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const parsed = Number(val);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, z.number().int().optional()),
});

export const updateShowcaseVideoSchema = createShowcaseVideoSchema.partial().extend({
  isActive: z.preprocess((val) => {
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
});
