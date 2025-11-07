# 1단계 실습 가이드

이 가이드는 1단계에서 구현한 기능들을 테스트하는 방법을 안내합니다.

## 📋 구현 완료 항목

✅ **User 타입 정의 및 데이터 모델 생성**

- `src/models/User.ts`: User 인터페이스 정의
- `src/services/usersService.ts`: 비즈니스 로직 구현 (메모리 기반)

✅ **완전한 CRUD API 구현**

- GET `/api/users` - 모든 사용자 조회
- GET `/api/users/:id` - 특정 사용자 조회
- POST `/api/users` - 사용자 생성
- PUT `/api/users/:id` - 사용자 수정
- DELETE `/api/users/:id` - 사용자 삭제

✅ **커스텀 에러 클래스**

- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)

✅ **요청 검증 미들웨어**

- 요청 본문 검증
- 필수 필드 검증

✅ **CORS 미들웨어**

- 개발/프로덕션 환경별 설정

✅ **환경 변수 검증**

- 프로덕션 환경 필수 변수 검증
- 포트 번호 검증
- Node 환경 검증

## 🚀 서버 실행

```bash
# 개발 서버 실행
pnpm dev
```

서버가 `http://localhost:4000`에서 실행됩니다.

## 🧪 API 테스트

### API 테스트 도구 선택

API를 테스트하는 방법은 여러 가지가 있습니다:

1. **Apidog** (권장) - 직관적인 UI, 한국어 지원
   - [Apidog 튜토리얼](./APIDOG-TUTORIAL.md) 참고
2. **Postman** - 널리 사용되는 도구
3. **Thunder Client** - VS Code 확장 프로그램
4. **cURL** - 터미널 명령어

이 가이드에서는 **cURL** 명령어와 **Apidog** 사용법을 모두 제공합니다.

---

### 1. 모든 사용자 조회

```bash
curl http://localhost:4000/api/users
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "users": [],
    "count": 0
  }
}
```

### 2. 사용자 생성

```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동",
    "email": "hong@example.com"
  }'
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "홍길동",
    "email": "hong@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "사용자가 생성되었습니다"
}
```

### 3. 특정 사용자 조회

```bash
curl http://localhost:4000/api/users/1
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "홍길동",
    "email": "hong@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. 사용자 수정

```bash
curl -X PUT http://localhost:4000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동 (수정)",
    "email": "hong.updated@example.com"
  }'
```

**응답 예시:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "홍길동 (수정)",
    "email": "hong.updated@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:01.000Z"
  },
  "message": "사용자 정보가 수정되었습니다"
}
```

### 5. 사용자 삭제

```bash
curl -X DELETE http://localhost:4000/api/users/1
```

**응답:** 204 No Content (응답 본문 없음)

## ❌ 에러 테스트

### 잘못된 요청 (400 Bad Request)

```bash
# 필수 필드 누락
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동"
  }'
```

**응답:**

```json
{
  "success": false,
  "error": "이름과 이메일은 필수입니다"
}
```

### 유효하지 않은 이메일 형식

```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "홍길동",
    "email": "invalid-email"
  }'
```

**응답:**

```json
{
  "success": false,
  "error": "유효하지 않은 이메일 형식입니다"
}
```

### 사용자를 찾을 수 없음 (404 Not Found)

```bash
curl http://localhost:4000/api/users/999
```

**응답:**

```json
{
  "success": false,
  "error": "사용자를 찾을 수 없습니다"
}
```

### 중복 이메일 (409 Conflict)

```bash
# 같은 이메일로 두 번째 사용자 생성 시도
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "다른 사용자",
    "email": "hong@example.com"
  }'
```

**응답:**

```json
{
  "success": false,
  "error": "이미 존재하는 이메일입니다"
}
```

### 존재하지 않는 라우트 (404 Not Found)

```bash
curl http://localhost:4000/api/nonexistent
```

**응답:**

```json
{
  "success": false,
  "error": "Route GET /api/nonexistent not found"
}
```

## 📝 Apidog 사용하기

Apidog를 사용하면 더 편리하고 직관적으로 API를 테스트할 수 있습니다:

1. [Apidog 튜토리얼](./APIDOG-TUTORIAL.md) 문서 참고
2. Apidog 설치 및 실행
3. 환경 변수 설정 (`baseUrl = http://localhost:4000`)
4. 컬렉션 생성 ("Users API")
5. 각 엔드포인트에 대한 요청 생성
6. 테스트 실행

**추가 기능:**

- 테스트 스크립트 작성으로 자동 검증
- 변수를 사용하여 동적 테스트
- 컬렉션 실행으로 여러 요청 순차 실행
- API 문서 자동 생성

## 🔍 주요 파일 구조

```
src/
├── models/
│   ├── User.ts              # User 타입 정의
│   └── index.ts             # 공통 타입 및 export
├── services/
│   └── usersService.ts      # 비즈니스 로직
├── controllers/
│   └── usersController.ts   # 컨트롤러 (요청/응답 처리)
├── routes/
│   └── users.ts             # 라우팅 정의
├── middleware/
│   ├── cors.ts              # CORS 처리
│   ├── validateRequest.ts   # 요청 검증
│   ├── errorHandler.ts      # 에러 핸들링
│   └── notFoundHandler.ts   # 404 핸들링
├── errors/
│   └── CustomError.ts       # 커스텀 에러 클래스
└── config/
    ├── env.ts               # 환경 변수 설정
    └── envValidation.ts     # 환경 변수 검증
```

## ✅ 체크리스트

다음 항목들을 확인해보세요:

- [ ] 서버가 정상적으로 실행되는가?
- [ ] 모든 CRUD 작업이 정상 동작하는가?
- [ ] 에러 핸들링이 제대로 되는가?
- [ ] 요청 검증이 작동하는가?
- [ ] CORS가 설정되어 있는가?
- [ ] 환경 변수 검증이 작동하는가?
- [ ] 로깅이 제대로 되는가?

## 🎯 다음 단계

1단계를 완료했다면 다음을 학습할 수 있습니다:

- 데이터베이스 연동 (2단계)
- Docker 컨테이너화 (2단계)
- CI/CD 파이프라인 (2단계)

---

**문제가 발생하면 에러 메시지를 확인하고, 로그를 살펴보세요!** 🐛
