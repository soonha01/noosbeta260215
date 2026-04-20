# NOOS AI

`ai` 폴더는 현재 프론트엔드와 분리된 독립 AI 패키지입니다.  
지금 구현 범위는 `recognition session` 하나이며, Muse 계열 4채널 EEG에서 들어오는 원시 샘플 또는 밴드 요약값을 근거 기반으로 해석합니다.
현재는 그 다음 단계인 `intervention session`까지 포함해, 행성 선택을 구조화된 목표 상태와 조명/음악 spec으로 변환합니다.

## 현재 범위

- `recognition`: 현재 뇌파 상태를 구조화해서 해석
- `intervention`: 현재 상태와 행성 목표 상태의 차이를 계산해 개입 plan 생성
- 지원 입력:
  - 프론트에서 수집한 Muse 원시 읽기 배열
  - 밴드 비율 요약 payload
  - recognition 결과 또는 현재 상태 점수 + 선택한 행성
- 지원 출력:
  - 신호 품질 평가
  - 밴드 특성 및 비율
  - `mental_workload`
  - `fatigue_risk`
  - `stress_load`
  - `relaxation_level`
  - `cortical_arousal`
  - `focus_readiness`
  - 행성별 목표 상태 벡터
  - transition plan
  - lighting spec
  - music spec
  - ACE-Step API payload

## 설계 원칙

- 의료 진단처럼 과장하지 않음
- 논문 기반으로 설명 가능한 규칙만 사용
- Muse 4채널의 한계를 출력에 명시
- 이후 `intervention`, `adaptation`, `longitudinal` 같은 세션을 붙일 수 있게 `sessions` 레이어를 분리
- ACE-Step 같은 외부 생성 모델은 직접 상태판단을 하지 않고, NOOS가 만든 spec만 따른다.

## 빠른 실행

```bash
cd "/Users/suhwan/Documents/NOOS AI MODULE/noosbeta260215/ai"
python3 -m noos_ai.cli examples/recognition_input.json
python3 -m noos_ai.cli examples/intervention_input.json
python3 -m noos_ai.cli examples/intervention_input.json --generate-ace-step --api-base-url http://127.0.0.1:8012
```

마지막 명령은 intervention plan을 만든 뒤, 실행 중인 ACE-Step API에 실제 생성 작업을 제출한다.

## ACE-Step vendor 준비

`ai/vendor/ACE-Step-1.5`는 공식 저장소를 로컬에 clone해서 쓰는 외부 의존성이다.  
체크포인트와 런타임 크기가 커서 이 앱 저장소에는 포함하지 않는다.

```bash
cd "/Users/suhwan/Documents/NOOS AI MODULE/noosbeta260215/ai"
mkdir -p vendor
git clone https://github.com/ace-step/ACE-Step-1.5.git vendor/ACE-Step-1.5
```

## 입력 형식

최소 형식:

```json
{
  "session_type": "recognition",
  "session_id": "demo-session",
  "device_type": "Muse S Athena",
  "sample_rate_hz": 256,
  "band_summary": {
    "delta": 10.0,
    "theta": 18.0,
    "alpha": 34.0,
    "beta": 28.0,
    "gamma": 10.0
  }
}
```

원시 샘플 형식은 현재 프론트의 Muse 읽기 구조와 맞춰뒀습니다.

```json
{
  "readings": [
    {
      "timestamp": 1713430000000,
      "channels": {
        "TP9": 12.4,
        "AF7": 8.1,
        "AF8": 7.7,
        "TP10": 11.9
      }
    }
  ]
}
```

## 참고 문서

- 연구 근거: [docs/research_foundations.md](/Users/suhwan/Documents/NOOS%20AI%20MODULE/noosbeta260215/ai/docs/research_foundations.md)
- 결과 화면 설계: [docs/recognition_result_screen_spec.md](/Users/suhwan/Documents/NOOS%20AI%20MODULE/noosbeta260215/ai/docs/recognition_result_screen_spec.md)
- 행성 목표 상태 정의: [docs/planet_target_taxonomy.md](/Users/suhwan/Documents/NOOS%20AI%20MODULE/noosbeta260215/ai/docs/planet_target_taxonomy.md)
- intervention 아키텍처: [docs/intervention_architecture.md](/Users/suhwan/Documents/NOOS%20AI%20MODULE/noosbeta260215/ai/docs/intervention_architecture.md)
- ACE-Step 연동 문서: [docs/ace_step_noos_integration.md](/Users/suhwan/Documents/NOOS%20AI%20MODULE/noosbeta260215/ai/docs/ace_step_noos_integration.md)
- 예시 입력: [examples/recognition_input.json](/Users/suhwan/Documents/NOOS%20AI%20MODULE/noosbeta260215/ai/examples/recognition_input.json)
- 예시 출력: [examples/recognition_output.sample.json](/Users/suhwan/Documents/NOOS%20AI%20MODULE/noosbeta260215/ai/examples/recognition_output.sample.json)
- intervention 입력: [examples/intervention_input.json](/Users/suhwan/Documents/NOOS%20AI%20MODULE/noosbeta260215/ai/examples/intervention_input.json)

## 구현 메모

- ACE-Step 단일 요청 최대 길이 600초 제한을 반영해 `music_spec.render_plan`을 생성한다.
- 10분이 넘는 세션은 `segmented_render`로 나누고, 각 segment를 crossfade하는 방식으로 이어 붙이게 설계했다.
- ACE-Step 결과 polling은 공식 API 형식인 `task_id_list` 기준으로 구현돼 있다.
