# NOOS 설문 근거

## 목표

NOOS 설문은 더 이상 일반적인 기분 확인용 체크리스트가 아니다.
NOOS recognition 엔진이 사용하는 동일한 6개 축을 추정하기 위한 짧은 상태 중심 설문이다.

- `focus_readiness`
- `stress_load`
- `fatigue_risk`
- `relaxation_level`
- `cortical_arousal`
- `mental_workload`

## 선택한 검증 기반 문항 블록

### 1. STAI-6

급성 긴장, 걱정, 상태 불안 부하를 추정하기 위해 사용한다.

- 출처: Marteau, T. M., & Bekker, H. (1992). *The development of a six-item short-form of the state scale of the Spielberger State-Trait Anxiety Inventory (STAI).* [PubMed](https://pubmed.ncbi.nlm.nih.gov/1393159/)
- 보조 타당도 근거: Tluczek et al. (2009). *Support for the Reliability and Validity of a Six-Item State Anxiety Scale Derived From the State-Trait Anxiety Inventory.* [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC2776769/)

NOOS 사용 방식:

- `stress_load`의 직접 anchor로 사용한다.
- `relaxation_level`에는 반대 방향 기여값으로 사용한다.
- `mental_workload`에는 보조 기여값으로 사용한다.

### 2. PANAS-X 주의력 / 평온 / 피로

확장 PANAS-X 매뉴얼이 순간 상태 중심 지시문과 함께 lower-order state affect scale을 제공하기 때문에 사용한다.

- 출처 매뉴얼: Watson, D., & Clark, L. A. (1994/1999). *PANAS-X Manual.* [PDF](https://www2.psychology.uiowa.edu/faculty/watson/PANAS-X.pdf)
- 원 PANAS 배경: Watson, Clark, & Tellegen (1988). *Development and Validation of Brief Measures of Positive and Negative Affect: The PANAS Scales.* [PDF](https://scienceofbehaviorchange.org/wp-content/uploads/2017/10/PANAS.Watson.1988.pdf)

NOOS 설문은 PANAS-X의 아래 lower-order block을 사용한다.

- `Attentiveness`: alert, attentive, concentrating, determined
- `Serenity`: calm, relaxed, at ease
- `Fatigue`: sleepy, tired, sluggish, drowsy

NOOS 사용 방식:

- `Attentiveness`는 `focus_readiness`와 `cortical_arousal`을 직접 보강한다.
- `Serenity`는 `relaxation_level`을 직접 보강하고, `stress_load`에는 반대 방향으로 기여한다.
- `Fatigue`는 `fatigue_risk`를 직접 보강한다.

### 3. Karolinska 졸림 척도(KSS)

즉각적인 주관적 졸림과 깨어 있음 정도를 추정하기 위해 사용한다.

- EEG와 수행 지표 기반 검증: Kaida et al. (2006). *Validation of the Karolinska sleepiness scale against performance and EEG variables.* [PDF mirror](https://fatiguemanagersnetwork.org/wp-content/uploads/Kaida-et-al.2006_Validation-of-the-Karolinska-Sleepiness-Scale.pdf)
- 한국어 검증: Kim et al. (2024). *Validation of the Karolinska Sleepiness Scale in Korean.* [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11372212/)

NOOS 사용 방식:

- `fatigue_risk`의 직접 anchor로 사용한다.
- `cortical_arousal`의 직접 anchor로 사용한다.
- `focus_readiness`에는 보조 기여값으로 사용한다.

### 4. Paas 정신 노력 평정

간결한 주관적 작업부하와 투입된 mental effort의 proxy로 사용한다.

- 출처: Paas, F. G. W. C., Tuovinen, J. E., Tabbers, H., & Van Gerven, P. W. M. (2003). *Measurement as a changeable characteristic of instructional design.* (Paas scale 계열 문헌에서 자주 인용됨)
- 기초 측정 논문: Paas et al. (1994). *Measurement of Cognitive Load in Instructional Research.* [PDF](https://ris.utwente.nl/ws/files/248299579/Paas1994measurement.pdf)
- NASA workload 배경은 개념적 보조 근거로만 사용한다: [NASA TLX](https://www.nasa.gov/human-systems-integration-division/nasa-task-load-index-tlx/)

NOOS 사용 방식:

- `mental_workload`의 primary anchor로 사용한다.
- `stress_load`, `relaxation_level`, `cortical_arousal`에는 보조 기여값으로 사용한다.

## 직접 매핑과 추론 매핑

설문에서 엔진 축으로 가는 mapping은 모든 축에서 1:1이 아니다.

직접 anchor가 있는 축:

- `stress_load`: STAI-6 + Serenity 반대 방향 기여
- `fatigue_risk`: PANAS-X Fatigue + KSS
- `mental_workload`: Paas mental effort

부분적으로 추론하는 축:

- `focus_readiness`: Attentiveness + wakefulness + 낮은 stress + 낮은 overload
- `relaxation_level`: Serenity + 낮은 STAI + 낮은 effort
- `cortical_arousal`: wakefulness + attentiveness + 낮은 fatigue + moderate effort

따라서 NOOS 설문은 근거 기반이고 구조화되어 있지만, 임상 진단 도구는 아니다. 또한 이 6개 NOOS 축에 대해 공식적으로 표준화된 한국어 규준 battery도 아니다.

## 구현 참고

제품 안의 한국어 문항은 원래 검증된 영어 item block의 의미를 현재 UI에서 자연스럽게 쓸 수 있도록 옮긴 것이다.
이 방식은 construct intent를 유지하지만, 정확한 한국어 문항 세트는 공식 규준화된 지역 표준이 아니라 제품 adaptation으로 취급해야 한다.
