import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { allCategories } from "../services/category.service";

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await allCategories();

    return res.status(200).json({
      success: true,
      error: false,
      data: categories,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return next(createHttpError(500, "Something went wrong!"));
    }

    throw error;
  }
};
