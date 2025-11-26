# 1.4 에러 핸들링 강화 - 키워드 설명

1단계 1.4절에서 구현한 에러 핸들링 관련 개념을 실제 코드와 함께 설명합니다.

---

## 1. Error Handling (에러 핸들링)

### 개념

**Error Handling**은 발생한 에러를 적절히 처리하여 서버가 안정적으로 동작하도록 하는 것입니다.

### 에러 처리 흐름

```
컨트롤러/서비스에서 에러 발생
    ↓
catch 블록에서 에러 캐치
    ↓
next(error)로 에러 핸들러에 전달
    ↓
전역 에러 핸들러가 에러 처리
    ↓
적절한 HTTP 상태 코드와 에러 메시지 반환
```

---

## 2. Custom Error Classes (커스텀 에러 클래스)

### 개념

**Custom Error Classes**는 에러 유형별로 구분된 에러 클래스입니다. HTTP 상태 코드와 에러 메시지를 캡슐화합니다.

### 구현 코드

```typescript
// src/errors/CustomError.ts
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
```

### 에러 타입별 HTTP 상태 코드

| 에러 타입           | HTTP 상태 코드 | 사용 예시                     |
| ------------------- | -------------- | ----------------------------- |
| `BadRequestError`   | 400            | 잘못된 요청 데이터            |
| `UnauthorizedError` | 401            | 인증 필요                     |
| `ForbiddenError`    | 403            | 권한 없음                     |
| `NotFoundError`     | 404            | 리소스를 찾을 수 없음         |
| `ConflictError`     | 409            | 리소스 충돌 (예: 중복 이메일) |

---

## 3. Global Error Handler (전역 에러 핸들러)

### 개념

**Global Error Handler**는 애플리케이션 전체에서 발생한 에러를 한 곳에서 처리하는 미들웨어입니다.

### 구현 코드

```typescript
// src/middleware/errorHandler.ts
export const errorHandler = (
  err: Error | createError.HttpError | CustomError,
  req: Request,
  res: Response,
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
```

### 에러 핸들러 특징

1. **4개의 파라미터**: `(err, req, res, next)` - Express가 에러 핸들러로 인식
2. **마지막에 등록**: 모든 라우터와 미들웨어 이후에 등록
3. **일관된 응답 형식**: `ApiResponse` 형식으로 응답

---

## 4. 컨트롤러에서 에러 처리

### try-catch와 next(error) 패턴

```typescript
// src/controllers/usersController.ts
export const createUserHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      throw new BadRequestError("이름과 이메일은 필수입니다");
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError("유효하지 않은 이메일 형식입니다");
    }

    const newUser = createUser({ name, email });
    const response: ApiResponse = {
      success: true,
      data: newUser,
      message: "사용자가 생성되었습니다",
    };
    res.status(201).json(response);
  } catch (error) {
    next(error); // 에러를 에러 핸들러로 전달
  }
};
```

### 패턴 설명

1. **try 블록**: 정상 로직 실행
2. **throw**: 에러 발생 시 커스텀 에러 던지기
3. **catch 블록**: 에러 캐치 후 `next(error)`로 전달
4. **에러 핸들러**: 최종적으로 에러 처리 및 응답

---

## 5. 404 Not Found Handler

### 개념

존재하지 않는 경로로 요청이 들어왔을 때 처리하는 미들웨어입니다.

### 구현 코드

```typescript
// src/middleware/notFoundHandler.ts
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const error = new NotFoundError(
    `경로를 찾을 수 없습니다: ${req.originalUrl}`,
  );
  next(error);
};
```

### 등록 순서

```typescript
// src/app.ts
// 라우터 설정
app.use("/", indexRouter);
app.use("/api/users", usersRouter);

// 404 핸들러 (라우터 이후에 위치)
app.use(notFoundHandler);

// 에러 핸들러 (마지막에 위치)
app.use(errorHandler);
```

---

## 📝 정리

### 핵심 키워드 요약

| 키워드                   | 설명                    | 주요 파일                           |
| ------------------------ | ----------------------- | ----------------------------------- |
| **Custom Error Classes** | 에러 유형별 클래스      | `src/errors/CustomError.ts`         |
| **Global Error Handler** | 전역 에러 처리 미들웨어 | `src/middleware/errorHandler.ts`    |
| **404 Handler**          | 존재하지 않는 경로 처리 | `src/middleware/notFoundHandler.ts` |
| **try-catch-next**       | 컨트롤러 에러 처리 패턴 | `src/controllers/*.ts`              |

### 에러 처리 체크리스트

- ✅ 커스텀 에러 클래스 정의
- ✅ 전역 에러 핸들러 등록
- ✅ 404 핸들러 등록
- ✅ 컨트롤러에서 try-catch-next 패턴 사용
- ✅ 일관된 에러 응답 형식

---

**질문이 있으면 언제든 물어보세요!** 🚀
