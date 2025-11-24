import z from "zod";

export const baseSaleSchema = z.object({
  name: z.string().min(3, "Sale name is too short."),
  description: z.string().min(3, "Description too short."),
  discountPercentage: z.preprocess((data) => Number(data), z.number().min(0).max(100)),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  books: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid book ObjectId format.")).min(1, "Sale must contain at least 1 book."),
  isActive: z.boolean().optional(),
});

const withDateRefine = baseSaleSchema.refine(
  (data) => {
    if (!data.startDate || !data.endDate) {
      return true;
    }

    return data.startDate < data.endDate;
  },
  { error: "Start date must be before end date.", path: ["startDate"] }
);

export const createSaleSchema = withDateRefine.safeExtend({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const updateSaleSchema = withDateRefine.partial();
