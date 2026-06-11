# NOOS AI 패키지

`ai/`는 NOOS의 인식과 개입 계획을 담당하는 로컬 Python 엔진입니다. 프론트엔드나 백엔드 없이도 CLI에서 실행할 수 있도록 만들어져 있어, 핵심 동작을 독립적으로 테스트할 수 있습니다.

## 담당 역할

- EEG raw reading 또는 band summary를 안정적인 세션 계약 형태로 파싱합니다.
- 상태 label, 축 값, confidence, 한계 설명을 포함한 recognition profile을 만듭니다.
- 사용자가 선택한 행성 목표에 맞는 intervention bundle을 구성합니다.
- 조명 명세, WiZ 하드웨어 전달 payload, ACE-Step 음악 요청 명세를 생성합니다.
- 원격 ACE-Step API를 사용할 수 있으면 호출하고, 테스트나 오프라인 실행에서는 deterministic fallback output을 유지합니다.

## 폴더 구조

```text
ai/
+-- noos_ai/
|   +-- cli.py
|   +-- contracts.py
|   +-- eeg/
|   +-- intervention/
|   +-- integrations/
|   `-- sessions/
+-- examples/
+-- tests/
+-- docs/
+-- scripts/
+-- generated/      # Git에서 무시하는 런타임 출력입니다.
`-- vendor/         # Git에서 무시하는 ACE-Step 체크아웃입니다.
```

## 주요 파일

- `noos_ai/cli.py`: 백엔드가 사용하는 JSON 입력/JSON 출력 CLI 진입점입니다.
- `noos_ai/contracts.py`: 입력 파싱과 정규화된 reading 계약을 정의합니다.
- `noos_ai/sessions/registry.py`: `recognition`, `intervention` 세션을 dispatch합니다.
- `noos_ai/sessions/recognition.py`: EEG 또는 band summary를 현재 상태로 변환합니다.
- `noos_ai/sessions/intervention.py`: 현재 상태와 목표 행성을 받아 완성된 intervention bundle을 만듭니다.
- `noos_ai/intervention/planet_profiles.py`: 행성별 목표 축과 설명 문구를 정의합니다.
- `noos_ai/intervention/lighting_research.py`: CCT/RGB profile 데이터를 보관합니다.
- `noos_ai/intervention/lighting.py`: 최종 조명 명세를 생성합니다.
- `noos_ai/intervention/lighting_hardware.py`: WiZ 전달 payload를 만듭니다.
- `noos_ai/intervention/music.py`: ACE-Step prompt와 request를 구성합니다.
- `noos_ai/integrations/ace_step.py`: 원격 ACE-Step API wrapper입니다.

## 설치

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -e .
```

핵심 실행 경로에는 필수 third-party runtime dependency가 없습니다.

## 실행

인식 예시:

```bash
python3 -m noos_ai.cli examples/recognition_input.json
```

개입 예시:

```bash
python3 -m noos_ai.cli examples/intervention_input.json
```

테스트:

```bash
python3 -m unittest discover -s tests
```

## ACE-Step 작업자

Python 패키지는 ACE-Step request payload를 만들 수 있고, 요청에 활성화된 `ace_step` 설정이 포함되어 있으면 원격 작업자도 호출할 수 있습니다. 기본 개발용 작업자 설정은 `docs/windows-codex-ace-step-handoff.md`에 정리되어 있습니다.

생성된 오디오와 런타임 cache는 반드시 `generated/` 아래에 둡니다. 이 디렉터리는 Git에서 무시되며 소스로 취급하지 않습니다.

## 계약 형태

인식 입력:

```json
{
  "session_type": "recognition",
  "readings": [
    {
      "timestamp": 0,
      "channels": {
        "TP9": 1.0,
        "AF7": 1.1,
        "AF8": 0.9,
        "TP10": 1.0
      }
    }
  ]
}
```

개입 입력:

```json
{
  "session_type": "intervention",
  "current_state": {
    "label": "calm",
    "axes": {
      "valence": 0.2,
      "arousal": -0.1,
      "focus": 0.4
    }
  },
  "target_planet": "mars"
}
```

CLI는 JSON 결과를 stdout으로 출력하고, 진단용 실패 메시지는 stderr로 출력합니다. 백엔드 코드는 이 CLI를 import 가능한 Python 모듈이 아니라 별도 프로세스 경계로 다뤄야 합니다.
