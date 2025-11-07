import { config } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
// Routes
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import { logger } from "./utils/logger.js";
import express, { Express } from "express";
import morgan from "morgan";

const app: Express = express();

// 미들웨어 설정
if (config.nodeEnv === "development") {
  app.use(morgan("dev")); // HTTP 요청 로깅
} else {
  app.use(morgan("combined")); // HTTP 요청 로깅
}

app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 데이터 파싱

// 라우터 설정
app.use("/", indexRouter);
app.use("/api/users", usersRouter);

// 404 핸들러 (라우터 이후에 위치)
app.use(notFoundHandler);

// 에러 핸들러 (마지막에 위치)
app.use(errorHandler);

// 서버 실행
const server = app.listen(config.port, () => {
  logger.info(`🚀 Server running at http://localhost:${config.port}`);
  logger.info(`📝 Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
  });
});

export default app;
