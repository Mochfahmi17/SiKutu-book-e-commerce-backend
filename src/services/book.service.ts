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
  coverBook?: string;
  price: number;
  sales?: Types.ObjectId;
  stock: number;
  releaseDate: Date;
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
  sales?: Types.ObjectId;
  stock: number;
  releaseDate: Date;
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
      { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } }
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
      { $unwind: { path: "$authorData", preserveNullAndEmptyArrays: true } }
    );

    pipeline.push(
      {
        $lookup: {
          from: "sales",
          localField: "sales",
          foreignField: "_id",
          as: "discountData",
        },
      },
      { $unwind: { path: "$discountData", preserveNullAndEmptyArrays: true } }
    );

    if (categorySlug) {
      pipeline.push({ $match: { "categoryData.slug": categorySlug } });
    }

    if (search) {
      const regex = new RegExp(search, "i");

      pipeline.push({ $match: { $or: [{ title: { $regex: regex } }, { "authorData.name": { $regex: regex } }] } });
    }

    pipeline.push({ $set: { category: "$categoryData", author: "$authorData", sales: "$discountData" } });

    pipeline.push({
      $project: {
        categoryData: 0,
        authorData: 0,
        discountData: 0,
        "category.books": 0,
        "author.books": 0,
        "sales.books": 0,
      },
    });

    //* Pagination
    const skip = (page - 1) * limit;

    pipeline.push({
      $facet: {
        data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "totalBooks" }],
      },
    });

    const result = await Book.aggregate(pipeline);

    const data = result[0]?.data ?? [];
    const totalBooks = result[0].totalCount?.[0]?.totalBooks ?? 0;

    return { data, pagination: { totalBooks, page, limit, totalPages: Math.ceil(totalBooks / limit) } };
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
