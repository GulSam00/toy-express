# 1단계: 백엔드의 기본 구조 - 이론 가이드

프론트엔드 개발자를 위한 백엔드 기본 개념 설명서

---

## 📖 목차

1. [서버란 무엇인가](#서버란-무엇인가)
2. [Express.js 프레임워크](#expressjs-프레임워크)
3. [미들웨어 (Middleware)](#미들웨어-middleware)
4. [라우팅 (Routing)](#라우팅-routing)
5. [컨트롤러 (Controller)](#컨트롤러-controller)
6. [RESTful API](#restful-api)
7. [HTTP 메서드](#http-메서드)
8. [HTTP 상태 코드](#http-상태-코드)
9. [에러 핸들링](#에러-핸들링)
10. [요청/응답 사이클](#요청응답-사이클)
11. [환경 변수 관리](#환경-변수-관리)

---

## 서버란 무엇인가

### 개념

**서버(Server)**는 클라이언트의 요청을 받아서 처리하고 응답을 보내는 프로그램입니다.

```
클라이언트(프론트엔드)  ←→  서버(백엔드)
```

### 프론트엔드 vs 백엔드

| 구분     | 프론트엔드            | 백엔드                                |
| -------- | --------------------- | ------------------------------------- |
| **위치** | 사용자 브라우저       | 서버 컴퓨터                           |
| **역할** | 사용자 인터페이스     | 데이터 처리, 비즈니스 로직            |
| **언어** | JavaScript, HTML, CSS | JavaScript (Node.js), Python, Java 등 |
| **예시** | React 앱              | Express API 서버                      |

### 현재 프로젝트의 서버

```11:37:src/app.ts
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
```

이 코드는:

1. Express 앱을 생성합니다
2. 미들웨어를 설정합니다
3. 라우터를 연결합니다
4. 서버를 특정 포트(기본 4000)에서 실행합니다

---

## Express.js 프레임워크

### 개념

**Express.js**는 Node.js를 위한 웹 애플리케이션 프레임워크입니다. 서버를 쉽게 만들 수 있게 도와주는 도구입니다.

### 왜 Express를 사용하나?

1. **간단함**: 기본 HTTP 서버보다 쉽게 사용 가능
2. **미들웨어**: 요청/응답 처리 로직을 모듈화
3. **라우팅**: URL별로 다른 로직 실행
4. **생태계**: 많은 확장 패키지 존재

### Express 기본 구조

```typescript
import express from "express";

const app = express();

// 서버 실행
app.listen(4000, () => {
  console.log("서버가 실행되었습니다!");
});
```

---

## 미들웨어 (Middleware)

### 개념

**미들웨어**는 요청(Request)과 응답(Response) 사이에서 실행되는 함수입니다. 요청을 처리하기 전에 특정 작업을 수행합니다.

### 미들웨어의 역할

1. **요청 전처리**: 로깅, 인증, 데이터 파싱
2. **응답 후처리**: 데이터 변환, 로깅
3. **에러 처리**: 에러 발생 시 처리

### 미들웨어 실행 순서

```
요청 → 미들웨어1 → 미들웨어2 → 라우터 → 응답
```

**중요**: 미들웨어는 위에서 아래 순서로 실행됩니다!

### 현재 프로젝트의 미들웨어

```13:21:src/app.ts
// 미들웨어 설정
if (config.nodeEnv === "development") {
  app.use(morgan("dev")); // HTTP 요청 로깅
} else {
  app.use(morgan("combined")); // HTTP 요청 로깅
}

app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 데이터 파싱
```

#### 1. `morgan` - 로깅 미들웨어

- HTTP 요청을 로그로 기록
- 개발 환경: `dev` 형식 (간단)
- 프로덕션: `combined` 형식 (상세)

#### 2. `express.json()` - JSON 파싱

- 요청 본문(Body)의 JSON 데이터를 JavaScript 객체로 변환
- 예: `{"name": "홍길동"}` → `{ name: "홍길동" }`

```typescript
// 사용 예시
app.post("/api/users", (req, res) => {
  console.log(req.body); // { name: "홍길동" }
  // express.json() 없이는 req.body가 undefined
});
```

#### 3. `express.urlencoded()` - URL 인코딩 파싱

- HTML 폼 데이터를 파싱
- 예: `name=홍길동&age=20` → `{ name: "홍길동", age: "20" }`

### 커스텀 미들웨어 만들기

```typescript
// 로깅 미들웨어 예시
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next(); // 다음 미들웨어로 넘어가기
});
```

**중요**: `next()`를 호출해야 다음 미들웨어로 진행됩니다!

---

## 라우팅 (Routing)

### 개념

**라우팅**은 특정 URL 경로와 HTTP 메서드에 따라 다른 로직을 실행하는 것입니다.

### 라우팅 구조

```
URL: /api/users
HTTP 메서드: GET
→ getUsers 함수 실행
```

### 현재 프로젝트의 라우팅

```23:25:src/app.ts
// 라우터 설정
app.use("/", indexRouter);
app.use("/api/users", usersRouter);
```

이 코드는:

- `/` 경로 → `indexRouter` 사용
- `/api/users` 경로 → `usersRouter` 사용

### 라우터 파일 구조

```1:8:src/routes/users.ts
import { Router } from "express";
import { getUsers } from "../controllers/usersController.js";

const router = Router();

router.get("/", getUsers);

export default router;
```

**중요 개념**:

- `Router()`: Express의 라우터 객체 생성
- `router.get("/", ...)`: GET 메서드로 "/" 경로에 대한 핸들러 등록
- 실제 경로는 `/api/users` + `/` = `/api/users`

### 라우팅 예시

```typescript
// GET /api/users
router.get("/", getUsers);

// GET /api/users/:id
router.get("/:id", getUserById);

// POST /api/users
router.post("/", createUser);

// PUT /api/users/:id
router.put("/:id", updateUser);

// DELETE /api/users/:id
router.delete("/:id", deleteUser);
```

---

## 컨트롤러 (Controller)

### 개념

**컨트롤러**는 실제 비즈니스 로직을 처리하는 함수입니다. 라우터가 요청을 받으면 컨트롤러로 전달합니다.

### MVC 패턴

```
Model (데이터) ← → Controller (로직) ← → View (표시)
                           ↑
                      Router (라우팅)
```

### 현재 프로젝트의 컨트롤러

```1:15:src/controllers/usersController.ts
import { Request, Response } from "express";
import { ApiResponse } from "../models/index.js";

export const getUsers = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: true,
    data: {
      message: "Users endpoint",
      users: [],
      count: 0,
    },
  };

  res.json(response);
};
```

### 컨트롤러 구조 설명

1. **`req: Request`**: 클라이언트의 요청 정보
   - `req.body`: 요청 본문 (POST, PUT)
   - `req.params`: URL 파라미터 (`/users/:id` → `req.params.id`)
   - `req.query`: 쿼리 스트링 (`/users?page=1` → `req.query.page`)
   - `req.headers`: HTTP 헤더

2. **`res: Response`**: 서버의 응답 객체
   - `res.json(data)`: JSON 응답 보내기
   - `res.status(code)`: HTTP 상태 코드 설정
   - `res.send(data)`: 텍스트 응답 보내기

3. **응답 형식**: `ApiResponse` 타입 사용
   ```typescript
   {
     success: true,
     data: { ... }
   }
   ```

### 컨트롤러 예시

```typescript
// GET /api/users/:id
export const getUserById = (req: Request, res: Response): void => {
  const userId = req.params.id; // URL에서 id 추출

  // 데이터 조회 (나중에 데이터베이스에서)
  const user = { id: userId, name: "홍길동" };

  res.json({
    success: true,
    data: user,
  });
};

// POST /api/users
export const createUser = (req: Request, res: Response): void => {
  const { name, email } = req.body; // 요청 본문에서 데이터 추출

  // 사용자 생성 로직 (나중에 데이터베이스에 저장)
  const newUser = { id: 1, name, email };

  res.status(201).json({
    success: true,
    data: newUser,
  });
};
```

---

## RESTful API

### 개념

**RESTful API**는 웹 서비스를 설계하는 일관된 방법입니다. 리소스(자원)를 중심으로 설계합니다.

### REST의 핵심 원칙

1. **리소스 중심**: 모든 것을 리소스로 표현
   - 사용자 → `/users`
   - 게시글 → `/posts`

2. **HTTP 메서드 사용**: 동작을 메서드로 표현
   - GET: 조회
   - POST: 생성
   - PUT: 수정
   - DELETE: 삭제

3. **무상태(Stateless)**: 각 요청은 독립적

4. **일관된 URL 구조**:
   ```
   GET    /api/users      → 모든 사용자 조회
   GET    /api/users/:id  → 특정 사용자 조회
   POST   /api/users      → 사용자 생성
   PUT    /api/users/:id  → 사용자 수정
   DELETE /api/users/:id  → 사용자 삭제
   ```

### RESTful API 예시

```typescript
// 사용자 리소스에 대한 CRUD 작업
router.get("/users", getUsers); // 조회 (Read)
router.get("/users/:id", getUserById); // 조회 (Read)
router.post("/users", createUser); // 생성 (Create)
router.put("/users/:id", updateUser); // 수정 (Update)
router.delete("/users/:id", deleteUser); // 삭제 (Delete)
```

---

## HTTP 메서드

### 개념

**HTTP 메서드**는 클라이언트가 서버에 무엇을 하고 싶은지 알려주는 동사입니다.

### 주요 HTTP 메서드

| 메서드     | 의미      | 사용 예시             | 안전성  | 멱등성  |
| ---------- | --------- | --------------------- | ------- | ------- |
| **GET**    | 조회      | 사용자 목록 가져오기  | ✅ 안전 | ✅ 멱등 |
| **POST**   | 생성      | 새 사용자 만들기      | ❌      | ❌      |
| **PUT**    | 전체 수정 | 사용자 정보 전체 교체 | ❌      | ✅ 멱등 |
| **PATCH**  | 부분 수정 | 사용자 이름만 변경    | ❌      | ❌      |
| **DELETE** | 삭제      | 사용자 삭제           | ❌      | ✅ 멱등 |

**안전성(Safe)**: 서버의 상태를 변경하지 않음

**멱등성(Idempotent)**: 같은 요청을 여러 번 해도 결과가 같음

### HTTP 메서드 사용 예시

```typescript
// GET: 데이터 조회 (요청 본문 없음)
router.get("/users", (req, res) => {
  // req.body는 사용하지 않음
  const users = getUsersFromDatabase();
  res.json({ success: true, data: users });
});

// POST: 데이터 생성 (요청 본문 필요)
router.post("/users", (req, res) => {
  const { name, email } = req.body; // 요청 본문에서 데이터 추출
  const newUser = createUser({ name, email });
  res.status(201).json({ success: true, data: newUser });
});

// PUT: 전체 수정
router.put("/users/:id", (req, res) => {
  const userId = req.params.id;
  const userData = req.body; // 전체 사용자 정보
  const updatedUser = updateUser(userId, userData);
  res.json({ success: true, data: updatedUser });
});

// DELETE: 삭제
router.delete("/users/:id", (req, res) => {
  const userId = req.params.id;
  deleteUser(userId);
  res.status(204).send(); // 204 No Content
});
```

---

## HTTP 상태 코드

### 개념

**HTTP 상태 코드**는 요청이 성공했는지 실패했는지, 어떤 종류의 문제인지 알려주는 3자리 숫자입니다.

### 주요 상태 코드

#### 2xx: 성공

| 코드    | 의미       | 사용 예시                         |
| ------- | ---------- | --------------------------------- |
| **200** | OK         | GET 요청 성공                     |
| **201** | Created    | POST 요청 성공 (리소스 생성)      |
| **204** | No Content | DELETE 요청 성공 (응답 본문 없음) |

#### 4xx: 클라이언트 오류

| 코드    | 의미         | 사용 예시                     |
| ------- | ------------ | ----------------------------- |
| **400** | Bad Request  | 잘못된 요청 데이터            |
| **401** | Unauthorized | 인증 필요                     |
| **403** | Forbidden    | 권한 없음                     |
| **404** | Not Found    | 리소스를 찾을 수 없음         |
| **409** | Conflict     | 리소스 충돌 (예: 중복 이메일) |

#### 5xx: 서버 오류

| 코드    | 의미                  | 사용 예시        |
| ------- | --------------------- | ---------------- |
| **500** | Internal Server Error | 서버 내부 오류   |
| **503** | Service Unavailable   | 서비스 사용 불가 |

### 상태 코드 사용 예시

```typescript
// 성공
res.status(200).json({ success: true, data: users });
res.status(201).json({ success: true, data: newUser });

// 클라이언트 오류
res.status(400).json({ success: false, error: "잘못된 요청" });
res.status(404).json({ success: false, error: "사용자를 찾을 수 없습니다" });

// 서버 오류
res.status(500).json({ success: false, error: "서버 오류가 발생했습니다" });
```

### 현재 프로젝트의 상태 코드 사용

```29:34:src/middleware/errorHandler.ts
  const response: ApiResponse = {
    success: false,
    error: message,
  };

  res.status(statusCode).json(response);
```

에러 핸들러에서 상태 코드를 동적으로 설정합니다.

---

## 에러 핸들링

### 개념

**에러 핸들링**은 발생할 수 있는 오류를 처리하는 것입니다. 예상치 못한 상황에서도 서버가 안정적으로 동작하도록 합니다.

### 에러 핸들링 전략

1. **예상 가능한 에러**: 명시적으로 처리
2. **예상 불가능한 에러**: 전역 에러 핸들러로 처리

### 현재 프로젝트의 에러 핸들링

#### 1. 404 핸들러 (Not Found)

```4:10:src/middleware/notFoundHandler.ts
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  next(createError(404, `Route ${req.method} ${req.path} not found`));
};
```

- 정의되지 않은 라우트에 접근할 때 실행
- `createError`로 404 에러 생성 후 다음 미들웨어(에러 핸들러)로 전달

#### 2. 전역 에러 핸들러

```6:35:src/middleware/errorHandler.ts
export const errorHandler = (
  err: Error | createError.HttpError,
  req: Request,
  res: Response,
  // next: NextFunction,
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (createError.isHttpError(err)) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
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

**에러 핸들러의 역할**:

1. 에러 타입 확인 (HTTP 에러 vs 일반 에러)
2. 상태 코드 설정
3. 로깅 (개발/프로덕션 환경별)
4. 클라이언트에 에러 응답

### 에러 핸들링 순서

```
요청 → 라우터 → 컨트롤러 → 에러 발생
                           ↓
                      에러 핸들러 → 응답
```

### 에러 핸들링 예시

```typescript
// 컨트롤러에서 에러 발생
export const getUserById = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const userId = req.params.id;

    if (!userId) {
      throw createError(400, "사용자 ID가 필요합니다");
    }

    const user = findUserById(userId);

    if (!user) {
      throw createError(404, "사용자를 찾을 수 없습니다");
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error); // 에러 핸들러로 전달
  }
};
```

---

## 요청/응답 사이클

### 개념

**요청/응답 사이클**은 클라이언트가 요청을 보내고 서버가 응답을 보내는 전체 과정입니다.

### 전체 흐름

```
1. 클라이언트 요청
   ↓
2. 미들웨어 실행 (로깅, 파싱 등)
   ↓
3. 라우터 매칭 (URL과 메서드 확인)
   ↓
4. 컨트롤러 실행 (비즈니스 로직)
   ↓
5. 응답 전송
```

### 현재 프로젝트의 요청/응답 사이클

```typescript
// 1. 클라이언트 요청: GET /api/users

// 2. 미들웨어 실행
app.use(morgan("dev")); // 로깅
app.use(express.json()); // JSON 파싱

// 3. 라우터 매칭
app.use("/api/users", usersRouter); // /api/users 경로 매칭

// 4. 라우터 내부
router.get("/", getUsers); // GET 메서드 매칭

// 5. 컨트롤러 실행
export const getUsers = (req, res) => {
  res.json({ success: true, data: { users: [] } });
};

// 6. 응답 전송: { success: true, data: { users: [] } }
```

### 실제 요청 예시

```bash
# 클라이언트에서 요청
curl http://localhost:4000/api/users

# 서버 응답
{
  "success": true,
  "data": {
    "message": "Users endpoint",
    "users": [],
    "count": 0
  }
}
```

---

## 환경 변수 관리

### 개념

**환경 변수**는 애플리케이션 설정을 코드 밖에서 관리하는 방법입니다. 환경(개발/프로덕션)에 따라 다른 값을 사용할 수 있습니다.

### 왜 환경 변수를 사용하나?

1. **보안**: 비밀번호, API 키 등을 코드에 직접 작성하지 않음
2. **유연성**: 환경별로 다른 설정 사용
3. **관리 용이성**: 설정 변경 시 코드 수정 불필요

### 현재 프로젝트의 환경 변수 관리

```1:11:src/config/env.ts
import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  databaseUrl: process.env.DATABASE_URL || "file:./dev.db",
} as const;
```

### 환경 변수 사용 방법

1. **`.env` 파일 생성** (프로젝트 루트)

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=my-secret-key
DATABASE_URL=file:./dev.db
```

2. **코드에서 사용**

```typescript
// config 객체로 통합 관리
import { config } from "./config/env.js";

// process.env.PORT로 접근
const port = process.env.PORT || "4000";

console.log(config.port); // 4000
```

3. **환경별 설정**

```typescript
// 개발 환경
NODE_ENV=development
DATABASE_URL=file:./dev.db

// 프로덕션 환경
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### 환경 변수 보안 주의사항

❌ **하지 말아야 할 것**:

- `.env` 파일을 Git에 커밋
- 코드에 비밀번호 직접 작성

✅ **해야 할 것**:

- `.env.example` 파일 생성 (템플릿)
- `.gitignore`에 `.env` 추가
- 프로덕션에서는 환경 변수를 안전하게 관리

---

## 📝 정리

### 핵심 개념

1. **서버**: 클라이언트의 요청을 처리하고 응답을 보내는 프로그램
2. **Express**: Node.js 웹 애플리케이션 프레임워크
3. **미들웨어**: 요청/응답 사이에서 실행되는 함수
4. **라우팅**: URL과 HTTP 메서드에 따라 다른 로직 실행
5. **컨트롤러**: 실제 비즈니스 로직을 처리하는 함수
6. **RESTful API**: 리소스 중심의 API 설계 방법
7. **HTTP 메서드**: GET(조회), POST(생성), PUT(수정), DELETE(삭제)
8. **HTTP 상태 코드**: 요청 결과를 나타내는 코드 (200, 404, 500 등)
9. **에러 핸들링**: 오류 상황을 처리하는 방법
10. **환경 변수**: 설정을 코드 밖에서 관리하는 방법

### 다음 단계

이제 이론을 바탕으로 실제로 CRUD API를 구현해보겠습니다!
