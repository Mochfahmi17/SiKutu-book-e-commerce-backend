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

type updateBookProps = {
  oldSlug: string;
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

export const store = async (data: bookStoreProps) => {
  try {
    const { category, author, ...fields } = data;
    const book = await Book.create({
      ...fields,
      category,
      author,
    });

    await Author.findByIdAndUpdate(author, {
      $addToSet: { books: book._id },
    });

    await Category.findByIdAndUpdate(category, {
      $addToSet: { books: book._id },
    });
    return book;
  } catch (error) {
    throw error;
  }
};

export const update = async (data: updateBookProps) => {
  try {
    const { oldSlug, category, author, ...fields } = data;

    const oldBook = await Book.findOne({ slug: oldSlug });
    if (!oldBook) throw new Error("Book not found!");

    const book = await Book.findOneAndUpdate({ slug: oldSlug }, { $set: { ...fields, category, author } }, { returnDocument: "after" });
    if (!book) throw new Error("failed to update book.");

    if (String(oldBook.author) !== String(author)) {
      await Author.findByIdAndUpdate(oldBook.author, {
        $pull: { books: book._id },
      });

      await Author.findByIdAndUpdate(author, {
        $addToSet: { books: book._id },
      });
    }

    if (String(oldBook.category) !== String(category)) {
      await Category.findByIdAndUpdate(oldBook.category, { $pull: { books: book._id } });
      await Category.findByIdAndUpdate(category, { $addToSet: { books: book._id } });
    }

    return book;
  } catch (error) {
    throw error;
  }
};

export const destroy = async (slug: string) => {
  try {
    const book = await Book.findOne({ slug });
    if (!book) {
      throw new Error("Book not found!");
    }

    await Author.findByIdAndUpdate(book.author, {
      $pull: { books: book._id },
    });
    await Category.findByIdAndUpdate(book.category, { $pull: { books: book._id } });
    await Book.findOneAndDelete({ slug });
  } catch (error) {
    throw error;
  }
};
