# NOOS AI 모듈

NOOS AI 모듈은 Muse EEG 상태 인식, 행성 기반 개입 계획, ACE-Step 음악 생성, WiZ 조명 제어를 한 흐름으로 묶은 로컬 멀티모달 프로토타입입니다.

프로젝트는 세 개의 실행 영역으로 나뉩니다.

- `frontend/`: Muse 연결, 설문, 행성 선택, 여행 플레이어, 조명 미리보기를 담당하는 React/Vite 앱
- `backend/`: 프론트엔드 요청을 Python AI CLI, ACE-Step, 생성 오디오, WiZ 전구로 연결하는 Spring Boot API
- `ai/`: EEG 인식, 개입 계획, 조명 명세, 음악 명세, ACE-Step 요청 구성, 선택적 Gemma 보조 작업을 담당하는 Python 패키지

## 처음 읽을 문서

처음 프로젝트를 이해할 때는 아래 순서로 읽으면 됩니다.

- [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md): 폴더 지도와 파일별 책임 안내
- [docs/RUNTIME_AND_OPERATIONS.md](./docs/RUNTIME_AND_OPERATIONS.md): 로컬 실행 구조, 포트, 시작 명령, 점검 방법
- [docs/system-flow-diagrams/README.md](./docs/system-flow-diagrams/README.md): 전체 작동 흐름 도식 모음
- [ai/README.md](./ai/README.md): Python AI 엔진 설명
- [frontend/README.md](./frontend/README.md): React 앱 구조
- [backend/README.md](./backend/README.md): Spring Boot API 구조

## 현재 실행 구조

```text
브라우저 / React 프론트엔드
  -> localhost:8080의 Spring Boot 백엔드
    -> 인식/개입 명세 생성을 위한 Python noos_ai CLI
    -> 음악 생성을 위한 Windows 4080 ACE-Step API
    -> 조명 제어를 위한 로컬 UDP WiZ 전구
```

Gemma는 선택 기능이며, 로컬 서비스가 느리면 음악 생성을 막을 수 있으므로 현재 기본값은 `backend/src/main/resources/application.properties`에서 비활성화되어 있습니다.

## 자주 쓰는 명령

프론트엔드:

```bash
cd frontend
npm install
npm run start
npm run build
```

백엔드:

```bash
cd backend
./gradlew bootRun
./gradlew test
```

AI:

```bash
cd ai
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
python3 -m unittest discover -s tests
```

## 주요 포트

- 프론트엔드: `http://localhost:3000`
- 백엔드: `http://localhost:8080`
- 선택적 Gemma 서비스: `http://127.0.0.1:8091`
- ACE-Step 작업자: `backend/src/main/resources/application.properties`에서 설정

## 개발 기준

- 화면 전용 동작은 `frontend/src`에 둡니다.
- API 라우팅, 파일 프록시, 하드웨어 제어는 `backend/src/main/java/com/noos/backend`에 둡니다.
- EEG, 개입, 음악, 조명 명세 로직은 `ai/noos_ai`에 둡니다.
- 실행/운영 문서는 `docs/`에 둡니다.
- 연구 배경 문서는 전체 시스템 운영을 설명하는 경우가 아니라면 `ai/docs/`에 둡니다.
