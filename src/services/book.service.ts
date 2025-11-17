import { PipelineStage, Types } from "mongoose";
import Book from "../models/book.model";
import Author from "../models/author.model";
import Category from "../models/category.model";

type allBooksProps = {
  categorySlug?: string;
  search?: string;
  page?: number;
  limit?: number;
};

type bookStoreProps = {
  title: string;
  slug: string;
  description: string;
  category: Types.ObjectId;
  author: Types.ObjectId;
  coverBook?: string | null;
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
  coverBook?: string | null;
  price: number;
  discounts?: Types.ObjectId;
  stock: number;
  reviews?: Types.ObjectId[];
};

export const allBooks = async ({ categorySlug, search, page = 1, limit = 10 }: allBooksProps) => {
  try {
    const pipeline: PipelineStage[] = [];

    pipeline.push(
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: "$categoryData" }
    );

    pipeline.push(
      {
        $lookup: {
          from: "authors",
          localField: "author",
          foreignField: "_id",
          as: "authorData",
        },
      },
      { $unwind: "$authorData" }
    );

    if (categorySlug) {
      pipeline.push({ $match: { "categoryData.slug": categorySlug } });
    }

    if (search) {
      const regex = new RegExp(search, "i");

      pipeline.push({ $match: { $or: [{ title: { $regex: regex } }, { "author.name": { $regex: regex } }] } });
    }

    pipeline.push({ $set: { category: "$categoryData", author: "$authorData" } });

    pipeline.push({
      $project: {
        categoryData: 0,
        authorData: 0,
        "category.books": 0,
        "author.books": 0,
      },
    });

    pipeline.push({ $sort: { createdAt: -1 } });

    //* Pagination
    const skip = (page - 1) * limit;

    pipeline.push({
      $facet: {
        data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    });

    const result = await Book.aggregate(pipeline);

    const data = result[0].data;
    const total = result[0].totalCount[0].count || 0;

    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
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
    const { oldSlug, ...fields } = data;

    const book = await Book.findOneAndUpdate({ slug: oldSlug }, { $set: { ...fields } }, { returnDocument: "after" });

    return book;
  } catch (error) {
    throw error;
  }
};

export const destroy = async (slug: string) => {
  try {
    const book = await Book.findOneAndDelete({ slug });

    return book;
  } catch (error) {
    throw error;
  }
};
