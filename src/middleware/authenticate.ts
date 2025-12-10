import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import verifyToken from "../utils/verifyToken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        userRole: string;
      };
    }
  }
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return next(createHttpError(401, "Unauthorized."));
    }

    const secret = process.env.SECRET_KEY_ACCESS_TOKEN;
    if (!secret) {
      throw new Error("SECRET_KEY_ACCESS_TOKEN not found!");
    }

    const decode = verifyToken(token, secret) as jwt.JwtPayload;
    if (!decode || !decode.id) {
      return next(createHttpError(401, "Invalid or expired token."));
    }

    req.user = { userId: decode.id, userRole: decode.role };
    next();
  } catch (error) {
    let errorMessage = "Something went wrong!";

    if (error instanceof Error) {
      return next(createHttpError(500, error.message || errorMessage));
    }
  }
};

export default authenticate;
