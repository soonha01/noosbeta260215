# 런타임과 운영

이 프로젝트는 보통 Mac 로컬 앱과 Windows RTX 4080 ACE-Step 작업자를 함께 사용해 실행합니다. Mac은 프론트엔드, 백엔드, Python AI orchestration을 담당하고, Windows 머신은 실제 음악 생성을 담당합니다.

## 로컬 서비스

```text
프론트엔드 Vite          http://localhost:3000
백엔드 Spring Boot        http://localhost:8080
ACE-Step 작업자           http://192.168.123.114:8011
WiZ 전구                  설정된 LAN IP의 UDP 38899
```

현재 백엔드 기본값은 `backend/src/main/resources/application.properties`에 있습니다.

## 시작 순서

프론트엔드 시작:

```bash
cd frontend
npm run start
```

백엔드 시작:

```bash
cd backend
./gradlew bootRun
```

## Windows ACE-Step 작업자

Mac 백엔드는 아래 주소의 원격 ACE-Step API를 기대합니다.

```properties
noos.ai.ace-step.base-url=http://192.168.123.114:8011
```

현재 목표 model 설정은 아래와 같습니다.

```properties
noos.ai.ace-step.model=acestep-v15-xl-turbo
noos.ai.ace-step.lm-model=acestep-5Hz-lm-1.7B
noos.ai.ace-step.use-enhanced-request=false
noos.ai.ace-step.inference-steps=6
```

설정 과정에서 만든 Windows 인수인계 파일은 `ai/docs/`에 둡니다.

## 상태 점검

프론트엔드:

```bash
curl -I http://localhost:3000
```

백엔드:

```bash
curl -sS -X POST http://localhost:8080/api/ai/intervention/prewarm \
  -H 'Content-Type: application/json' \
  -d '{}'
```

WiZ:

```bash
curl -sS http://localhost:8080/api/lighting/wiz/status
curl -sS http://localhost:8080/api/lighting/wiz/devices
```

ACE-Step 작업자를 직접 확인:

```bash
curl -sS http://192.168.123.114:8011/health
```

## 조명 모델

현재 조명 payload는 `cct-plus-rgb`입니다. 이 방식은 집중/안정 같은 기능적 조명과 행성 분위기를 함께 표현하기 위한 구조입니다.

- Primary lighting은 연구 기반 `cct_kelvin` 값을 바탕으로 WiZ `temp` CCT를 사용합니다.
- Secondary lighting은 행성 accent color를 RGB로 사용합니다.
- 백엔드는 `noos.lighting.wiz.alternate-interval-sec`초마다 primary/secondary를 교대 적용합니다.
- 세션 시작 시 백엔드는 설정된 각 전구의 현재 WiZ `getPilot` 상태를 snapshot으로 저장합니다. `POST /api/lighting/wiz/stop`은 이 snapshot을 복구하며, travel page는 사용자가 생성 음악/조명 페이지를 떠날 때 이 API를 호출합니다.

Primary CCT와 secondary RGB는 아래 Python 파일에서 생성됩니다.

- `ai/noos_ai/intervention/lighting_research.py`
- `ai/noos_ai/intervention/lighting.py`
- `ai/noos_ai/intervention/lighting_hardware.py`

WiZ 최종 명령 전송은 아래 백엔드 파일에서 수행합니다.

- `backend/src/main/java/com/noos/backend/lighting/service/WizLightingService.java`

## 공통 검증

현재 가능한 전체 검증은 아래 순서로 실행합니다.

```bash
cd ai
python3 -m unittest discover -s tests

cd ../backend
./gradlew test

cd ../frontend
npm run build
```

## 문제 해결

생성이 95% 부근에서 멈춘 것처럼 보이면:

- 백엔드 로그를 확인합니다.
- ACE-Step 작업자의 health를 확인합니다.

WiZ 전구가 동기화되지 않으면:

- `/api/lighting/wiz/status`를 확인합니다.
- `/api/lighting/wiz/devices`를 확인합니다.
- 설정된 모든 전구 IP에 접근 가능한지 확인합니다.
- 전구 하나의 UDP read timeout이 write sync 전체를 멈추면 안 됩니다. write는 retry가 있는 fire-and-forget 방식으로 동작합니다.
