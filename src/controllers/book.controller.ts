import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { allBooks, destroy, getBookBySlug, newReleaseBook, store, update } from "../services/book.service";
import generateUniqueSlug from "../utils/genereateUniqueSlug";
import Book from "../models/book.model";
import deleteOldImage from "../utils/deleteOldImage";
import saveUploadedImage from "../utils/saveUplodedImage";
import { getAuthorById } from "../services/author.service";
import { getCategoryById } from "../services/category.service";

export const getNewReleases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const books = await newReleaseBook(limit);
    if (!books) {
      return next(createHttpError(404, "books not found!"));
    }

    return res.status(200).json({
      success: true,
      error: false,
      data: books,
    });
  } catch (error) {
    console.error("Error fetching books: ", error);
    next(createHttpError(500, "Failed fetch a books!"));
  }
};

export const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const categorySlug = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    const { data, pagination } = await allBooks({ categorySlug, search, page, limit });

    return res.status(200).json({
      success: true,
      error: false,
      data,
      pagination,
    });
  } catch (error) {
    console.error("Error fetching books: ", error);
    return next(createHttpError(500, "Failed to fetch books!"));
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
    return next(createHttpError(500, "Failed to fetch book!"));
  }
};

export const addBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, category, author, price, stock, releaseDate } = req.body;
    const uplodedCover = req.file;

    const allowedMime = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    const slug = await generateUniqueSlug(Book, title);

    let coverBookImage: string | undefined = undefined;
    if (uplodedCover) {
      if (!allowedMime.includes(uplodedCover.mimetype)) {
        return next(createHttpError(400, "Only .jpeg, .png, or .webp files are allowed."));
      }

      if (uplodedCover.size > maxSize) {
        return next(createHttpError(400, "File size must be less than 2MB."));
      }

      coverBookImage = saveUploadedImage(uplodedCover, "cover");
    }

    const existsCategory = await getCategoryById(category);
    if (!existsCategory) {
      return next(createHttpError(404, "Category not found!"));
    }

    const existsAuthor = await getAuthorById(author);
    if (!existsAuthor) {
      return next(createHttpError(404, "Author not found!"));
    }

    const storeData = {
      title,
      slug,
      description,
      category,
      author,
      coverBook: coverBookImage,
      price,
      stock,
      releaseDate,
    };
    const newBook = await store(storeData);

    return res.status(201).json({ sucess: true, error: false, data: newBook, message: "Add new book successfully." });
  } catch (error) {
    console.error("Error add new book: ", error);
    return next(createHttpError(500, "Failed to create a new book!"));
  }
};

export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { title, description, category, author, coverBook: coverBookBody, price, stock, releaseDate } = req.body;
    const uplodedCover = req.file;

    const allowedMime = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    const book = await getBookBySlug(slug.toLowerCase());
    if (!book) {
      return next(createHttpError(404, "Book not found!"));
    }

    const newSlug = title && title !== book.title ? await generateUniqueSlug(Book, title) : book.slug;

    let newCoverBook: string | undefined | null = book.coverBook;
    if (uplodedCover) {
      if (!allowedMime.includes(uplodedCover.mimetype)) {
        return next(createHttpError(400, "Only .jpeg, .png, or .webp files are allowed."));
      }

      if (uplodedCover.size > maxSize) {
        return next(createHttpError(400, "File size must be less than 2MB."));
      }

      if (book.coverBook) {
        deleteOldImage("cover", book.coverBook);
      }

      newCoverBook = saveUploadedImage(uplodedCover, "cover");
    }

    if (!uplodedCover && (coverBookBody === "" || coverBookBody === null || coverBookBody === undefined)) {
      if (book.coverBook) {
        newCoverBook = book.coverBook;
      }

      newCoverBook = undefined;
    }

    const existsCategory = await getCategoryById(category);
    if (!existsCategory) {
      return next(createHttpError(404, "Category not found!"));
    }

    const existsAuthor = await getAuthorById(author);
    if (!existsAuthor) {
      return next(createHttpError(404, "Author not found!"));
    }

    const updateData = {
      oldSlug: book.slug,
      title: title ?? book.title,
      slug: newSlug,
      description: description ?? book.description,
      category: category ?? book.category,
      author: author ?? book.author,
      coverBook: newCoverBook,
      price: price ?? book.price,
      stock: stock ?? book.stock,
      releaseDate: releaseDate ?? book.releaseDate,
    };
    await update(updateData);

    return res.status(200).json({ success: true, error: false, message: "Book updated successfully." });
  } catch (error) {
    console.error("Error updating a book: ", error);
    return next(createHttpError(500, "Failed to update a book!"));
  }
};

export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const book = await getBookBySlug(slug.toLowerCase());
    if (!book) {
      return next(createHttpError(404, "Book not found!"));
    }

    if (book.coverBook) {
      deleteOldImage("cover", book.coverBook);
    }
    await destroy(slug.toLowerCase());

    return res.status(200).json({
      success: true,
      error: false,
      message: "Book deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting a book: ", error);
    return next(createHttpError(500, "Failed to delete a book!"));
  }
};
