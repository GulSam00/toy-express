import createError from "http-errors";

// 커스텀 에러 클래스 기본 클래스
export class CustomError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request 에러
export class BadRequestError extends CustomError {
  constructor(message: string = "잘못된 요청입니다") {
    super(400, message);
  }
}

// 401 Unauthorized 에러
export class UnauthorizedError extends CustomError {
  constructor(message: string = "인증이 필요합니다") {
    super(401, message);
  }
}

// 403 Forbidden 에러
export class ForbiddenError extends CustomError {
  constructor(message: string = "권한이 없습니다") {
    super(403, message);
  }
}

// 404 Not Found 에러
export class NotFoundError extends CustomError {
  constructor(message: string = "리소스를 찾을 수 없습니다") {
    super(404, message);
  }
}

// 409 Conflict 에러
export class ConflictError extends CustomError {
  constructor(message: string = "리소스 충돌이 발생했습니다") {
    super(409, message);
  }
}

// CustomError를 HttpError로 변환
export const toHttpError = (error: unknown): createError.HttpError => {
  if (error instanceof CustomError) {
    return createError(error.statusCode, error.message);
  }
  if (error instanceof Error) {
    return createError(500, error.message);
  }
  return createError(500, "알 수 없는 오류가 발생했습니다");
};

