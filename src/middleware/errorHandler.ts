import { CustomError, toHttpError } from "../errors/CustomError.js";
import { ApiResponse } from "../models/index.js";
import { logger } from "../utils/logger.js";
import { Request, Response } from "express";
import createError from "http-errors";

export const errorHandler = (
  err: Error | createError.HttpError | CustomError,
  req: Request,
  res: Response,
  // next: NextFunction,
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";

  // CustomError 처리
  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (createError.isHttpError(err)) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    // 일반 Error를 HttpError로 변환
    const httpError = toHttpError(err);
    statusCode = httpError.statusCode;
    message = httpError.message;
  }

  // 개발 환경에서는 스택 트레이스 포함
  if (process.env.NODE_ENV === "development") {
    logger.error("Error:", err);
  } else {
    logger.error(`Error ${statusCode}: ${message}`);
  }

  const response: ApiResponse = {
    success: false,
    error: message,
  };

  res.status(statusCode).json(response);
};
