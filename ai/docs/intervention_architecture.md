# Intervention Architecture

이 문서는 `recognition -> intervention -> adaptation` 흐름에서 intervention 엔진이 무엇을 하는지 정리한다.

## 1. 핵심 개념

intervention session의 목적은 “음악을 생성하는 것”이 아니다.  
목적은 현재 상태와 목표 상태의 차이를 계산해, 조명과 음악을 위한 `controlled spec`를 만드는 것이다.

## 2. 입력

intervention 입력은 두 방식 중 하나다.

### A. recognition 결과 전체

- `recognition_result.state_profile.dimensions`
- `recognition_result.quality`
- 선택한 `planet`

### B. 현재 상태 점수만 직접 제공

- `current_state`
- 선택한 `planet`

## 3. 처리 단계

### Step 1. 현재 상태 벡터 추출

현재 recognition 엔진의 6개 상태 점수를 intervention 축으로 그대로 쓴다.

### Step 2. 행성 목표 상태 벡터 로드

행성마다 미리 정의된 목표 벡터와 style bias를 읽는다.

### Step 3. delta 계산

`target - current` 를 각 축별로 계산한다.

### Step 4. transition mode 선택

예:

- `stress` 높음 + 고집중 행성 -> `stabilize_then_activate`
- `fatigue` 높음 + 집중 행성 -> `recover_then_focus`
- `Pluto` -> `downshift_and_restore`
- 현재와 목표가 비슷함 -> `maintain_and_refine`

### Step 5. phase plan 생성

한 세션을 1~2개의 phase로 나눈다.

예:

- `stabilize`
- `activate`
- `deepen`
- `recover`
- `maintain`

### Step 6. lighting spec 생성

phase별로 다음을 만든다.

- 색상
- 밝기
- 색온도
- 패턴
- motion intensity
- pulse bpm

### Step 7. music spec 생성

phase와 행성 profile을 합쳐 다음을 만든다.

- BPM
- tonal center
- rhythmic density
- spectral brightness
- harmonic tension
- repetition
- texture density
- attack softness
- primary instruments
- avoid list

### Step 8. ACE-Step 요청 payload 생성

NOOS는 먼저 prompt와 control payload를 만든 뒤, 그걸 ACE-Step API로 넘긴다.

여기서 중요한 제약 하나를 함께 처리한다.

- ACE-Step 단일 요청은 최대 600초
- 따라서 긴 intervention은 `music_spec.render_plan`으로 나눠서 생성
- 첫 segment request를 표준 payload로 만들고, 후속 segment는 같은 상태/행성 규칙 아래 이어붙이게 설계

## 4. 왜 바로 자유 생성하지 않는가

음악 생성 모델은 편차가 크다.  
따라서 NOOS는 생성 모델 앞단에서 반드시 제약을 건다.

- planet profile
- delta-based transition mode
- instrumental only
- avoid elements
- ranking rules

즉 ACE-Step은 작곡자이고, NOOS는 감독이다.

## 5. adaptation 연결

현재 구현은 intervention spec까지만 만든다.  
다음 단계 adaptation에서는 재생 중 EEG 또는 피드백을 보고 다음을 조정한다.

- stress spike -> brightness down, harshness down
- fatigue spike during focus -> subtle activation up
- overactivation -> motion down, cct down

## 6. 출력

최종 출력은 아래 구조를 가진다.

- `planet_profile`
- `current_state_axes`
- `target_state_axes`
- `delta_axes`
- `transition_plan`
- `lighting_spec`
- `music_spec`
- `ace_step_integration`

즉 intervention session은 “재생 결과”가 아니라 “개입 계획서”를 만든다.

단, 현재 구현은 CLI 옵션을 통해 이 계획서를 바로 ACE-Step 생성 호출까지 이어줄 수 있다.
