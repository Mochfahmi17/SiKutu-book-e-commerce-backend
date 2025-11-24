import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { allCategories, destroy, getCategoryBySlug, store, update } from "../services/category.service";
import generateUniqueSlug from "../utils/genereateUniqueSlug";
import Category from "../models/category.model";

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await allCategories();

    return res.status(200).json({
      success: true,
      error: false,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching books: ", error);
    return next(createHttpError(500, "Failed to fetch books!"));
  }
};

export const getSingleCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const category = await getCategoryBySlug(slug.toLowerCase());
    if (!category) {
      return next(createHttpError(404, "Category not found!"));
    }

    return res.status(200).json({ success: true, error: false, data: category });
  } catch (error) {
    console.error("Error fetching book: ", error);
    return next(createHttpError(500, "Failed to fetch book!"));
  }
};

export const addCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    const slug = await generateUniqueSlug(Category, name);

    const exists = await getCategoryBySlug(slug);
    if (exists) {
      return next(createHttpError(409, "This category has already been added."));
    }

    const storeData = {
      name,
      slug,
    };
    await store(storeData);

    return res.status(201).json({
      success: true,
      error: false,
      message: "Successfully to add new category.",
    });
  } catch (error) {
    console.error("Error add new category: ", error);
    return next(createHttpError(500, "Failed to add new category!"));
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { name } = req.body;

    const category = await getCategoryBySlug(slug.toLowerCase());
    if (!category) {
      return next(createHttpError(404, "Category not found!"));
    }

    const newSlug = name && name !== category.name ? await generateUniqueSlug(Category, name) : category.name;

    const updateData = {
      oldSlug: category.slug,
      name: name ?? category.name,
      slug: newSlug,
    };
    await update(updateData);

    return res.status(200).json({ success: true, error: false, message: "Update category successfully." });
  } catch (error) {
    console.error("Error to update category: ", error);
    return next(createHttpError(500, "Failed to update category!"));
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const category = await getCategoryBySlug(slug.toLowerCase());
    if (!category) {
      return next(createHttpError(404, "Category not found!"));
    }

    await destroy(slug);
    return res.status(200).json({ success: true, error: false, message: "Delete category successfully." });
  } catch (error) {
    console.error("Error delete this category: ", error);
    return next(createHttpError(500, "Failed to delete category!"));
  }
};
