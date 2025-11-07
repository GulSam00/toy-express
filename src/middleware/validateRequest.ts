import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/CustomError.js";

// 요청 본문 검증 미들웨어
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // POST, PUT, PATCH 요청만 검증
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    // JSON 본문이 비어있는지 확인
    if (Object.keys(req.body || {}).length === 0) {
      throw new BadRequestError("요청 본문이 비어있습니다");
    }
  }
  next();
};

// 특정 필드가 필수인지 검증하는 미들웨어 생성 함수
export const validateRequired = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields: string[] = [];

    for (const field of fields) {
      if (!req.body[field] || req.body[field].trim() === "") {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      throw new BadRequestError(
        `다음 필드는 필수입니다: ${missingFields.join(", ")}`,
      );
    }

    next();
  };
};

