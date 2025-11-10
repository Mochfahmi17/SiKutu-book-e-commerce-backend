import Author from "../models/author.model";

type authorStorePRops = {
  name: string;
  bio: string;
  profileImage?: string;
};

export const allAuthors = async () => {
  try {
    const authors = await Author.find().populate("books", "-author");

    return authors;
  } catch (error) {
    throw error;
  }
};

export const store = async ({ name, bio, profileImage }: authorStorePRops) => {
  try {
    const author = await Author.create({
      name,
      bio,
      profileImage,
    });

    return author;
  } catch (error) {
    throw error;
  }
};
