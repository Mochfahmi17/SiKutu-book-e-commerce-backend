import Category from "../models/category.model";

type categoryStoreProps = {
  name: string;
  slug: string;
};

type categoryUpdateProps = {
  oldSlug: string;
  name: string;
  slug: string;
};

export const allCategories = async () => {
  try {
    const categories = await Category.find().select("-books");

    return categories;
  } catch (error) {
    throw error;
  }
};

export const getCategoryBySlug = async (slug: string) => {
  try {
    const category = await Category.findOne({ slug }).populate({ path: "books", select: "-category", populate: { path: "author", select: "-books" } });

    return category;
  } catch (error) {
    throw error;
  }
};

export const store = async (data: categoryStoreProps) => {
  try {
    const category = await Category.create(data);

    return category;
  } catch (error) {
    throw error;
  }
};

export const update = async (data: categoryUpdateProps) => {
  try {
    const { oldSlug, ...fields } = data;
    const category = await Category.findOneAndUpdate({ slug: oldSlug }, { $set: fields }, { returnDocument: "after" });

    return category;
  } catch (error) {
    throw error;
  }
};

export const destroy = async (slug: string) => {
  try {
    const category = await Category.findOneAndDelete({ slug });

    return category;
  } catch (error) {
    throw error;
  }
};
