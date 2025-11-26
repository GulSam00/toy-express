# 2단계: 백엔드 배포 & 인프라 기초 - 이론 가이드

프론트엔드 개발자를 위한 백엔드 배포 및 인프라 기초 개념 설명서

---

## 📖 목차

1. [데이터베이스란 무엇인가](#데이터베이스란-무엇인가)
2. [ORM과 쿼리 빌더](#orm과-쿼리-빌더)
3. [데이터베이스 연결](#데이터베이스-연결)
4. [마이그레이션](#마이그레이션)
5. [Docker 기초](#docker-기초)
6. [CI/CD 파이프라인](#cicd-파이프라인)
7. [환경 변수와 시크릿 관리](#환경-변수와-시크릿-관리)

---

## 데이터베이스란 무엇인가

### 개념

**데이터베이스**는 데이터를 체계적으로 저장하고 관리하는 시스템입니다. 현재 프로젝트는 메모리에 데이터를 저장하고 있어서 서버를 재시작하면 데이터가 사라집니다.

### 메모리 저장소 vs 데이터베이스

| 구분 | 메모리 저장소 (현재) | 데이터베이스 |
|------|---------------------|-------------|
| **데이터 지속성** | 서버 재시작 시 사라짐 | 영구 저장 |
| **용량** | 제한적 (RAM 크기) | 거의 무제한 |
| **속도** | 매우 빠름 | 빠름 (인덱스 활용 시) |
| **복잡한 쿼리** | 불가능 | 가능 |
| **동시 접근** | 제한적 | 효율적 |

### 데이터베이스 종류

#### 1. 관계형 데이터베이스 (RDBMS)

**특징:**
- 테이블 구조로 데이터 저장
- SQL 언어 사용
- 데이터 무결성 보장
- 트랜잭션 지원

**예시:**
- **PostgreSQL**: 강력하고 확장 가능
- **MySQL**: 널리 사용됨
- **SQLite**: 경량, 파일 기반

#### 2. NoSQL 데이터베이스

**특징:**
- 유연한 스키마
- 수평 확장 용이
- 다양한 데이터 모델

**예시:**
- **MongoDB**: 문서 기반
- **Redis**: 키-값 저장소
- **Cassandra**: 컬럼 기반

### 현재 프로젝트의 데이터 저장소

```typescript
// src/services/usersService.ts
import { ConflictError, NotFoundError } from "../errors/CustomError.js";
import { CreateUserInput, UpdateUserInput, User } from "../models/User.js";

// 임시 데이터 저장소 (나중에 데이터베이스로 교체)
const users: User[] = [];
let nextId = 1;
```

이 코드는 메모리에 데이터를 저장합니다. 서버를 재시작하면 모든 데이터가 사라집니다.

---

## ORM과 쿼리 빌더

### 개념

**ORM (Object-Relational Mapping)**과 **쿼리 빌더**는 데이터베이스와 상호작용하는 도구입니다. SQL 쿼리를 직접 작성하지 않고 JavaScript/TypeScript 코드로 데이터베이스를 조작할 수 있습니다.

### ORM vs 쿼리 빌더

| 구분 | ORM | 쿼리 빌더 |
|------|-----|-----------|
| **추상화 수준** | 높음 (객체 지향) | 중간 (SQL 유사) |
| **학습 곡선** | 가파름 | 완만함 |
| **성능 제어** | 제한적 | 세밀한 제어 가능 |
| **복잡한 쿼리** | 제한적 | 유연함 |

### 주요 ORM/쿼리 빌더

#### 1. Prisma (권장)

**장점:**
- TypeScript 완벽 지원
- 직관적인 API
- 자동 타입 생성
- 마이그레이션 관리 편리

**예시:**
```typescript
// Prisma 사용 예시
const user = await prisma.user.create({
  data: {
    name: "홍길동",
    email: "hong@example.com",
  },
});
```

#### 2. TypeORM

**장점:**
- TypeScript 친화적
- 데코레이터 기반
- 다양한 데이터베이스 지원

**예시:**
```typescript
// TypeORM 사용 예시
const user = new User();
user.name = "홍길동";
user.email = "hong@example.com";
await userRepository.save(user);
```

#### 3. Sequelize

**장점:**
- 오래되고 안정적
- 널리 사용됨
- 풍부한 기능

**예시:**
```typescript
// Sequelize 사용 예시
const user = await User.create({
  name: "홍길동",
  email: "hong@example.com",
});
```

### 선택 가이드

- **Prisma**: TypeScript 프로젝트, 빠른 개발, 모던한 API 선호
- **TypeORM**: 복잡한 관계, 데코레이터 선호
- **Sequelize**: 전통적인 방식, 기존 프로젝트와의 호환성

---

## 데이터베이스 연결

### 연결 풀 (Connection Pool)

**연결 풀**은 데이터베이스 연결을 미리 만들어두고 재사용하는 메커니즘입니다.

### 왜 연결 풀을 사용하나?

1. **성능**: 연결 생성 비용 절감
2. **효율성**: 연결 재사용
3. **안정성**: 동시 접속 수 제한

### 연결 풀 설정 예시

```typescript
// Prisma 연결 풀 설정
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // 연결 풀 설정
  connectionLimit: 10, // 최대 연결 수
});
```

### 환경별 데이터베이스 설정

```typescript
// 개발 환경
DATABASE_URL=postgresql://user:password@localhost:5432/toy_express_dev

// 프로덕션 환경
DATABASE_URL=postgresql://user:password@prod-server:5432/toy_express_prod
```

---

## 마이그레이션

### 개념

**마이그레이션**은 데이터베이스 스키마 변경을 버전 관리하는 방법입니다. 코드처럼 데이터베이스 구조도 버전 관리할 수 있습니다.

### 마이그레이션의 필요성

1. **버전 관리**: 스키마 변경 이력 추적
2. **협업**: 팀원들과 스키마 동기화
3. **배포**: 프로덕션 환경에 안전하게 적용
4. **롤백**: 문제 발생 시 이전 상태로 복구

### 마이그레이션 예시

#### Prisma 마이그레이션

```prisma
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

마이그레이션 생성:
```bash
npx prisma migrate dev --name create_user_table
```

### 마이그레이션 파일 구조

```
prisma/
├── migrations/
│   ├── 20240101000000_create_user_table/
│   │   └── migration.sql
│   └── 20240102000000_add_user_phone/
│       └── migration.sql
└── schema.prisma
```

---

## Docker 기초

### 개념

**Docker**는 애플리케이션을 컨테이너로 패키징하여 어디서나 동일하게 실행할 수 있게 해주는 도구입니다.

### 왜 Docker를 사용하나?

1. **일관성**: 개발/프로덕션 환경 동일
2. **격리**: 애플리케이션 간 충돌 방지
3. **이식성**: 어떤 환경에서든 실행 가능
4. **확장성**: 쉽게 스케일링

### Docker 기본 개념

#### 1. 이미지 (Image)

**이미지**는 애플리케이션과 실행 환경을 포함한 템플릿입니다.

```
이미지 = 애플리케이션 코드 + 런타임 + 의존성 + 설정
```

#### 2. 컨테이너 (Container)

**컨테이너**는 이미지를 실행한 인스턴스입니다.

```
이미지 → 실행 → 컨테이너
```

#### 3. Dockerfile

**Dockerfile**은 이미지를 만드는 레시피입니다.

```dockerfile
# 예시 Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/app.js"]
```

### Docker Compose

**Docker Compose**는 여러 컨테이너를 함께 관리하는 도구입니다.

```yaml
# docker-compose.yml 예시
version: '3.8'
services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## CI/CD 파이프라인

### 개념

**CI/CD**는 Continuous Integration (지속적 통합)과 Continuous Deployment (지속적 배포)를 의미합니다.

### CI (Continuous Integration)

**CI**는 코드 변경을 자동으로 통합하고 테스트하는 과정입니다.

**CI 프로세스:**
```
코드 커밋 → 자동 빌드 → 자동 테스트 → 결과 보고
```

**장점:**
- 버그 조기 발견
- 코드 품질 유지
- 통합 문제 예방

### CD (Continuous Deployment)

**CD**는 테스트를 통과한 코드를 자동으로 배포하는 과정입니다.

**CD 프로세스:**
```
테스트 통과 → 자동 배포 → 배포 확인
```

### GitHub Actions

**GitHub Actions**는 GitHub에서 제공하는 CI/CD 도구입니다.

**기본 구조:**
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm run build
      - run: npm test
```

### CI/CD 파이프라인 단계

1. **코드 품질 검사**
   - 린팅 (ESLint)
   - 타입 체크 (TypeScript)
   - 포맷팅 검사

2. **빌드**
   - TypeScript 컴파일
   - 의존성 설치
   - 빌드 검증

3. **테스트**
   - Unit 테스트
   - Integration 테스트
   - E2E 테스트

4. **배포**
   - 개발 환경 배포
   - 프로덕션 환경 배포

---

## 환경 변수와 시크릿 관리

### 개념

**환경 변수**는 애플리케이션 설정을 코드 밖에서 관리하는 방법입니다. **시크릿**은 민감한 정보(비밀번호, API 키 등)를 안전하게 관리하는 것입니다.

### 환경 변수 vs 시크릿

| 구분 | 환경 변수 | 시크릿 |
|------|----------|--------|
| **용도** | 일반 설정 | 민감한 정보 |
| **예시** | PORT, NODE_ENV | 비밀번호, API 키 |
| **보안** | 상대적으로 안전 | 매우 민감 |
| **관리** | 코드 저장소에 포함 가능 | 별도 관리 필요 |

### 시크릿 관리 방법

#### 1. 환경 변수 파일 (로컬 개발)

```env
# .env (Git에 커밋하지 않음)
DATABASE_URL=postgresql://user:password@localhost:5432/db
JWT_SECRET=your-secret-key
```

#### 2. 환경 변수 검증

```typescript
// zod를 사용한 환경 변수 검증
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.string().transform(Number),
});

const env = envSchema.parse(process.env);
```

#### 3. 프로덕션 시크릿 관리

**옵션:**
- **환경 변수**: 배포 플랫폼의 환경 변수 설정
- **시크릿 관리 서비스**: AWS Secrets Manager, HashiCorp Vault
- **CI/CD 시크릿**: GitHub Secrets, GitLab CI/CD Variables

### 보안 모범 사례

❌ **하지 말아야 할 것:**
- 시크릿을 코드에 직접 작성
- `.env` 파일을 Git에 커밋
- 시크릿을 로그에 출력

✅ **해야 할 것:**
- `.env.example` 파일 생성 (값 없이)
- `.gitignore`에 `.env` 추가
- 환경 변수 검증
- 프로덕션에서는 시크릿 관리 서비스 사용

---

## 📝 정리

### 핵심 개념

1. **데이터베이스**: 영구 데이터 저장소
2. **ORM/쿼리 빌더**: 데이터베이스 조작 도구
3. **마이그레이션**: 스키마 버전 관리
4. **Docker**: 컨테이너 기반 배포
5. **CI/CD**: 자동화된 빌드/테스트/배포
6. **시크릿 관리**: 민감한 정보 안전 관리

### 다음 단계

이제 이론을 바탕으로 실제로 데이터베이스를 연동하고 Docker를 설정해보겠습니다!

---

**질문이 있으면 언제든 물어보세요!** 🚀

