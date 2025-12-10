import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { allAuthors, destroy, getAuthorBySlug, store, update } from "../services/author.service";
import generateUniqueSlug from "../utils/genereateUniqueSlug";
import Author from "../models/author.model";
import deleteOldImage from "../utils/deleteOldImage";
import saveUploadedImage from "../utils/saveUplodedImage";

export const getAllAuthors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authors = await allAuthors();

    return res.status(200).json({
      success: true,
      error: false,
      data: authors,
    });
  } catch (error) {
    console.error("Error fetching authors: ", error);
    return next(createHttpError(500, "Failed to fetch author!"));
  }
};

export const getSingleAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const author = await getAuthorBySlug(slug.toLowerCase());
    if (!author) {
      return next(createHttpError(404, "Author not found!"));
    }

    return res.status(200).json({
      success: true,
      error: false,
      data: author,
    });
  } catch (error) {
    console.error("Error fetching author: ", error);
    return next(createHttpError(500, "Failed to fetch author!"));
  }
};

export const addAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, bio } = req.body;
    const uploadProfileImage = req.file;

    const allowedMime = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    const slug = await generateUniqueSlug(Author, name);
    const existing = await getAuthorBySlug(slug.toLowerCase());
    if (existing) {
      return next(createHttpError(409, "This author has already been added."));
    }

    let profileImage: string | undefined = undefined;
    if (uploadProfileImage) {
      if (!allowedMime.includes(uploadProfileImage.mimetype)) {
        return next(createHttpError(400, "Only .jpeg, .png, or .webp files are allowed."));
      }

      if (uploadProfileImage.size > maxSize) {
        return next(createHttpError(400, "File size must be less than 2MB."));
      }

      profileImage = saveUploadedImage(uploadProfileImage, "profile");
    }

    const storeData = {
      name,
      slug,
      bio,
      profileImage,
    };
    await store(storeData);

    return res.status(201).json({
      success: true,
      error: false,
      message: "Successfully to add new author.",
    });
  } catch (error) {
    console.error("Error add new author: ", error);
    return next(createHttpError(500, "Failed to add new author!"));
  }
};

export const updateAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const { name, bio, profileImage: profileImageBody } = req.body;
    const uploadProfileImage = req.file;

    const allowedMime = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    const author = await getAuthorBySlug(slug.toLowerCase());
    if (!author) {
      return next(createHttpError(404, "Author not found!"));
    }

    const newSlug = name && name !== author.name ? await generateUniqueSlug(Author, name) : author.slug;

    let newProfileImage: string | null | undefined = author.profileImage;
    if (uploadProfileImage) {
      if (!allowedMime.includes(uploadProfileImage.mimetype)) {
        return next(createHttpError(400, "Only .jpeg, .png, or .webp files are allowed."));
      }

      if (uploadProfileImage.size > maxSize) {
        return next(createHttpError(400, "File size must be less than 2MB."));
      }

      if (author.profileImage) {
        deleteOldImage("profile", author.profileImage);
      }
      newProfileImage = saveUploadedImage(uploadProfileImage, "profile");
    }

    if (!uploadProfileImage && (profileImageBody === "" || profileImageBody === null || profileImageBody === undefined)) {
      if (author.profileImage) {
        newProfileImage = author.profileImage;
      }

      newProfileImage = undefined;
    }

    const updateData = {
      oldSlug: author.slug,
      name: name ?? author.name,
      slug: newSlug,
      bio: bio ?? author.bio,
      profileImage: newProfileImage,
    };
    const newAuthor = await update(updateData);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Update author successfully.",
      data: newAuthor,
    });
  } catch (error) {
    console.error("Error update a author: ", error);
    return next(createHttpError(500, "Failed update author!"));
  }
};

export const deleteAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const author = await getAuthorBySlug(slug.toLowerCase());
    if (!author) {
      return next(createHttpError(404, "Author not found."));
    }

    if (author.profileImage) {
      deleteOldImage("profile", author.profileImage);
    }

    await destroy(slug);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Delete author successfully.",
    });
  } catch (error) {
    console.error("Error delete a author: ", error);
    return next(createHttpError(500, "Failed delete author!"));
  }
};
