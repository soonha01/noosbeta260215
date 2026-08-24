# Project NOOS

뇌파로 사용자의 상태를 확인하고, 그 상태에 맞는 음악과 조명을 자동으로 바꿔주는 프로젝트입니다.

NOOS는 Muse S Athena EEG 기기로 사용자의 뇌파 데이터를 받고, Spring Boot 백엔드가 AI 분석 모듈과 음악 생성, 조명 제어를 연결하는 방식으로 동작합니다. 사용자는 복잡한 뇌파 수치를 직접 보는 대신, 자신의 상태에 맞는 음악과 조명 피드백을 경험할 수 있습니다.

> 이 프로젝트는 의료 진단이나 치료 목적이 아니라, EEG 데이터를 활용한 사용자 상태 인식과 환경 피드백을 실험한 종합설계 프로젝트입니다.

## 프로젝트 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | Project NOOS |
| 주제 | 실시간 뇌파 기반 AI 음악, 조명 피드백 시스템 |
| 팀 | TEAM:AXIS |
| 개발 기간 | 2026년 3월 - 2026년 6월 |
| 내 역할 | 백엔드 및 DB 총괄 |

## 내가 개발한 부분

이 프로젝트에서 저는 백엔드와 DB 쪽을 중심으로 개발했습니다. 프론트엔드에서 들어온 요청을 AI 모듈, 음악 생성 서버, 조명 제어 기능과 연결하는 역할을 맡았습니다.

주요 작업은 다음과 같습니다.

- Spring Boot 기반 백엔드 API 설계 및 구현
- 프론트엔드와 Python AI 모듈 연결
- EEG 분석 요청을 받고 결과를 저장하는 흐름 구현
- ACE-Step 음악 생성 요청 처리
- 생성된 오디오를 프론트엔드에서 재생할 수 있도록 프록시 API 구현
- WiZ 스마트 조명 제어 API 연동
- OAuth2 로그인 후 프론트엔드로 돌아오는 리다이렉트 문제 해결
- MyBatis와 MySQL 기반 DB 연동 구조 관리
- 백엔드 실행 중 발생한 버전 호환성, 인증 흐름 문제 해결

## 프로젝트가 동작하는 방식

NOOS의 기본 흐름은 어렵지 않습니다.

1. 사용자가 웹 화면에서 여정을 시작합니다.
2. Muse EEG 기기 또는 설문을 통해 현재 상태 데이터를 수집합니다.
3. 프론트엔드가 데이터를 백엔드로 보냅니다.
4. 백엔드는 Python AI 모듈을 실행해서 사용자의 상태를 분석합니다.
5. AI 분석 결과를 바탕으로 음악과 조명 계획을 만듭니다.
6. 백엔드는 ACE-Step에 음악 생성을 요청합니다.
7. 백엔드는 WiZ 조명에 색상과 밝기 변경을 요청합니다.
8. 프론트엔드는 생성된 음악, 조명 피드백, 세션 결과를 보여줍니다.

```text
사용자
  -> React 프론트엔드
  -> Spring Boot 백엔드
  -> Python AI 분석 모듈
  -> ACE-Step 음악 생성
  -> WiZ 조명 제어
  -> 결과 화면 및 기록 저장
```

## 주요 기능

- Muse S Athena EEG 기반 상태 데이터 수집
- 사용자 상태 분석 및 목표 상태 설정
- AI 기반 음악 생성 요청
- WiZ 조명 색상, 밝기 제어
- 여행 기록 및 분석 결과 저장
- OAuth2 로그인과 사용자 세션 관리
- 게시판, 채팅 등 기본 서비스 기능

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| Frontend | React, Vite, React Router |
| Backend | Java 17, Spring Boot 3.4.3 |
| Auth | Spring Security, OAuth2 |
| Database | MySQL, MyBatis |
| AI | Python, noos_ai CLI |
| EEG 연동 | Muse S Athena, Web Bluetooth API |
| 음악 생성 | ACE-Step API |
| 조명 제어 | WiZ Smart Light, UDP |
| Test | Vitest, JUnit 5, Python unittest |

## 백엔드 API

백엔드 API는 Swagger로 기능별로 정리했습니다. README에는 전체 API 표를 길게 넣는 대신, Swagger API 명세서 캡처를 순서대로 첨부했습니다.

### 1. Auth / Admin API

![API 명세서 1 - Auth, Admin](./docs/portfolio/api-spec-1.png)

### 2. EEG / AI API

![API 명세서 2 - EEG, AI](./docs/portfolio/api-spec-2.png)

### 3. Lighting API

![API 명세서 3 - Lighting](./docs/portfolio/api-spec-3.png)

### 4. Board API

![API 명세서 4 - Board](./docs/portfolio/api-spec-4.png)

### 5. Chat API

![API 명세서 5 - Chat](./docs/portfolio/api-spec-5.png)

## DB 구조

DB 구조 이미지는 나중에 이 섹션에 추가할 예정입니다.

추가하면 좋은 내용:

- ERD 이미지
- 사용자 테이블 구조
- EEG 세션 테이블 구조
- 분석 결과 저장 테이블 구조
- 여행 기록 테이블 구조
- 게시판, 댓글 관련 테이블 구조

<!--
![DB ERD](./docs/portfolio/db-erd.png)
-->

## 화면 캡처

보고서에 있는 화면 캡처는 이 섹션에 넣으면 됩니다.

추천 이미지:

- 메인 화면
- Muse EEG 연결 화면
- 여정 시작 화면
- 음악, 조명 피드백 화면
- 세션 결과 화면
- 백엔드 동작 흐름 또는 시스템 구조 이미지

<!--
![NOOS 메인 화면](./docs/portfolio/noos-main.png)
![Muse EEG 연결 화면](./docs/portfolio/muse-connection.png)
![음악 조명 피드백 화면](./docs/portfolio/intervention-player.png)
![시스템 구조](./docs/portfolio/system-flow.png)
-->

## 트러블슈팅

### 1. Spring Boot와 MyBatis 버전 문제

처음 백엔드를 실행했을 때 서버가 켜지지 않고 다음 오류가 발생했습니다.

```text
Property 'sqlSessionFactory' or 'sqlSessionTemplate' are required
```

처음에는 DB 설정 문제라고 생각했지만, 로그를 계속 따라가 보니 Spring Boot 4.x와 MyBatis-Spring 3.0.3의 버전 호환 문제였습니다.

해결 방법:

- Spring Boot 버전을 3.4.x로 변경
- Gradle Refresh 후 서버 재실행
- MyBatis와 DB 연결 정상 확인

배운 점:

- 에러가 발생하면 맨 위 로그만 보지 않고 `Caused by`를 따라가야 합니다.
- 최신 버전이 항상 좋은 것은 아니고, 라이브러리끼리 호환되는 버전을 선택하는 것이 중요합니다.

### 2. OAuth2 로그인 후 화면 이동 문제

소셜 로그인은 성공했지만, 로그인 후 프론트엔드 화면으로 제대로 돌아오지 않는 문제가 있었습니다.

기존 설정은 로그인 성공 후 백엔드의 `/main` 경로로 이동하게 되어 있었습니다.

```java
.defaultSuccessUrl("/main", true)
```

하지만 이 프로젝트는 프론트엔드가 `3000`, 백엔드가 `8080`으로 분리되어 있어서 백엔드 경로로 이동하면 사용자 흐름이 끊겼습니다.

해결 방법:

```java
.defaultSuccessUrl("http://localhost:3000/?login=success", true)
```

배운 점:

- 백엔드 인증 설정은 프론트엔드 라우팅에도 영향을 줍니다.
- 로그인 같은 기능은 백엔드만 보는 것이 아니라 전체 사용자 흐름으로 확인해야 합니다.

### 3. Muse S Athena Web Bluetooth 연동 문제

처음에는 기존 `web-muse` 라이브러리를 사용하려고 했지만, 우리가 사용한 Muse S Athena 기기와 데이터 구조가 맞지 않았습니다.

기존 라이브러리가 찾던 EEG characteristic:

```text
273e0003 / 273e0004 / 273e0005 / 273e0006 / 273e0007
```

실제 Muse S Athena에서 확인한 data stream characteristic:

```text
273e0013 / 273e0014 / 273e0015
```

해결 방법:

- `node_modules` 내부 라이브러리를 직접 수정하지 않음
- 자체 Web Bluetooth 연결 로직 구현
- 실제 기기에서 노출되는 characteristic을 확인
- raw binary packet을 받아 EEG 데이터로 해석하는 흐름 구현
- 실제 연결이 완료된 후에만 다음 단계로 이동하도록 UI 흐름 개선

배운 점:

- 같은 Muse 제품군이라도 모델에 따라 Bluetooth 데이터 구조가 다를 수 있습니다.
- 외부 라이브러리를 그대로 믿기보다 실제 기기에서 데이터를 확인해야 합니다.
- 하드웨어 연동은 코드뿐 아니라 실제 연결 흐름까지 검증해야 합니다.

## 폴더 구조

```text
noosbeta260215/
+-- frontend/        # React 프론트엔드
+-- backend/         # Spring Boot 백엔드
+-- ai/              # Python AI 분석 모듈
+-- ai-objet-next/   # 임베디드 AI Objet 페이지 원본
+-- docs/            # 문서와 다이어그램
`-- ai/vendor/       # 외부 ACE-Step 관련 코드
```

## 실행 방법

### Frontend

```bash
cd frontend
npm install
npm run start
```

기본 주소: `http://localhost:3000`

### Backend

```bash
cd backend
./gradlew bootRun
```

기본 주소: `http://localhost:8080`

로컬 DB, OAuth2, ACE-Step, WiZ 설정은 Git에 포함되지 않는 로컬 설정 파일에서 관리합니다.

### AI Module

```bash
cd ai
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -e .
python3 -m unittest discover -s tests
```

## 참고 문서

- [Project Structure](./docs/PROJECT_STRUCTURE.md)
- [Runtime and Operations](./docs/RUNTIME_AND_OPERATIONS.md)
- [System Flow Diagrams](./docs/system-flow-diagrams/README.md)
- [AI Module](./ai/README.md)
- [Frontend](./frontend/README.md)
- [Backend](./backend/README.md)

## 느낀 점

이 프로젝트를 하면서 백엔드가 단순히 데이터를 저장하고 보내는 역할만 하는 것이 아니라는 점을 배웠습니다. NOOS의 백엔드는 프론트엔드, AI 분석 모듈, 음악 생성 서버, 조명 제어 장치를 연결하는 중심 역할을 했습니다.

특히 로그를 보고 원인을 찾는 과정, OAuth2 인증 흐름을 수정한 경험, 실제 하드웨어와 데이터를 맞춰보는 과정이 가장 큰 학습이었습니다.
