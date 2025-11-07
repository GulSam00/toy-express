# toy-express

Node.js(Express) + TypeScript 기반 백엔드 서버 프로젝트

프론트엔드 개발자를 위한 백엔드 및 인프라 학습을 위한 실습 프로젝트입니다.

## 📚 학습 커리큘럼

이 프로젝트는 단계별 학습 커리큘럼을 제공합니다. 자세한 내용은 [docs/CURRICULUM.md](./docs/CURRICULUM.md)를 참고하세요.

### 학습 단계

1. **백엔드의 기본 구조** - Express 서버 구조, RESTful API, 미들웨어
2. **백엔드 배포 & 인프라 기초** - 데이터베이스 연동, Docker, CI/CD
3. **클라우드 서비스의 본질 이해** - 클라우드 배포, 스토리지, 네트워킹
4. **DevOps 사고방식 확장** - 모니터링, 로깅, 성능 최적화, 보안
5. **실제 서비스 설계 연습** - 전체 서비스 설계, 프로덕션 환경 구성

## 🚀 시작하기

### 필요 사항

- Node.js 18 이상
- pnpm (또는 npm, yarn)

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 린팅
pnpm lint
```

서버는 기본적으로 `http://localhost:4000`에서 실행됩니다.

## 📁 프로젝트 구조

```
src/
├── app.ts                 # Express 앱 설정
├── bin/                   # 서버 실행 스크립트
├── config/                # 환경 설정
├── controllers/           # 컨트롤러
├── middleware/            # 미들웨어
├── models/                # 데이터 모델
├── routes/                # 라우터
├── services/              # 비즈니스 로직
└── utils/                 # 유틸리티
```

## 📖 커리큘럼 따라하기

1. [CURRICULUM.md](./CURRICULUM.md) 파일을 열어 전체 커리큘럼 확인
2. [docs/README.md](./docs/README.md)에서 각 단계별 이론 가이드 확인
3. 1단계부터 순서대로 이론 학습 후 실습 진행
4. 각 단계의 체크리스트를 완료하면서 학습

## 🛠️ 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Package Manager**: pnpm

## 📝 라이선스

LICENSE 파일을 참고하세요.
