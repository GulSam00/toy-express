# 1.3 미들웨어 활용 - 키워드 설명

1단계 1.3절에서 구현한 미들웨어 관련 개념을 실제 코드와 함께 설명합니다.

---

## 1. Middleware (미들웨어)

### 개념

**Middleware**는 요청과 응답 사이에서 실행되는 함수입니다. 여러 미들웨어가 체인처럼 연결되어 순차적으로 실행됩니다.

### 미들웨어 실행 순서

```
요청 → 미들웨어1 → 미들웨어2 → 라우터 → 컨트롤러 → 응답
```

### 현재 프로젝트의 미들웨어

```typescript
// src/app.ts
// CORS 설정 (최상단에 위치)
app.use(corsHandler);

// 미들웨어 설정
if (config.nodeEnv === "development") {
  app.use(morgan("dev")); // HTTP 요청 로깅
} else {
  app.use(morgan("combined")); // HTTP 요청 로깅
}

app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 데이터 파싱

// 요청 검증 미들웨어
app.use(validateRequest);
```

**중요**: `next()`를 호출해야 다음 미들웨어로 진행됩니다!

---

## 2. Request Validation (요청 검증)

### 개념

**Request Validation**은 클라이언트가 보낸 요청 데이터가 유효한지 검사하는 것입니다. 잘못된 데이터로 인한 에러를 미리 방지합니다.

### 검증 시점

1. **미들웨어 레벨**: 모든 요청에 대한 기본 검증
2. **컨트롤러 레벨**: 특정 엔드포인트에 대한 상세 검증

### 구현 코드

#### 1. 기본 요청 검증 미들웨어

```typescript
// src/middleware/validateRequest.ts
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
```

#### 2. 필수 필드 검증 함수

```typescript
// src/middleware/validateRequest.ts
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
```

### 검증 항목

1. **필수 필드 확인**: 필수 데이터가 있는지 확인
2. **데이터 타입 검증**: 숫자, 문자열, 이메일 형식 등
3. **데이터 범위 검증**: 최소/최대 길이, 값 범위 등
4. **비즈니스 규칙 검증**: 중복 이메일, 고유 제약 조건 등

---

## 3. CORS (Cross-Origin Resource Sharing)

### 개념

**CORS**는 다른 도메인(Origin)에서 오는 요청을 허용하는 메커니즘입니다. 브라우저의 보안 정책으로 인해 필요합니다.

### CORS가 필요한 이유

브라우저는 **Same-Origin Policy**를 적용합니다:

- 같은 도메인: `http://localhost:3000` → `http://localhost:3000` ✅
- 다른 도메인: `http://localhost:3000` → `http://localhost:4000` ❌ (CORS 필요)

### 구현 코드

```typescript
// src/middleware/cors.ts
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

  if (
    allowedOrigins.includes("*") ||
    (origin && allowedOrigins.includes(origin))
  ) {
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
```

### CORS 헤더 설명

- **`Access-Control-Allow-Origin`**: 허용할 Origin (도메인)
- **`Access-Control-Allow-Methods`**: 허용할 HTTP 메서드
- **`Access-Control-Allow-Headers`**: 허용할 요청 헤더
- **`Access-Control-Allow-Credentials`**: 쿠키/인증 정보 허용 여부

### Preflight 요청

브라우저는 복잡한 요청 전에 **OPTIONS** 요청을 먼저 보냅니다. 이를 **Preflight**라고 합니다.

```
클라이언트 → OPTIONS 요청 (preflight)
서버 → CORS 헤더와 함께 204 응답
클라이언트 → 실제 요청 (GET, POST 등)
```

---

## 4. Logging (로깅)

### 개념

**Logging**은 애플리케이션의 동작을 기록하는 것입니다. 디버깅, 모니터링, 감사에 사용됩니다.

### 현재 프로젝트의 로깅

#### 1. HTTP 요청 로깅 (morgan)

```typescript
// src/app.ts
if (config.nodeEnv === "development") {
  app.use(morgan("dev")); // 개발: 간단한 형식
} else {
  app.use(morgan("combined")); // 프로덕션: 상세한 형식
}
```

**morgan 출력 예시:**

```
GET /api/users 200 15.234 ms - 156
POST /api/users 201 8.123 ms - 89
```

#### 2. 커스텀 로거

```typescript
// src/utils/logger.ts
export const logger = {
  info: (message: string) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  },
  error: (message: string) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  },
  warn: (message: string) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  },
};
```

---

## 📝 정리

### 핵심 키워드 요약

| 키워드                 | 설명                          | 주요 파일                           |
| ---------------------- | ----------------------------- | ----------------------------------- |
| **Middleware**         | 요청/응답 사이 실행 함수      | `src/app.ts`                        |
| **Request Validation** | 요청 데이터 검증              | `src/middleware/validateRequest.ts` |
| **CORS**               | Cross-Origin Resource Sharing | `src/middleware/cors.ts`            |
| **Logging**            | 애플리케이션 동작 기록        | `src/utils/logger.ts`, morgan       |

---

**질문이 있으면 언제든 물어보세요!** 🚀
