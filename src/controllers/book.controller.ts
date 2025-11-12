import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { allBooks, getBookBySlug, store } from "../services/book.service";
import generateUniqueSlug from "../utils/genereateUniqueSlug";
import Book from "../models/book.model";

export const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await allBooks();

    return res.status(200).json({
      success: true,
      error: false,
      data: books,
    });
  } catch (error) {
    console.error("Error fetching books: ", error);
    if (error instanceof Error) {
      return next(createHttpError(500, "Failed to fetch books!"));
    }

    throw error;
  }
};

export const getSingleBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const book = await getBookBySlug(slug.toLowerCase());
    if (!book) {
      return next(createHttpError(404, "Book not found!"));
    }

    return res.status(200).json({
      success: true,
      error: false,
      data: book,
    });
  } catch (error) {
    console.error("Error fetching book: ", error);
    if (error instanceof Error) {
      return next(createHttpError(500, "Failed to fetch book!"));
    }

    throw error;
  }
};

export const addBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, category, author, price, stock } = req.body;
    const coverBook = req.file ? req.file.filename : undefined;

    const slug = await generateUniqueSlug(Book, title);

    const storeData = {
      title,
      slug,
      description,
      category,
      author,
      coverBook,
      price,
      stock,
    };
    await store(storeData);
    return res.status(201).json({ sucess: true, error: false, message: "Add new book successfully." });
  } catch (error) {
    console.error("Error add new book: ", error);
    if (error instanceof Error) {
      return next(createHttpError(500, "Failed to create new book!"));
    }

    throw error;
  }
};
