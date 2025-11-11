import z from "zod";

export const createBookSchema = z.object({
  title: z.string().min(2, "Title too short."),
  description: z.string().min(3, "Description too short."),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ObjectId format."),
  author: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid author ObjectId format."),
  coverBook: z.file().mime(["image/jpeg", "image/png", "image/webp"]).max(2_000_000).optional(),
  price: z.preprocess((val) => Number(val), z.number().nonnegative()),
  discounts: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid discount ObjectId format.")
    .optional(),
  stock: z.preprocess((val) => Number(val), z.number().nonnegative().default(0)),
  reviews: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid review ObjectId format.")).optional(),
});
