import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { allBooks, store } from "../services/book.service";

export const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await allBooks();

    return res.status(200).json({
      success: true,
      error: false,
      data: books,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return next(createHttpError(500, "Something went wrong!"));
    }

    throw error;
  }
};

export const addBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, category, author, price, stock } = req.body;

    const storeData = {
      title,
      description,
      category,
      author,
      price,
      stock,
    };
    await store(storeData);
    return res.status(201).json({ sucess: true, error: false, message: "Add book successfully." });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return next(createHttpError(500, "Something went wrong!"));
    }

    throw error;
  }
};
