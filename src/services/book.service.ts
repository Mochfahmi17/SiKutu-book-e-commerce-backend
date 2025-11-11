import { Types } from "mongoose";
import Book from "../models/book.model";
import Author from "../models/author.model";
import Category from "../models/category.model";

type bookStoreProps = {
  title: string;
  slug: string;
  description: string;
  category: Types.ObjectId;
  author: Types.ObjectId;
  coverBook?: string;
  price: number;
  discounts?: Types.ObjectId;
  stock: number;
  reviews?: Types.ObjectId[];
};

export const allBooks = async () => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).populate("author", "-books").populate("category", "-books");

    return books;
  } catch (error) {
    throw error;
  }
};

export const getBookBySlug = async (slug: string) => {
  try {
    const book = await Book.findOne({ slug }).populate("author", "-books").populate("category", "-books");

    return book;
  } catch (error) {
    throw error;
  }
};

export const store = async ({ title, slug, description, category, author, coverBook, price, discounts, stock, reviews }: bookStoreProps) => {
  try {
    const book = await Book.create({
      title,
      slug,
      description,
      category,
      author,
      coverBook,
      price,
      discounts,
      stock,
      reviews,
    });

    await Author.findByIdAndUpdate(author, {
      $push: { books: book._id },
    });

    await Category.findByIdAndUpdate(category, {
      $push: { books: book._id },
    });
    return book;
  } catch (error) {
    throw error;
  }
};
