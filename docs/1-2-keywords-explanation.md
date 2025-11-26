# 1.2 서버 구조 & RESTful API - 키워드 설명

1단계 1.1절(서버 구조)과 1.2절(RESTful API)에서 구현한 개념을 실제 코드와 함께 설명합니다.

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

```typescript
// src/controllers/usersController.ts
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

```typescript
// src/controllers/usersController.ts
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

```typescript
// src/controllers/usersController.ts
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

```typescript
// src/controllers/usersController.ts
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

```typescript
// src/services/usersService.ts
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

```typescript
// src/controllers/usersController.ts
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

## 4. TypeScript Interfaces (타입 정의)

> **참고**: 미들웨어, 에러 핸들링, 환경 변수에 대한 자세한 설명은 다음 문서를 참조하세요:
>
> - [1-3-middleware-explanation.md](./1-3-middleware-explanation.md) - 미들웨어 활용
> - [1-4-error-handling-explanation.md](./1-4-error-handling-explanation.md) - 에러 핸들링 강화
> - [1-5-environment-variables-explanation.md](./1-5-environment-variables-explanation.md) - 환경 변수 관리

### 개념

**TypeScript Interfaces**는 데이터 구조를 정의하는 타입입니다. 코드의 안정성과 가독성을 높입니다.

### 구현 코드

#### 1. User 인터페이스

```typescript
// src/models/User.ts
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

```typescript
// src/models/index.ts
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

```typescript
// src/routes/users.ts
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

### 핵심 키워드 요약 (1.1~1.2)

| 키워드                     | 설명                              | 주요 파일                        |
| -------------------------- | --------------------------------- | -------------------------------- |
| **CRUD**                   | Create, Read, Update, Delete 작업 | `controllers/usersController.ts` |
| **Service Layer**          | 비즈니스 로직 처리 계층           | `services/usersService.ts`       |
| **Controller**             | 요청/응답 처리 계층               | `controllers/usersController.ts` |
| **TypeScript Interfaces**  | 타입 정의                         | `models/*.ts`                    |
| **Separation of Concerns** | 관심사의 분리                     | 전체 프로젝트 구조               |

### 관련 문서

- [1-3-middleware-explanation.md](./1-3-middleware-explanation.md) - 미들웨어 활용 (1.3)
- [1-4-error-handling-explanation.md](./1-4-error-handling-explanation.md) - 에러 핸들링 강화 (1.4)
- [1-5-environment-variables-explanation.md](./1-5-environment-variables-explanation.md) - 환경 변수 관리 (1.5)

---

**질문이 있으면 언제든 물어보세요!** 🚀
