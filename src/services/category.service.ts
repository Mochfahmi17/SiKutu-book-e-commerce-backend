import Category from "../models/category.model";

export const allCategories = async () => {
  try {
    const categories = await Category.find().populate("books");

    return categories;
  } catch (error) {
    throw error;
  }
};
