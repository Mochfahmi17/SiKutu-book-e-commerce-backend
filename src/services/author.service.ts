import Author from "../models/author.model";

type authorStorePRops = {
  name: string;
  slug: string;
  bio: string;
  profileImage?: string;
};

export const allAuthors = async () => {
  try {
    const authors = await Author.find().populate({ path: "books", select: "-author", populate: { path: "category", select: "name" } });

    return authors;
  } catch (error) {
    throw error;
  }
};

export const store = async ({ name, slug, bio, profileImage }: authorStorePRops) => {
  try {
    const author = await Author.create({
      name,
      slug,
      bio,
      profileImage,
    });

    return author;
  } catch (error) {
    throw error;
  }
};
