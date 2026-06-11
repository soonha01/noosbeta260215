# AI 패키지 지식 베이스

## 한눈에 보기

`ai/`는 EEG 상태 인식과 개입 계획을 담당하는 editable Python 패키지입니다. 입력을 분석해 설명 가능한 상태, 조명 명세, 음악 명세, ACE-Step 요청 명세를 출력합니다.

## 폴더 구조

```text
ai/
+-- noos_ai/
|   +-- cli.py
|   +-- contracts.py
|   +-- eeg/
|   +-- sessions/
|   +-- intervention/
|   `-- integrations/
+-- examples/
+-- tests/
+-- docs/
+-- scripts/
+-- generated/      # Git에서 무시하는 런타임 출력/cache입니다.
`-- vendor/         # Git에서 무시하는 ACE-Step 체크아웃입니다.
```

## 어디를 보면 되는가

| 작업 | 위치 | 설명 |
| --- | --- | --- |
| CLI 진입점 | `noos_ai/cli.py` | `python -m noos_ai.cli`로 실행합니다. |
| 입력 계약 | `noos_ai/contracts.py` | readings와 band summary를 dataclass로 파싱합니다. |
| 세션 라우팅 | `noos_ai/sessions/registry.py` | `recognition`, `intervention` 세션을 매핑합니다. |
| EEG 전처리 | `noos_ai/eeg/` | band, spectral summary, 품질 계산을 담당합니다. |
| 인식 상태 | `noos_ai/sessions/recognition.py` | label, 축 값, 한계 설명을 만듭니다. |
| 개입 세션 | `noos_ai/sessions/intervention.py` | 전체 개입 bundle을 조립합니다. |
| 행성 목표 | `noos_ai/intervention/planet_profiles.py` | 목표 축과 label을 정의합니다. |
| 조명 명세 | `noos_ai/intervention/lighting*.py` | 연구 기반 CCT/RGB와 하드웨어 전달 값을 만듭니다. |
| 음악 명세 | `noos_ai/intervention/music.py` | ACE-Step prompt와 request를 구성합니다. |
| ACE-Step 클라이언트 | `noos_ai/integrations/ace_step.py` | 원격 API 호출 wrapper입니다. |

## 작업 규칙

- Python 요구 버전은 `>=3.11`입니다. 개발 설치는 `python3 -m pip install -e .`로 합니다.
- 테스트는 pytest가 아니라 표준 `unittest`를 사용합니다.
- 세션 입력은 raw `readings` 또는 `band_summary`를 받을 수 있습니다. raw readings가 있으면 우선합니다.
- recognition/intervention은 프론트엔드나 백엔드 없이도 CLI에서 실행 가능해야 합니다.
- ACE-Step은 선택적 외부 런타임입니다. 사용할 수 없을 때도 graceful fallback을 유지해야 합니다.
- 생성 오디오와 런타임 cache는 `generated/` 아래에 둡니다.
- AI 전용 런타임 인수인계 문서와 연구 메모는 루트 `docs/`가 아니라 `ai/docs/`에 둡니다.

## 피해야 할 패턴

- 생성 오디오나 cache를 소스 디렉터리에 쓰지 않습니다.
- 작업이 명시적으로 vendor integration 또는 patch 유지보수가 아니라면 `vendor/ACE-Step-1.5`를 수정하지 않습니다.
- EEG 상태 축을 근거로 진단이나 치료 효과를 주장하지 않습니다.
- 단위 테스트가 ACE-Step 실행 여부에 의존하게 만들지 않습니다.
- 하드웨어 제어를 Python으로 옮기지 않습니다. 최종 WiZ 명령은 백엔드 책임입니다.

## 명령어

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -e .
python3 -m unittest discover -s tests
python3 -m noos_ai.cli examples/recognition_input.json
python3 -m noos_ai.cli examples/intervention_input.json
bash ./scripts/start_acestep_api.sh
```

## 테스트 참고

- 기존 테스트는 세션 단위이며 deterministic해야 합니다.
- 우선순위가 높은 보강 지점은 계약 파싱 오류, EEG edge case, CLI 동작, 잘못된 payload 처리입니다.
