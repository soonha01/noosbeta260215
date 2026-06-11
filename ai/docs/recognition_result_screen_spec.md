# 인식 결과 화면 설계

이 문서는 `recognition session` 결과를 앱에서 어떻게 보여줄지 정의한 화면 설계 문서다.  
아직 프론트 반영은 하지 않고, 현재 AI 출력 JSON을 어떤 UI로 변환할지만 정리한다.

## 1. 배치 위치

현재 인증 흐름 기준:

- `login`
- `device-question`
- `device-connecting`
- `device-complete`
- `device-success`
- `warp-transition`

여기서 새 결과 화면은 `device-success` 바로 다음에 두는 것이 맞다.

추천 흐름:

- `device-success`: raw 파형과 밴드 확인
- `recognition-result`: AI 해석 결과 확인
- `warp-transition`

설문 기반 흐름도 같은 형식으로 맞춘다.

- `survey`
- `analysis-loading`
- `analysis-result`
- `recognition-result`
- `warp-transition`

즉, 최종적으로는 측정 방식과 상관없이 `recognition-result` 한 화면으로 합류시키는 구조가 좋다.

## 2. 화면 목표

이 화면은 다음 4가지를 동시에 해야 한다.

1. 사용자가 지금 어떤 상태인지 한 문장으로 이해
2. 그 판단을 얼마나 믿을 수 있는지 이해
3. 왜 그렇게 나왔는지 간단한 근거 확인
4. 다음 세션으로 넘어갈 준비

핵심은 “뇌파를 많이 보여주는 화면”이 아니라 “상태를 납득시키는 화면”이다.

## 3. 최상위 정보 구조

화면은 아래 6개 블록으로 나눈다.

### A. 히어로 요약

가장 위에 상태 한 줄 요약을 둔다.

표시 데이터:

- `state_profile.dominant_state`
- `state_profile.label`
- `quality.score`
- `input_summary.baseline_mode`

예시 카피:

- `현재 상태: 회복이 필요한 이완 우세 패턴`
- `신뢰도: 보통`
- `개인 기준선 없이 해석됨`

### B. 주요 상태 카드

핵심 3개만 먼저 크게 보여준다.

- `focus_readiness`
- `stress_load`
- `fatigue_risk`

이 3개가 실제 사용자 행동과 가장 직접적으로 연결된다.

카드 구성:

- 한국어 라벨
- 점수 `0~100`
- 레벨 배지
- 짧은 해석 문장

### C. 보조 지표

보조 지표는 별도 섹션으로 분리한다.

- `mental_workload`
- `relaxation_level`
- `cortical_arousal`

이 섹션은 메인 판단을 보강하는 용도로만 쓴다.

### D. 뇌파 근거

뇌파 근거는 한 단계 아래에서 보여준다.

표시 데이터:

- `bands.global_relative`
- `bands.regional_relative`
- `features.snapshot`
- `features.artifact_indicators`

형식:

- 밴드 분포 막대 그래프
- ratio 2~3개
- artifact 경고 배지

여기서는 숫자보다 패턴을 보여주는 것이 중요하다.

### E. 신뢰도와 한계

이 블록은 반드시 있어야 한다.

표시 데이터:

- `quality.usable`
- `quality.score`
- `quality.warnings`
- `limitations`

구성:

- “이번 해석은 어느 정도 믿을 수 있는가”
- “왜 조심해서 봐야 하는가”

### F. 다음 전환

마지막 CTA 블록.

현재는 추천만 표시하고, 추후 intervention 세션으로 연결한다.

- `다음 단계로 이동`
- `이 상태를 기준선으로 저장`
- `행성 선택으로 이동`

## 4. 권장 레이아웃

### 데스크톱

- 상단 30%: 히어로 요약
- 중단 35%: 주요 상태 카드 3개
- 하단 왼쪽: 보조 지표
- 하단 오른쪽: 뇌파 근거
- 맨 아래: 신뢰도 / CTA

### 모바일

- 히어로 요약
- 주요 상태 카드
- 신뢰도 strip
- 보조 지표 accordion
- 뇌파 근거 accordion
- CTA

모바일에서는 절대 모든 차트를 한 화면에 펼치지 않는다.

## 5. 상태 카드 설계

각 카드 공통 규격:

- 제목
- 큰 숫자 점수 `68`
- 작은 레벨 배지 `elevated`
- 한 줄 해석
- 얇은 confidence bar

### 라벨 매핑

- `focus_readiness` → `집중 준비도`
- `stress_load` → `스트레스 부하`
- `fatigue_risk` → `피로 위험`
- `mental_workload` → `인지 작업부하`
- `relaxation_level` → `이완 수준`
- `cortical_arousal` → `각성 수준`

### 레벨 한글 매핑

- `very_low` → `매우 낮음`
- `low` → `낮음`
- `moderate` → `보통`
- `elevated` → `높음`
- `high` → `매우 높음`

## 6. 상태별 카드 해석 문장 규칙

### 집중 준비도(`focus_readiness`)

- 높음: `집중 세션으로 진입하기에 비교적 좋은 상태입니다.`
- 보통: `집중은 가능하지만 피로 또는 긴장 관리가 함께 필요합니다.`
- 낮음: `집중 유지보다 회복이나 안정화가 먼저 필요한 상태입니다.`

### 스트레스 부하(`stress_load`)

- 높음: `긴장과 과부하 신호가 비교적 강하게 나타납니다.`
- 보통: `일부 긴장 신호가 있으나 단일 원인으로 단정하기는 어렵습니다.`
- 낮음: `스트레스 부하 신호는 상대적으로 낮은 편입니다.`

### 피로 위험(`fatigue_risk`)

- 높음: `정신 피로 또는 졸림 위험이 커 보입니다.`
- 보통: `피로 누적 가능성을 함께 확인할 필요가 있습니다.`
- 낮음: `피로 신호는 상대적으로 낮은 편입니다.`

## 7. 색상 규칙

결과 화면은 우주 테마를 유지하되 과장된 네온보다 `진단 대시보드`에 가까워야 한다.

권장 컬러:

- 배경: deep navy `#07111f`
- 카드: midnight glass `rgba(11, 23, 41, 0.72)`
- 강조 alpha/relax: cyan-teal `#6fd8ff`
- stress: amber-red `#ff8f70`
- fatigue: muted violet-blue `#8da7ff`
- focus: pale gold `#f5d36b`
- 텍스트: `#f5f7fb`, 보조 `rgba(245,247,251,0.68)`

주의:

- 빨간색을 너무 공격적으로 쓰지 않는다.
- 의료 앱처럼 딱딱하지 않게, 그러나 “예쁨 중심”도 피한다.

## 8. 점수 시각화 규칙

점수는 0~1이 아니라 0~100으로 보여준다.

- `display_score = round(score * 100)`
- confidence도 `%` 대신 `낮음/보통/높음` 보조 문구를 붙인다.

예:

- 점수 `0.685` → `69`
- confidence `0.359` → `신뢰도 낮음`

## 9. 신뢰도 블록 규칙

신뢰도는 전체 해석과 각 dimension에 모두 따로 존재한다.

### 전체 신뢰도 계산 제안

현재 AI 엔진에는 전체 confidence가 없으므로 화면에서는 다음을 사용한다.

- 기본값: `quality.score`
- 보정: 핵심 3개 dimension confidence 평균

표시 방식:

- `이번 측정 신뢰도`
- 보조 문장: `원시 EEG 기반` 또는 `밴드 요약 기반`

### 상태 메시지

- `>= 0.75`: `이번 측정은 비교적 안정적입니다.`
- `0.5 ~ 0.75`: `해석 가능하지만 일부 노이즈 가능성이 있습니다.`
- `< 0.5`: `참고용 해석으로 보는 것이 좋습니다.`

## 10. 밴드 근거 섹션 규칙

사용자에게는 밴드 이름보다 의미를 같이 붙여준다.

- `alpha`: 안정/회복 관련 리듬
- `theta`: 피로/인지부하 관련 리듬
- `beta`: 각성/긴장 관련 리듬
- `gamma`: 고주파, 노이즈 가능성 주의

차트 아래 설명 예시:

- `알파 비율이 높고 베타가 상대적으로 과도하지 않아 안정 성향이 일부 보입니다.`
- `전두 세타 비율이 높아 인지 부하 가능성을 시사합니다.`

## 11. 에러 및 예외 상태

### 측정 품질 낮음

조건:

- `quality.usable = false`
- 또는 `quality.score < 0.35`

화면 규칙:

- 강한 상태 해석 대신 `재측정 권장`
- 카드 대신 warning hero
- CTA는 `다시 측정하기`

### 밴드 요약만 있는 경우

조건:

- `input_summary.feature_source = band-summary`

화면 규칙:

- 상단 배지 `간이 해석`
- Evidence 섹션 축소
- confidence 낮게 표현

## 12. JSON에서 UI로 매핑

### 히어로

- 제목: `state_profile.label`
- 서브텍스트: `state_profile.summary`
- 보조: `quality.score`, `input_summary.baseline_mode`

### 주요 카드

- `state_profile.dimensions.focus_readiness`
- `state_profile.dimensions.stress_load`
- `state_profile.dimensions.fatigue_risk`

### 보조 카드

- `state_profile.dimensions.mental_workload`
- `state_profile.dimensions.relaxation_level`
- `state_profile.dimensions.cortical_arousal`

### 근거

- `bands.global_relative`
- `features.snapshot.theta_beta_ratio`
- `features.snapshot.alpha_beta_ratio`
- `features.artifact_indicators`

### 신뢰도

- `quality`
- `limitations`
- `citations`

## 13. 추후 개입 연결 포인트

이 화면은 recognition의 끝이면서 intervention의 시작점이다.

그래서 하단에 다음 구조를 남겨둔다.

- `current_state`: 현재 dominant state
- `recommended_direction`: 안정화 / 각성 / 회복 / 집중 진입
- `target_session_seed`: 다음 세션이 참고할 최소 상태 요약

추천 규칙 예시:

- `stress_load` 높음 → 안정화
- `fatigue_risk` 높음 → 회복
- `focus_readiness` 높음 → 집중 진입
- `relaxation_level` 높고 `fatigue_risk`도 높음 → 수동적 이완이 아니라 회복 세션 제안

## 14. 최종 결론

이 결과 화면은 다음 순서를 반드시 지켜야 한다.

1. 상태를 먼저 말한다.
2. 품질과 신뢰도를 바로 붙인다.
3. 그 다음에 근거를 보여준다.
4. 마지막에 다음 행동으로 넘긴다.

즉, 차트 중심 화면이 아니라 `상태 요약 -> 신뢰도 -> 근거 -> 다음 단계` 구조가 맞다.
