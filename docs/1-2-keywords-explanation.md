# 1단계: 중요 키워드 설명

1단계에서 구현한 코드에 사용된 중요 키워드와 개념을 실제 코드와 함께 설명합니다.

---

## 1. CRUD (Create, Read, Update, Delete)

### 개념

**CRUD**는 데이터 조작의 기본 4가지 작업을 의미합니다:

- **Create**: 데이터 생성
- **Read**: 데이터 조회
- **Update**: 데이터 수정
- **Delete**: 데이터 삭제

### 구현 코드

#### 모든 사용자 조회

```13:32:src/controllers/usersController.ts
// 모든 사용자 조회
export const getUsers = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const users = getAllUsers();
    const response: ApiResponse = {
      success: true,
      data: {
        users,
        count: users.length,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
```

#### 사용자 생성

```64:93:src/controllers/usersController.ts
// 사용자 생성
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

    // 이메일 형식 검증 (간단한 검증)
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
    next(error);
  }
};
```

#### 사용자 수정

```95:133:src/controllers/usersController.ts
// 사용자 수정
export const updateUserHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw new BadRequestError("유효하지 않은 사용자 ID입니다");
    }

    const { name, email } = req.body;

    // 최소 하나의 필드는 수정되어야 함
    if (!name && !email) {
      throw new BadRequestError("수정할 정보를 입력해주세요");
    }

    // 이메일 형식 검증 (이메일이 제공된 경우)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestError("유효하지 않은 이메일 형식입니다");
      }
    }

    const updatedUser = updateUser(id, { name, email });
    const response: ApiResponse = {
      success: true,
      data: updatedUser,
      message: "사용자 정보가 수정되었습니다",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
```

#### 사용자 삭제

```135:153:src/controllers/usersController.ts
// 사용자 삭제
export const deleteUserHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw new BadRequestError("유효하지 않은 사용자 ID입니다");
    }

    deleteUser(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
```

### HTTP 메서드와 CRUD 매핑

| CRUD 작업 | HTTP 메서드 | 엔드포인트                         | 상태 코드      |
| --------- | ----------- | ---------------------------------- | -------------- |
| Create    | POST        | `/api/users`                       | 201 Created    |
| Read      | GET         | `/api/users` 또는 `/api/users/:id` | 200 OK         |
| Update    | PUT         | `/api/users/:id`                   | 200 OK         |
| Delete    | DELETE      | `/api/users/:id`                   | 204 No Content |

---

## 2. Service Layer (서비스 레이어)

### 개념

**Service Layer**는 비즈니스 로직을 처리하는 계층입니다. 컨트롤러와 데이터 저장소 사이에서 중재 역할을 합니다.

### 왜 Service Layer를 사용하나?

1. **관심사의 분리**: 컨트롤러는 요청/응답 처리, 서비스는 비즈니스 로직
2. **재사용성**: 여러 컨트롤러에서 같은 서비스 함수 사용 가능
3. **테스트 용이성**: 비즈니스 로직만 독립적으로 테스트 가능

### 구현 코드

```1:36:src/services/usersService.ts
import { ConflictError, NotFoundError } from "../errors/CustomError.js";
import { CreateUserInput, UpdateUserInput, User } from "../models/User.js";

// 임시 데이터 저장소 (나중에 데이터베이스로 교체)
const users: User[] = [];
let nextId = 1;

// 모든 사용자 조회
export const getAllUsers = (): User[] => {
  return users;
};

// ID로 사용자 조회
export const getUserById = (id: number): User | undefined => {
  return users.find((user) => user.id === id);
};

// 사용자 생성
export const createUser = (input: CreateUserInput): User => {
  // 이메일 중복 검사
  const existingUser = users.find((user) => user.email === input.email);
  if (existingUser) {
    throw new ConflictError("이미 존재하는 이메일입니다");
  }

  const newUser: User = {
    id: nextId++,
    name: input.name,
    email: input.email,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.push(newUser);
  return newUser;
};
```

### 계층 구조

```
Controller (요청/응답 처리)
    ↓
Service (비즈니스 로직)
    ↓
Database/Storage (데이터 저장)
```

---

## 3. Controller (컨트롤러)

### 개념

**Controller**는 HTTP 요청을 받아서 처리하고 응답을 보내는 역할을 합니다. Express에서는 라우터와 함께 사용됩니다.

### Controller의 역할

1. **요청 파라미터 추출**: `req.params`, `req.body`, `req.query`
2. **입력 검증**: 필수 필드, 형식 검증
3. **서비스 호출**: 비즈니스 로직 처리
4. **응답 생성**: HTTP 상태 코드와 JSON 응답

### 구현 코드

```64:93:src/controllers/usersController.ts
// 사용자 생성
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

    // 이메일 형식 검증 (간단한 검증)
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
    next(error);
  }
};
```

### Controller 패턴 설명

- **`req: Request`**: Express 요청 객체
  - `req.body`: 요청 본문 (POST, PUT)
  - `req.params`: URL 파라미터 (`/users/:id` → `req.params.id`)
  - `req.query`: 쿼리 스트링 (`/users?page=1` → `req.query.page`)

- **`res: Response`**: Express 응답 객체
  - `res.status(code)`: HTTP 상태 코드 설정
  - `res.json(data)`: JSON 응답 보내기

- **`next: NextFunction`**: 다음 미들웨어로 넘어가기 (에러 처리 시 사용)

---

## 4. Middleware (미들웨어)

### 개념

**Middleware**는 요청과 응답 사이에서 실행되는 함수입니다. 여러 미들웨어가 체인처럼 연결되어 순차적으로 실행됩니다.

### 미들웨어 실행 순서

```
요청 → 미들웨어1 → 미들웨어2 → 라우터 → 컨트롤러 → 응답
```

### 현재 프로젝트의 미들웨어

```15:29:src/app.ts
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

### 커스텀 미들웨어 예시

```4:18:src/middleware/validateRequest.ts
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

**중요**: `next()`를 호출해야 다음 미들웨어로 진행됩니다!

---

## 5. Error Handling (에러 핸들링)

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

### 구현 코드

#### 1. 커스텀 에러 클래스

```1:48:src/errors/CustomError.ts
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

#### 2. 전역 에러 핸들러

```7:43:src/middleware/errorHandler.ts
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
```

#### 3. 컨트롤러에서 에러 처리

컨트롤러에서 에러가 발생하면 `catch` 블록에서 잡아서 `next(error)`로 에러 핸들러에 전달합니다:

```64:93:src/controllers/usersController.ts
// 사용자 생성
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

    // 이메일 형식 검증 (간단한 검증)
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

### 에러 타입별 HTTP 상태 코드

| 에러 타입           | HTTP 상태 코드 | 사용 예시                     |
| ------------------- | -------------- | ----------------------------- |
| `BadRequestError`   | 400            | 잘못된 요청 데이터            |
| `UnauthorizedError` | 401            | 인증 필요                     |
| `ForbiddenError`    | 403            | 권한 없음                     |
| `NotFoundError`     | 404            | 리소스를 찾을 수 없음         |
| `ConflictError`     | 409            | 리소스 충돌 (예: 중복 이메일) |

---

## 6. Request Validation (요청 검증)

### 개념

**Request Validation**은 클라이언트가 보낸 요청 데이터가 유효한지 검사하는 것입니다. 잘못된 데이터로 인한 에러를 미리 방지합니다.

### 검증 시점

1. **미들웨어 레벨**: 모든 요청에 대한 기본 검증
2. **컨트롤러 레벨**: 특정 엔드포인트에 대한 상세 검증

### 구현 코드

#### 1. 기본 요청 검증 미들웨어

```4:18:src/middleware/validateRequest.ts
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

```20:39:src/middleware/validateRequest.ts
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

#### 3. 컨트롤러에서의 검증

```71:81:src/controllers/usersController.ts
    const { name, email } = req.body;

    if (!name || !email) {
      throw new BadRequestError("이름과 이메일은 필수입니다");
    }

    // 이메일 형식 검증 (간단한 검증)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError("유효하지 않은 이메일 형식입니다");
    }
```

### 검증 항목

1. **필수 필드 확인**: 필수 데이터가 있는지 확인
2. **데이터 타입 검증**: 숫자, 문자열, 이메일 형식 등
3. **데이터 범위 검증**: 최소/최대 길이, 값 범위 등
4. **비즈니스 규칙 검증**: 중복 이메일, 고유 제약 조건 등

---

## 7. CORS (Cross-Origin Resource Sharing)

### 개념

**CORS**는 다른 도메인(Origin)에서 오는 요청을 허용하는 메커니즘입니다. 브라우저의 보안 정책으로 인해 필요합니다.

### CORS가 필요한 이유

브라우저는 **Same-Origin Policy**를 적용합니다:

- 같은 도메인: `http://localhost:3000` → `http://localhost:3000` ✅
- 다른 도메인: `http://localhost:3000` → `http://localhost:4000` ❌ (CORS 필요)

### 구현 코드

```4:45:src/middleware/cors.ts
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

## 8. Environment Variables (환경 변수)

### 개념

**Environment Variables**는 애플리케이션 설정을 코드 밖에서 관리하는 방법입니다. 환경(개발/프로덕션)에 따라 다른 값을 사용할 수 있습니다.

### 왜 환경 변수를 사용하나?

1. **보안**: 비밀번호, API 키를 코드에 직접 작성하지 않음
2. **유연성**: 환경별로 다른 설정 사용
3. **관리 용이성**: 설정 변경 시 코드 수정 불필요

### 구현 코드

#### 1. 환경 변수 설정 파일

```1:7:src/config/env.ts
import { validateEnv } from "./envValidation.js";
import dotenv from "dotenv";

dotenv.config();

// 환경 변수 검증 및 설정
export const config = validateEnv();
```

#### 2. 환경 변수 검증

```1:68:src/config/envValidation.ts
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
    jwtSecret:
      requiredEnvVars.jwtSecret || "your-secret-key-change-in-production",
    jwtExpiresIn: requiredEnvVars.jwtExpiresIn,
    databaseUrl: requiredEnvVars.databaseUrl || "file:./dev.db",
  };
};
```

### 환경 변수 사용 예시

#### `.env` 파일 (로컬)

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=dev-secret-key
DATABASE_URL=file:./dev.db
```

#### 코드에서 사용

```typescript
import { config } from "./config/env.js";

console.log(config.port); // 4000
console.log(config.nodeEnv); // development
```

---

## 9. TypeScript Interfaces (타입 정의)

### 개념

**TypeScript Interfaces**는 데이터 구조를 정의하는 타입입니다. 코드의 안정성과 가독성을 높입니다.

### 구현 코드

#### 1. User 인터페이스

```1:20:src/models/User.ts
// User 모델 타입 정의
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}
```

#### 2. ApiResponse 인터페이스

```1:22:src/models/index.ts
// 공통 타입 정의
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 타입의 장점

1. **타입 안정성**: 컴파일 타임에 오류 발견
2. **자동 완성**: IDE에서 자동 완성 지원
3. **문서화**: 코드 자체가 문서 역할
4. **리팩토링 안전성**: 타입 변경 시 영향 범위 파악 용이

---

## 10. Separation of Concerns (관심사의 분리)

### 개념

**Separation of Concerns**는 코드를 역할별로 분리하여 유지보수성을 높이는 설계 원칙입니다.

### 현재 프로젝트의 계층 구조

```
Routes (라우팅)
    ↓
Controllers (요청/응답 처리)
    ↓
Services (비즈니스 로직)
    ↓
Models (데이터 구조)
```

### 각 계층의 책임

#### Routes (라우팅)

- URL과 HTTP 메서드를 컨트롤러에 연결

```1:27:src/routes/users.ts
import {
  createUserHandler,
  deleteUserHandler,
  getUserByIdHandler,
  getUsers,
  updateUserHandler,
} from "../controllers/usersController.js";
import { Router } from "express";

const router = Router();

// GET /api/users - 모든 사용자 조회
router.get("/", getUsers);

// GET /api/users/:id - 특정 사용자 조회
router.get("/:id", getUserByIdHandler);

// POST /api/users - 사용자 생성
router.post("/", createUserHandler);

// PUT /api/users/:id - 사용자 수정
router.put("/:id", updateUserHandler);

// DELETE /api/users/:id - 사용자 삭제
router.delete("/:id", deleteUserHandler);

export default router;
```

#### Controllers (컨트롤러)

- 요청 데이터 추출 및 검증
- 서비스 호출
- HTTP 응답 생성

#### Services (서비스)

- 비즈니스 로직 처리
- 데이터 조작
- 에러 발생

#### Models (모델)

- 데이터 구조 정의
- 타입 안정성 제공

---

## 📝 정리

### 핵심 키워드 요약

| 키워드                     | 설명                              | 주요 파일                                             |
| -------------------------- | --------------------------------- | ----------------------------------------------------- |
| **CRUD**                   | Create, Read, Update, Delete 작업 | `controllers/usersController.ts`                      |
| **Service Layer**          | 비즈니스 로직 처리 계층           | `services/usersService.ts`                            |
| **Controller**             | 요청/응답 처리 계층               | `controllers/usersController.ts`                      |
| **Middleware**             | 요청/응답 사이 실행 함수          | `middleware/*.ts`                                     |
| **Error Handling**         | 에러 처리 메커니즘                | `errors/CustomError.ts`, `middleware/errorHandler.ts` |
| **Request Validation**     | 요청 데이터 검증                  | `middleware/validateRequest.ts`                       |
| **CORS**                   | Cross-Origin Resource Sharing     | `middleware/cors.ts`                                  |
| **Environment Variables**  | 환경별 설정 관리                  | `config/env.ts`, `config/envValidation.ts`            |
| **TypeScript Interfaces**  | 타입 정의                         | `models/*.ts`                                         |
| **Separation of Concerns** | 관심사의 분리                     | 전체 프로젝트 구조                                    |

### 다음 단계

이제 1단계에서 구현한 개념들을 이해했으니, 실제로 API를 테스트해보고 다음 단계로 넘어갈 준비가 되었습니다!

---

**질문이 있으면 언제든 물어보세요!** 🚀
