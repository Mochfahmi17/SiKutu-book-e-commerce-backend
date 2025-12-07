import z from "zod";

export const createBookSchema = z.object({
  title: z.string({ error: "Title is required." }).min(2, "Title too short."),
  description: z.string({ error: "Description is required." }).min(3, "Description too short."),
  category: z.string({ error: "Category is required." }).regex(/^[0-9a-fA-F]{24}$/, "Invalid category ObjectId format."),
  author: z.string({ error: "Author is  required." }).regex(/^[0-9a-fA-F]{24}$/, "Invalid author ObjectId format."),
  coverBook: z.union([z.file().mime(["image/jpeg", "image/png", "image/webp"]).max(2_000_000), z.undefined()]).optional(),
  price: z.preprocess((val) => Number(val), z.number().nonnegative()),
  sales: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid discount ObjectId format.")
    .optional(),
  stock: z.preprocess((val) => Number(val), z.number().nonnegative().default(0)),
  language: z.string({ error: "Language is required." }),
  releaseDate: z.coerce.date({ error: (issue) => (issue.input === undefined ? "Release Date is required." : "Invalid release date") }),
  reviews: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid review ObjectId format.")).optional(),
});

export const updateBookschema = createBookSchema.partial();
