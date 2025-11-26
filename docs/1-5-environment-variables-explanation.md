# 1.5 환경 변수 관리 - 키워드 설명

1단계 1.5절에서 구현한 환경 변수 관리 관련 개념을 실제 코드와 함께 설명합니다.

---

## 1. Environment Variables (환경 변수)

### 개념

**Environment Variables**는 애플리케이션 설정을 코드 밖에서 관리하는 방법입니다. 환경(개발/프로덕션)에 따라 다른 값을 사용할 수 있습니다.

### 왜 환경 변수를 사용하나?

1. **보안**: 비밀번호, API 키를 코드에 직접 작성하지 않음
2. **유연성**: 환경별로 다른 설정 사용
3. **관리 용이성**: 설정 변경 시 코드 수정 불필요

---

## 2. dotenv 라이브러리

### 개념

**dotenv**는 `.env` 파일에서 환경 변수를 로드하는 라이브러리입니다.

### 구현 코드

```typescript
// src/config/env.ts
import { validateEnv } from "./envValidation.js";
import dotenv from "dotenv";

dotenv.config();

// 환경 변수 검증 및 설정
export const config = validateEnv();
```

### .env 파일 예시

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=dev-secret-key
DATABASE_URL=file:./dev.db
```

---

## 3. 환경 변수 검증

### 개념

환경 변수가 올바르게 설정되었는지 검증하는 로직입니다. 특히 프로덕션 환경에서 필수 변수가 누락되면 에러를 발생시킵니다.

### 구현 코드

```typescript
// src/config/envValidation.ts
interface EnvConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  databaseUrl: string;
}

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
    jwtSecret:
      requiredEnvVars.jwtSecret || "your-secret-key-change-in-production",
    jwtExpiresIn: requiredEnvVars.jwtExpiresIn,
    databaseUrl: requiredEnvVars.databaseUrl || "file:./dev.db",
  };
};
```

---

## 4. 환경별 설정 분리

### 개념

개발(development), 프로덕션(production), 테스트(test) 환경에 따라 다른 설정을 사용합니다.

### 환경별 차이점

| 설정            | development        | production      | test        |
| --------------- | ------------------ | --------------- | ----------- |
| **로깅**        | 상세 (dev)         | 간략 (combined) | 최소        |
| **에러 메시지** | 스택 트레이스 포함 | 간략한 메시지만 | 상세        |
| **CORS**        | 모든 Origin 허용   | 특정 Origin만   | 모든 Origin |
| **DB**          | 로컬 DB            | 프로덕션 DB     | 테스트 DB   |

### 코드에서 환경 확인

```typescript
// src/app.ts
if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}
```

```typescript
// src/middleware/errorHandler.ts
if (process.env.NODE_ENV === "development") {
  logger.error("Error:", err); // 스택 트레이스 포함
} else {
  logger.error(`Error ${statusCode}: ${message}`); // 간략한 메시지
}
```

---

## 5. 코드에서 환경 변수 사용

### 사용 예시

```typescript
import { config } from "./config/env.js";

console.log(config.port); // 4000
console.log(config.nodeEnv); // development
console.log(config.jwtSecret); // dev-secret-key
```

### 장점

1. **타입 안정성**: TypeScript 인터페이스로 타입 정의
2. **검증 완료**: 검증된 값만 사용
3. **기본값 제공**: 누락된 변수에 기본값 적용

---

## 📝 정리

### 핵심 키워드 요약

| 키워드                    | 설명                      | 주요 파일                     |
| ------------------------- | ------------------------- | ----------------------------- |
| **Environment Variables** | 환경별 설정 관리          | `.env`                        |
| **dotenv**                | .env 파일 로드 라이브러리 | `src/config/env.ts`           |
| **환경 변수 검증**        | 필수 변수 검증 로직       | `src/config/envValidation.ts` |
| **환경별 설정**           | dev/prod/test 분리        | 전체 프로젝트                 |

### 보안 주의사항

- ❌ `.env` 파일을 Git에 커밋하지 않음
- ❌ 비밀번호, API 키를 코드에 직접 작성하지 않음
- ✅ `.env.example` 파일 생성 (값 없이 키만)
- ✅ `.gitignore`에 `.env` 추가
- ✅ 프로덕션에서는 필수 변수 검증

---

**질문이 있으면 언제든 물어보세요!** 🚀
