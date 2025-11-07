import { Request, Response, NextFunction } from "express";
import createError from "http-errors";

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  next(createError(404, `Route ${req.method} ${req.path} not found`));
};


