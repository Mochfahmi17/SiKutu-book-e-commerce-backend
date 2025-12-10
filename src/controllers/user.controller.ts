import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { getUserById } from "../services/user.service";

export const getUserData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(createHttpError(401, "unauthorized."));
    }

    const { userId } = req.user;

    const user = await getUserById(userId);
    if (!user) {
      return next(createHttpError(404, "User not found!"));
    }

    return res.status(200).json({
      success: true,
      error: false,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user: ", error);
    return next(createHttpError(500, "Failed fetching user."));
  }
};
