import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import z, { ZodType } from "zod";

const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return result.error.issues.map((e) => res.status(400).json({ error: true, success: false, path: e.path[0], message: e.message }));
    }

    req.body = result.data;
    next();
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return next(createHttpError(500, "Something went wrong when validation!"));
    }
  }
};

export default validate;
