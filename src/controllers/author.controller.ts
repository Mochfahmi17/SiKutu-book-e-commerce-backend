import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { allAuthors, store } from "../services/author.service";
import generateUniqueSlug from "../utils/genereateUniqueSlug";
import Author from "../models/author.model";

export const getAllAuthors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authors = await allAuthors();

    return res.status(200).json({
      success: true,
      error: false,
      data: authors,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return next(createHttpError(500, "Something went wrong!"));
    }

    throw error;
  }
};

export const addAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, bio } = req.body;

    const slug = await generateUniqueSlug(Author, name);
    const storeData = {
      name,
      slug,
      bio,
    };
    await store(storeData);
    return res.status(201).json({
      success: true,
      error: false,
      message: "Successfully to add author.",
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return next(createHttpError(500, "Something went wrong!"));
    }

    throw error;
  }
};
