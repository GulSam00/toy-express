// 환경 변수 검증 로직

interface EnvConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  databaseUrl: string;
}

// 환경 변수 검증 함수
export const validateEnv = (): EnvConfig => {
  const requiredEnvVars = {
    port: process.env.PORT || "4000",
    nodeEnv: process.env.NODE_ENV || "development",
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    databaseUrl: process.env.DATABASE_URL,
  };

  // 프로덕션 환경에서는 필수 환경 변수 검증
  if (requiredEnvVars.nodeEnv === "production") {
    const missingVars: string[] = [];

    if (!requiredEnvVars.jwtSecret) {
      missingVars.push("JWT_SECRET");
    }

    if (!requiredEnvVars.databaseUrl) {
      missingVars.push("DATABASE_URL");
    }

    if (missingVars.length > 0) {
      throw new Error(
        `프로덕션 환경에서 다음 환경 변수가 필요합니다: ${missingVars.join(", ")}`,
      );
    }

    // 프로덕션에서는 기본값 사용 금지
    if (requiredEnvVars.jwtSecret === "your-secret-key-change-in-production") {
      throw new Error("프로덕션 환경에서는 JWT_SECRET을 변경해야 합니다");
    }
  }

  // 포트 번호 검증
  const port = parseInt(requiredEnvVars.port, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`유효하지 않은 포트 번호입니다: ${requiredEnvVars.port}`);
  }

  // Node 환경 검증
  const validEnvs = ["development", "production", "test"];
  if (!validEnvs.includes(requiredEnvVars.nodeEnv)) {
    throw new Error(
      `유효하지 않은 NODE_ENV입니다: ${requiredEnvVars.nodeEnv}. 허용값: ${validEnvs.join(", ")}`,
    );
  }

  return {
    port,
    nodeEnv: requiredEnvVars.nodeEnv,
    jwtSecret: requiredEnvVars.jwtSecret || "your-secret-key-change-in-production",
    jwtExpiresIn: requiredEnvVars.jwtExpiresIn,
    databaseUrl: requiredEnvVars.databaseUrl || "file:./dev.db",
  };
};

