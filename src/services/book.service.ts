import { Types } from "mongoose";
import Book from "../models/book.model";
import Author from "../models/author.model";

type bookStoreProps = {
  title: string;
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
    const books = await Book.find().populate("category", "name").populate("author", "name bio");

    return books;
  } catch (error) {
    throw error;
  }
};

export const store = async ({ title, description, category, author, coverBook, price, discounts, stock, reviews }: bookStoreProps) => {
  try {
    const book = await Book.create({
      title,
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
    return book;
  } catch (error) {
    throw error;
  }
};
