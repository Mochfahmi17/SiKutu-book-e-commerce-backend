import z from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string({ error: "Password is required." }).min(6, "Password at least 6 characters."),
});

export const registerSchema = z.object({
  name: z.string({ error: "Name is required." }).min(1, "Name is required."),
  email: z.email(),
  password: z.string({ error: "Password is required." }).min(6, "Password at least 6 characters."),
});
