# Planet Target Taxonomy

행성은 브랜딩 레이어이고, 실제 AI 엔진은 그 아래의 `target state vector`를 사용한다.

## 원칙

- 행성 설명은 사용자용 언어다.
- 개입 엔진은 행성을 직접 해석하지 않고 구조화된 목표 상태를 읽는다.
- 상태 벡터는 현재 recognition 엔진의 6개 축에 맞춘다.

## 상태 축

- `focus_readiness`
- `stress_load`
- `fatigue_risk`
- `relaxation_level`
- `cortical_arousal`
- `mental_workload`

점수 범위는 `0.0 ~ 1.0` 이다.

## 행성별 정의

### Mercury

- 목표 라벨: `순간 점화 집중`
- 의미: 짧고 빠른 시작, 진입 가속
- 카테고리: `activation-focus`

### Venus

- 목표 라벨: `온기 있는 창의`
- 의미: 부드러운 연상과 표현, 감성적 확장
- 카테고리: `warm-creativity`

### Earth

- 목표 라벨: `균형형 집중`
- 의미: 오래 버티는 안정 집중
- 카테고리: `balanced-focus`

### Mars

- 목표 라벨: `결단과 실행`
- 의미: 미루지 않고 행동으로 밀어붙이는 상태
- 카테고리: `action-drive`

### Jupiter

- 목표 라벨: `전략적 존재감`
- 의미: 조망, 판단 중심, 리더십 톤
- 카테고리: `strategic-presence`

### Saturn

- 목표 라벨: `깊은 사유`
- 의미: 느리고 정교한 장시간 사고
- 카테고리: `deliberate-thinking`

### Uranus

- 목표 라벨: `전환형 창의`
- 의미: 틀을 깨는 발상 전환
- 카테고리: `disruptive-creativity`

### Neptune

- 목표 라벨: `딥워크 몰입`
- 의미: 잡음 억제형 깊고 좁은 집중
- 카테고리: `deep-work`

### Pluto

- 목표 라벨: `회복과 리셋`
- 의미: 긴장 감소, 감각 다운시프트, 회복
- 카테고리: `recovery-reset`

## 왜 이렇게 나눴는가

현재 프론트의 기존 카피는 집중/창의/실행/회복이 서로 섞여 있었고, 일부는 역할과 감정과 작업 방식이 혼합되어 있었다.  
이 구조를 그대로 두면 AI가 조명과 음악을 계산할 기준이 모호해진다.

그래서 지금 구조는 다음을 보장한다.

- 같은 계열 행성도 서로 목적이 다르다.
- 행성 설명과 실제 제어 파라미터가 분리된다.
- `current state -> target state` delta 계산이 가능해진다.
