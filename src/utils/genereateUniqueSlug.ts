import slugify from "slugify";
import { Model } from "mongoose";

interface HasSlug {
  slug: string;
}

/**
 * Generate a unique slug for any Mongoose model safely (no 'any'!)
 * @param model - THe mongoose model (e.g., Book, Author, Category)
 * @param slug - The slug to slugify (e.g., book title, category name, author name)
 * @returns Promise<string> unique slug
 */
export default async function generateUniqueSlug<T extends HasSlug>(model: Model<T>, text: string): Promise<string> {
  const baseSlug = slugify(text, { lower: true, strict: true });

  let uniqueSlug = baseSlug;
  let counter = 1;

  const exists = await model.exists({ slug: uniqueSlug });
  while (exists) {
    uniqueSlug = slugify(`${baseSlug}-${counter}`, { lower: true, strict: true });

    counter++;
  }

  return uniqueSlug;
}
