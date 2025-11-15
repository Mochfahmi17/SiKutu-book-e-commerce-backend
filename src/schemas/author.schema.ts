import z from "zod";

export const createAuthorSchema = z.object({
  name: z.string().min(3, "Name too short."),
  bio: z.string().max(255, "Bio too long."),
});

export const updateAuthorSchema = createAuthorSchema.partial();
