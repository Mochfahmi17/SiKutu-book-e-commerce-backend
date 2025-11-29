import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import generateUniqueSlug from "../utils/genereateUniqueSlug";
import Sale from "../models/sale.model";
import { activeSales, allSales, destroy, getSaleBySlug, store, syncSaleBooks, update } from "../services/sale.service";
import Book from "../models/book.model";
import saveUploadedImage from "../utils/saveUplodedImage";
import deleteOldImage from "../utils/deleteOldImage";

export const getActiveSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sales = await activeSales();

    return res.status(200).json({
      success: true,
      error: false,
      data: sales,
    });
  } catch (error) {
    console.error("Error fetching sales: ", error);
    return;
  }
};

export const getAllSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sales = await allSales();

    return res.status(200).json({
      success: true,
      error: false,
      data: sales,
    });
  } catch (error) {
    console.error("Error fetching sales: ", error);
    return next(createHttpError(500, "Failed to fetch sales!"));
  }
};

export const getSingleSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const sale = await getSaleBySlug(slug.toLowerCase());
    if (!sale) {
      return next(createHttpError(404, "Sale not found!"));
    }

    return res.status(200).json({ success: true, error: false, data: sale });
  } catch (error) {
    console.error("Error fetch sale: ", error);
    return next(createHttpError(500, "Failed to fetch sale!"));
  }
};

export const addSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, discountPercentage, startDate, endDate, books } = req.body;
    const uploadBannerImageSale = req.file;

    const allowedMime = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    const slug = await generateUniqueSlug(Sale, name);

    let bannerImageSale;
    if (uploadBannerImageSale) {
      if (!allowedMime.includes(uploadBannerImageSale.mimetype)) {
        return next(createHttpError(400, "Only .jpeg, .png, or .webp files are allowed."));
      }

      if (uploadBannerImageSale.size > maxSize) {
        return next(createHttpError(400, "File size must be less than 2MB."));
      }

      bannerImageSale = saveUploadedImage(uploadBannerImageSale, "banner");
    } else {
      return next(createHttpError(400, "Banner image sale is required."));
    }

    const allBooks = await Book.find({ _id: { $in: books } });
    for (const book of allBooks) {
      if (book.sales) {
        return next(createHttpError(400, `Book "${book.title}" already has a sale promo.`));
      }
    }

    const storeData = {
      name,
      slug,
      bannerImageSale,
      description,
      discountPercentage,
      startDate,
      endDate,
      books,
    };

    const sale = await store(storeData);

    if (books && books.length > 0) {
      for (const book of allBooks) {
        const discountPrice = Math.round(book.price - (book.price * discountPercentage) / 100);

        await Book.findByIdAndUpdate(book._id, { $set: { sales: sale._id, discountPrice } });
      }
    }

    return res.status(201).json({
      success: true,
      error: false,
      message: "Sale created successfully.",
    });
  } catch (error) {
    console.error("Error add new sale: ", error);
    return next(createHttpError(500, "Failed to create a new sale!"));
  }
};

export const updateSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { name, description, discountPercentage, startDate, endDate, books } = req.body;
    const uploadBannerImageSale = req.file;

    const allowedMime = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    const existingSale = await getSaleBySlug(slug.toLowerCase());
    if (!existingSale) {
      return next(createHttpError(404, "Sale not found!"));
    }

    if (books) {
      const conflictBooks = await Book.find({ _id: { $in: books }, sales: { $nin: [null, undefined, existingSale._id] } });

      if (conflictBooks.length > 0) {
        const titles = conflictBooks.map((book) => book.title).join(", ");
        return next(createHttpError(400, `This ${conflictBooks.length > 1 ? "books" : "book"} already in another sale: ${titles}`));
      }
    }

    const newSlug = name && name !== existingSale.name ? await generateUniqueSlug(Sale, name) : existingSale.slug;

    let newBannerImageSale: string = existingSale.bannerImageSale;
    if (uploadBannerImageSale) {
      const { mimetype, size } = uploadBannerImageSale;

      if (!allowedMime.includes(mimetype)) {
        return next(createHttpError(400, "Only .jpeg, .png, or .webp files are allowed."));
      }

      if (size > maxSize) {
        return next(createHttpError(400, "File size must be less than 2MB."));
      }

      if (existingSale.bannerImageSale) {
        deleteOldImage(existingSale.bannerImageSale, "banner");
      }

      newBannerImageSale = saveUploadedImage(uploadBannerImageSale, "banner");
    }

    const updateData = {
      oldSlug: existingSale.slug,
      name: name ?? existingSale.name,
      slug: newSlug,
      bannerImageSale: newBannerImageSale,
      description: description ?? existingSale.description,
      discountPercentage: discountPercentage ?? existingSale.discountPercentage,
      startDate: startDate ?? existingSale.startDate,
      endDate: endDate ?? existingSale.endDate,
      books: books ?? existingSale.books,
    };

    const updatedSale = await update(updateData);

    if (!updatedSale) {
      return next(createHttpError(500, "Sale update returned null."));
    }

    await syncSaleBooks(existingSale._id, updatedSale);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Sale updated successfully.",
    });
  } catch (error) {
    console.error("Error to updating sale: ", error);
    return next(createHttpError(500, "Failed to update a sale!"));
  }
};

export const deleteSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const sale = await getSaleBySlug(slug.toLowerCase());
    if (!sale) {
      return next(createHttpError(404, "Sale not found!"));
    }

    if (sale.books && sale.books.length > 0) {
      await Book.updateMany({ _id: { $in: sale.books.map((book) => book._id) } }, { discountPrice: "", sales: "" });
    }

    deleteOldImage("banner", sale.bannerImageSale);
    await destroy(slug.toLowerCase());

    return res.status(200).json({
      success: true,
      error: false,
      message: "Sale deleted successfully.",
    });
  } catch (error) {
    console.error("Error to deleting sale: ", error);
    return next(createHttpError(500, "Failed to delete sale!"));
  }
};
