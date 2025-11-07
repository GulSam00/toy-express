# Apidog 튜토리얼

이 문서는 Apidog를 사용하여 API를 테스트하는 방법을 안내합니다.

---

## 📖 목차

1. [Apidog란?](#apidog란)
2. [설치 및 시작하기](#설치-및-시작하기)
3. [기본 사용법](#기본-사용법)
4. [프로젝트 API 테스트하기](#프로젝트-api-테스트하기)
5. [고급 기능](#고급-기능)
6. [팁과 모범 사례](#팁과-모범-사례)

---

## Apidog란?

**Apidog**는 API 설계, 개발, 테스트, 문서화를 한 곳에서 할 수 있는 올인원 API 플랫폼입니다.

### 주요 기능

- 🔧 **API 테스트**: HTTP 요청 전송 및 응답 확인
- 📝 **API 문서화**: 자동으로 API 문서 생성
- 🎨 **인터페이스**: 직관적이고 사용하기 쉬운 UI
- 🔄 **협업**: 팀원들과 API 공유
- 📦 **컬렉션 관리**: 요청을 그룹으로 관리
- 🔐 **환경 변수**: 환경별 설정 관리

### Postman과의 차이점

- 더 직관적인 인터페이스
- 한국어 지원
- 무료 플랜에서 더 많은 기능 제공
- API 문서 자동 생성 기능

---

## 설치 및 시작하기

### 1. Apidog 다운로드

1. [Apidog 공식 웹사이트](https://apidog.com/) 방문
2. "다운로드" 버튼 클릭
3. 운영체제에 맞는 버전 선택 (Windows, macOS, Linux)
4. 설치 파일 다운로드 및 실행

### 2. 계정 생성

1. Apidog 실행
2. "회원가입" 또는 "Sign Up" 클릭
3. 이메일 주소로 회원가입
4. 이메일 인증 완료

### 3. 첫 프로젝트 생성

1. 로그인 후 "새 프로젝트" 클릭
2. 프로젝트 이름 입력 (예: "toy-express API")
3. "생성" 클릭

---

## 기본 사용법

### 1. 새 요청 만들기

1. 왼쪽 사이드바에서 "HTTP" 클릭
2. "새 요청" 또는 "+" 버튼 클릭
3. 요청 이름 입력 (예: "사용자 목록 조회")

### 2. 요청 설정

#### HTTP 메서드 선택

요청 방법 옆 드롭다운에서 선택:

- **GET**: 데이터 조회
- **POST**: 데이터 생성
- **PUT**: 데이터 수정
- **DELETE**: 데이터 삭제

#### URL 입력

```
http://localhost:4000/api/users
```

#### Headers 설정

"Headers" 탭에서 헤더 추가:

- `Content-Type: application/json` (POST, PUT 요청 시 필수)

#### Body 설정 (POST, PUT 요청 시)

"Body" 탭에서:

1. "JSON" 선택
2. JSON 데이터 입력:

```json
{
  "name": "홍길동",
  "email": "hong@example.com"
}
```

### 3. 요청 보내기

1. "Send" 또는 "전송" 버튼 클릭
2. 아래에 응답 결과가 표시됩니다

### 4. 응답 확인

응답 영역에서 다음을 확인할 수 있습니다:

- **상태 코드**: 200, 201, 404 등
- **응답 본문**: JSON 데이터
- **응답 시간**: 요청 처리 시간
- **응답 헤더**: 서버가 보낸 헤더 정보

---

## 프로젝트 API 테스트하기

이 섹션에서는 현재 프로젝트의 API를 Apidog로 테스트하는 방법을 단계별로 안내합니다.

### 서버 실행

먼저 서버를 실행해야 합니다:

```bash
pnpm dev
```

서버가 `http://localhost:4000`에서 실행됩니다.

### 1. 환경 변수 설정

환경 변수를 설정하면 URL을 쉽게 관리할 수 있습니다.

1. 상단 오른쪽의 환경 선택 드롭다운 클릭
2. "환경 관리" 또는 "Manage Environments" 클릭
3. "새 환경" 클릭
4. 환경 이름: `Local Development`
5. 변수 추가:
   - 변수명: `baseUrl`
   - 초기값: `http://localhost:4000`
6. "저장" 클릭

이제 URL에 `{{baseUrl}}`을 사용할 수 있습니다:

```
{{baseUrl}}/api/users
```

### 2. 컬렉션 생성

관련된 요청들을 그룹으로 관리하기 위해 컬렉션을 만듭니다.

1. 왼쪽 사이드바에서 "컬렉션" 또는 "Collections" 클릭
2. "+ 새 컬렉션" 클릭
3. 컬렉션 이름: "Users API"
4. "생성" 클릭

### 3. API 엔드포인트 테스트

#### 3.1 모든 사용자 조회 (GET)

1. "Users API" 컬렉션에서 "새 요청" 클릭
2. 요청 이름: "모든 사용자 조회"
3. HTTP 메서드: **GET**
4. URL: `{{baseUrl}}/api/users`
5. "Send" 클릭

**예상 응답:**

```json
{
  "success": true,
  "data": {
    "users": [],
    "count": 0
  }
}
```

**상태 코드:** 200 OK

---

#### 3.2 사용자 생성 (POST)

1. "Users API" 컬렉션에서 "새 요청" 클릭
2. 요청 이름: "사용자 생성"
3. HTTP 메서드: **POST**
4. URL: `{{baseUrl}}/api/users`
5. **Headers 탭:**
   - `Content-Type: application/json`
6. **Body 탭:**
   - "JSON" 선택
   - 다음 JSON 입력:

```json
{
  "name": "홍길동",
  "email": "hong@example.com"
}
```

7. "Send" 클릭

**예상 응답:**

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

**상태 코드:** 201 Created

---

#### 3.3 특정 사용자 조회 (GET)

1. "Users API" 컬렉션에서 "새 요청" 클릭
2. 요청 이름: "특정 사용자 조회"
3. HTTP 메서드: **GET**
4. URL: `{{baseUrl}}/api/users/1`
   - `1`은 사용자 ID입니다
5. "Send" 클릭

**예상 응답:**

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

**상태 코드:** 200 OK

---

#### 3.4 사용자 수정 (PUT)

1. "Users API" 컬렉션에서 "새 요청" 클릭
2. 요청 이름: "사용자 수정"
3. HTTP 메서드: **PUT**
4. URL: `{{baseUrl}}/api/users/1`
5. **Headers 탭:**
   - `Content-Type: application/json`
6. **Body 탭:**
   - "JSON" 선택
   - 다음 JSON 입력:

```json
{
  "name": "홍길동 (수정)",
  "email": "hong.updated@example.com"
}
```

7. "Send" 클릭

**예상 응답:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "홍길동 (수정)",
    "email": "hong.updated@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:01:00.000Z"
  },
  "message": "사용자 정보가 수정되었습니다"
}
```

**상태 코드:** 200 OK

---

#### 3.5 사용자 삭제 (DELETE)

1. "Users API" 컬렉션에서 "새 요청" 클릭
2. 요청 이름: "사용자 삭제"
3. HTTP 메서드: **DELETE**
4. URL: `{{baseUrl}}/api/users/1`
5. "Send" 클릭

**예상 응답:**

응답 본문 없음 (빈 응답)

**상태 코드:** 204 No Content

---

### 4. 에러 케이스 테스트

#### 4.1 잘못된 요청 (400 Bad Request)

**요청:** POST `{{baseUrl}}/api/users`

**Body:**

```json
{
  "name": "홍길동"
}
```

(이메일 필드 누락)

**예상 응답:**

```json
{
  "success": false,
  "error": "이름과 이메일은 필수입니다"
}
```

**상태 코드:** 400 Bad Request

---

#### 4.2 유효하지 않은 이메일 형식

**요청:** POST `{{baseUrl}}/api/users`

**Body:**

```json
{
  "name": "홍길동",
  "email": "invalid-email"
}
```

**예상 응답:**

```json
{
  "success": false,
  "error": "유효하지 않은 이메일 형식입니다"
}
```

**상태 코드:** 400 Bad Request

---

#### 4.3 사용자를 찾을 수 없음 (404 Not Found)

**요청:** GET `{{baseUrl}}/api/users/999`

**예상 응답:**

```json
{
  "success": false,
  "error": "사용자를 찾을 수 없습니다"
}
```

**상태 코드:** 404 Not Found

---

#### 4.4 중복 이메일 (409 Conflict)

**요청 1:** POST `{{baseUrl}}/api/users`

```json
{
  "name": "홍길동",
  "email": "hong@example.com"
}
```

**요청 2:** POST `{{baseUrl}}/api/users` (같은 이메일로 다시 생성 시도)

```json
{
  "name": "다른 사용자",
  "email": "hong@example.com"
}
```

**예상 응답:**

```json
{
  "success": false,
  "error": "이미 존재하는 이메일입니다"
}
```

**상태 코드:** 409 Conflict

---

## 고급 기능

### 1. 테스트 스크립트 작성

Apidog에서는 응답을 자동으로 검증하는 테스트 스크립트를 작성할 수 있습니다.

**예시:**

```javascript
// 응답 상태 코드 검증
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

// 응답 본문 검증
pm.test("Response has success field", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.success).to.be.true;
});

// 응답 데이터 검증
pm.test("User has required fields", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data).to.have.property("id");
  pm.expect(jsonData.data).to.have.property("name");
  pm.expect(jsonData.data).to.have.property("email");
});
```

### 2. 변수 사용

응답에서 데이터를 추출하여 다음 요청에 사용할 수 있습니다.

**예시:**

```javascript
// 응답에서 사용자 ID 추출
var jsonData = pm.response.json();
pm.environment.set("userId", jsonData.data.id);
```

다음 요청에서 `{{userId}}`를 사용:

```
{{baseUrl}}/api/users/{{userId}}
```

### 3. 프리퀘스트 스크립트

요청을 보내기 전에 실행되는 스크립트입니다.

**예시:**

```javascript
// 현재 시간을 변수로 설정
pm.environment.set("currentTime", new Date().toISOString());
```

### 4. 컬렉션 실행

여러 요청을 순차적으로 실행할 수 있습니다.

1. 컬렉션 오른쪽 클릭
2. "실행" 또는 "Run" 선택
3. 실행할 요청 선택
4. "실행" 클릭

---

## 팁과 모범 사례

### 1. 요청 이름 명확하게 작성

- ✅ 좋은 예: "사용자 생성", "사용자 목록 조회"
- ❌ 나쁜 예: "test", "request1"

### 2. 환경 변수 활용

URL, 포트, API 키 등을 환경 변수로 관리하세요:

- `{{baseUrl}}`
- `{{apiKey}}`
- `{{port}}`

### 3. 컬렉션으로 그룹화

관련된 요청들을 컬렉션으로 묶어 관리하세요:

- Users API
- Auth API
- Files API

### 4. 설명 추가

각 요청에 설명을 추가하여 나중에 이해하기 쉽게 만드세요:

- 요청의 목적
- 필수 파라미터
- 예상 응답

### 5. 테스트 스크립트 작성

자동화된 테스트를 작성하여 API가 제대로 동작하는지 확인하세요.

### 6. 예제 저장

성공한 요청의 예제를 저장하여 문서로 활용하세요.

---

## 트러블슈팅

### 문제: "연결할 수 없습니다" 에러

**해결 방법:**

1. 서버가 실행 중인지 확인
2. URL이 올바른지 확인 (`http://localhost:4000`)
3. 방화벽 설정 확인

### 문제: CORS 에러

**해결 방법:**

1. 서버의 CORS 설정 확인
2. Apidog의 CORS 설정 확인

### 문제: 404 Not Found

**해결 방법:**

1. URL 경로가 올바른지 확인
2. 서버의 라우터 설정 확인

---

## 추가 자료

- [Apidog 공식 문서](https://help.apidog.com/)
- [Apidog 공식 웹사이트](https://apidog.com/)
- [Apidog YouTube 튜토리얼](https://www.youtube.com/@Apidog)

---

## 다음 단계

Apidog 사용법을 익혔다면:

1. ✅ 모든 CRUD API 엔드포인트 테스트
2. ✅ 에러 케이스 테스트
3. ✅ 테스트 스크립트 작성
4. ✅ 컬렉션으로 정리
5. ✅ API 문서 생성

이제 [1-2-practice-guide.md](./1-2-practice-guide.md)를 참고하여 실제로 API를 테스트해보세요!

---

**질문이 있으면 언제든 물어보세요!** 🚀
