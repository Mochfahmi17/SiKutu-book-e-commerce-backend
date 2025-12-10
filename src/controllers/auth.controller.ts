import { CookieOptions, NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { getUserByEmail, registerUser } from "../services/user.service";
import bcryptjs from "bcryptjs";
import generateAccessToken from "../utils/generateAccessToken";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return next(createHttpError(400, "Already registered email."));
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    const payload = {
      name,
      email,
      password: hashPassword,
    };

    await registerUser(payload);

    return res.status(201).json({
      success: true,
      error: false,
      message: "Register is successfully.",
    });
  } catch (error) {
    console.error("Register error: ", error);
    return next(createHttpError(500, "Register is failed!"));
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      return next(createHttpError(400, "User is not register."));
    }

    const checkingPassword = await bcryptjs.compare(password, existingUser.password);
    if (!checkingPassword) {
      return next(createHttpError(400, "Password invalid! Please make sure your password is correct."));
    }

    const accessToken = generateAccessToken(existingUser._id, existingUser.role);

    const cookieOption: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    };
    res.cookie("accessToken", accessToken, cookieOption);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Login successfully.",
      token: accessToken,
    });
  } catch (error) {
    console.error("Login is error: ", error);
    return next(createHttpError(500, "Login is failed!"));
  }
};

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(createHttpError(401, "Unauthorized."));
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "User is already authenticated.",
    });
  } catch (error) {
    console.error("Error authenticated: ", error);
    next(createHttpError(500, "Failed authenticated"));
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookieOption: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    res.clearCookie("accessToken", cookieOption);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Logout successfully.",
    });
  } catch (error) {
    console.error("Logout error: ", error);
    return next(createHttpError(500, "Logout is failed!"));
  }
};
