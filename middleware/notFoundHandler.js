import createError from "http-errors";

/**
 * 404 Not Found Handler
 */

export const notFoundHandler = (req, res, next) => {
  next(createError(404, "Route not found"));
};
