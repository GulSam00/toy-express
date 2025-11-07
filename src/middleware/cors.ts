import { Request, Response, NextFunction } from "express";
import { config } from "../config/env.js";

// CORS (Cross-Origin Resource Sharing) 미들웨어
export const corsHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // 허용할 Origin (개발 환경에서는 모든 Origin 허용)
  const allowedOrigins =
    config.nodeEnv === "development"
      ? ["*"]
      : process.env.ALLOWED_ORIGINS?.split(",") || [];

  // Origin 헤더 확인
  const origin = req.headers.origin;

  if (allowedOrigins.includes("*") || (origin && allowedOrigins.includes(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }

  // 허용할 HTTP 메서드
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );

  // 허용할 헤더
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );

  // 쿠키 허용 (필요한 경우)
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // OPTIONS 요청 (preflight) 처리
  if (req.method === "OPTIONS") {
    res.status(204).send();
    return;
  }

  next();
};

