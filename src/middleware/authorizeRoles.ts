import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

export const authorizeRoles =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.userRole)) {
      return next(createHttpError(403, "Access denied."));
    }

    next();
  };
