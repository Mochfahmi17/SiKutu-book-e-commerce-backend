import z from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(3, "Category name too short."),
});

export const updateCategorySchema = createCategorySchema.partial();
