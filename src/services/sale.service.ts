import { Types } from "mongoose";
import Sale from "../models/sale.model";
import Book from "../models/book.model";
import { Document } from "mongoose";

type SaleStoreProps = {
  name: string;
  bannerImageSale: string;
  slug: string;
  description: string;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  books: Types.ObjectId[];
};

type SaleUpdateProps = {
  oldSlug: string;
  name: string;
  bannerImageSale: string;
  slug: string;
  description: string;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  books: Types.ObjectId[];
};

export interface ISale extends Document {
  name: string;
  slug: string;
  bannerImageSale: string;
  description: string;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  books: Types.ObjectId[];
}

export const allSales = async () => {
  try {
    const sales = await Sale.find();
    return sales;
  } catch (error) {
    throw error;
  }
};

export const getSaleBySlug = async (slug: string) => {
  try {
    const sale = await Sale.findOne({ slug });

    return sale;
  } catch (error) {
    throw error;
  }
};

export const store = async (data: SaleStoreProps) => {
  try {
    const sale = await Sale.create(data);

    return sale;
  } catch (error) {
    throw error;
  }
};

export const update = async (data: SaleUpdateProps): Promise<ISale | null> => {
  try {
    const { oldSlug, ...fields } = data;
    const sale = await Sale.findOneAndUpdate({ slug: oldSlug }, { $set: { ...fields } }, { returnDocument: "after" });

    return sale;
  } catch (error) {
    throw error;
  }
};

export const syncSaleBooks = async (oldSaleId: Types.ObjectId, updatedSale: ISale) => {
  const updatedBookIds = new Set((updatedSale.books ?? []).map((id: Types.ObjectId) => String(id)));

  const oldBooks = await Book.find({ sales: oldSaleId });

  const removeBooks = oldBooks.filter((book) => !updatedBookIds.has(String(book._id)));
  if (removeBooks.length > 0) {
    await Book.updateMany({ _id: { $in: removeBooks.map((book) => book._id) } }, { $unset: { discountPrice: "", sales: "" } });
  }

  if (updatedSale.books && updatedSale.books.length > 0) {
    const selectedBooks = await Book.find({ _id: { $in: updatedSale.books } });

    await Promise.all(
      selectedBooks.map(async (book) => {
        const discountPrice = Math.round(book.price - (book.price * updatedSale.discountPercentage) / 100);

        return Book.findByIdAndUpdate(book._id, { sales: updatedSale._id, discountPrice });
      })
    );
  }
};

export const destroy = async (slug: string) => {
  try {
    const sale = Sale.findOneAndDelete({ slug });

    return sale;
  } catch (error) {
    throw error;
  }
};
