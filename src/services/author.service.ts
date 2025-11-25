import { Types } from "mongoose";
import Author from "../models/author.model";

type authorStoreProps = {
  name: string;
  slug: string;
  bio: string;
  profileImage?: string;
};

type updateAuthorProps = {
  oldSlug: string;
  name: string;
  slug: string;
  bio: string;
  profileImage?: string | null;
};

export const allAuthors = async () => {
  try {
    const authors = await Author.find().populate({ path: "books", select: "-author", populate: { path: "category", select: "-books" } });

    return authors;
  } catch (error) {
    throw error;
  }
};

export const getAuthorById = async (id: Types.ObjectId) => {
  try {
    const author = await Author.findById(id);

    return author;
  } catch (error) {
    throw error;
  }
};

export const getAuthorBySlug = async (slug: string) => {
  try {
    const author = await Author.findOne({ slug }).populate({ path: "books", select: "-author", populate: { path: "category", select: "-books" } });

    return author;
  } catch (error) {
    throw error;
  }
};

export const store = async (data: authorStoreProps) => {
  try {
    const author = await Author.create(data);

    return author;
  } catch (error) {
    throw error;
  }
};

export const update = async (data: updateAuthorProps) => {
  try {
    const { oldSlug, ...fields } = data;
    const author = await Author.findOneAndUpdate({ slug: oldSlug }, { $set: { ...fields } }, { returnDocument: "after" });

    return author;
  } catch (error) {
    throw error;
  }
};

export const destroy = async (slug: string) => {
  try {
    const author = await Author.findOneAndDelete({ slug });

    return author;
  } catch (error) {
    throw error;
  }
};
