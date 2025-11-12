import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { allBooks, destroy, getBookBySlug, store, update } from "../services/book.service";
import generateUniqueSlug from "../utils/genereateUniqueSlug";
import Book from "../models/book.model";
import path from "path";
import { existsSync, unlinkSync } from "fs";
import deleteOldImage from "../utils/deleteOldImage";

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
    const uplodedCover = req.file?.filename;

    const slug = await generateUniqueSlug(Book, title);

    const storeData = {
      title,
      slug,
      description,
      category,
      author,
      uplodedCover,
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

export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { title, description, category, author, price, stock } = req.body;
    const uplodedCover = req.file?.filename;

    const book = await getBookBySlug(slug.toLowerCase());
    if (!book) {
      return next(createHttpError(404, "Book not found!"));
    }

    const newSlug = title && title !== book.title ? await generateUniqueSlug(Book, title) : book.slug;

    let newCoverBook = book.coverBook;
    if (uplodedCover) {
      deleteOldImage("cover", book.coverBook);
      newCoverBook = uplodedCover;
    }

    const updateData = {
      oldSlug: book.slug,
      title: title ?? book.title,
      slug: newSlug,
      description: description ?? book.description,
      category: category ?? book.category,
      author: author ?? book.author,
      coverBook: newCoverBook ?? undefined,
      price: price ?? book.price,
      stock: stock ?? book.stock,
    };
    await update(updateData);

    return res.status(200).json({ success: true, error: false, message: "Update book successfully." });
  } catch (error) {
    console.error("Error update a book: ", error);
    if (error instanceof Error) {
      return next(createHttpError(500, "Failed update book!"));
    }

    throw error;
  }
};

export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const book = await getBookBySlug(slug);
    if (!book) {
      return next(createHttpError(404, "Book not found!"));
    }

    if (book.coverBook) {
      deleteOldImage("cover", book.coverBook);
    }
    await destroy(slug);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Delete book successfully!",
    });
  } catch (error) {
    console.error("Error delete a book: ", error);
    if (error instanceof Error) {
      return next(createHttpError(500, "Failed delete book!"));
    }

    throw error;
  }
};
