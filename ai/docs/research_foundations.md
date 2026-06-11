# 연구 근거

이 문서는 현재 `recognition session` 엔진이 어떤 근거 위에서 무엇을 말하고, 무엇은 아직 과장하지 않는지를 정리한 문서다.

## 1. 현재 장비 한계

현재 프로젝트의 실측 장비는 프론트엔드 코드 기준 `Muse S Athena`이며, 실사용 채널은 `AF7`, `AF8`, `TP9`, `TP10` 4채널이다.

- 프론트 수집 코드: [frontend/src/lib/muse/createWebMuseClient.js](/Users/suhwan/Documents/NOOS%20AI%20MODULE/noosbeta260215/frontend/src/lib/muse/createWebMuseClient.js)
- 프론트 1차 분석 코드: [frontend/src/lib/muse/signalProcessing.js](/Users/suhwan/Documents/NOOS%20AI%20MODULE/noosbeta260215/frontend/src/lib/muse/signalProcessing.js)

이 몽타주는 full-cap EEG가 아니므로, 현재 엔진은 다음 원칙을 따른다.

- 넓은 상태 축은 추정할 수 있다.
- 미세 감정 분류나 정신질환 판정은 하지 않는다.
- frontal midline theta를 Muse의 `AF7/AF8` 전두 채널로 근사한다.  
  이 부분은 논문에서 바로 검증된 동일 몽타주가 아니라, 기존 연구를 현재 장비에 맞춰 보수적으로 옮긴 `inference from sources`다.

## 2. 근거가 비교적 강한 축

### 2.1 인지 작업부하

주요 근거:

- [EEG power spectral measures of cognitive workload: A meta-analysis](https://pubmed.ncbi.nlm.nih.gov/35128686/)

핵심 정리:

- 작업부하와 가장 일관되게 연결되는 지표는 `theta`, 특히 `frontal theta`
- alpha와 beta도 함께 변하지만 theta가 중심 지표

그래서 엔진은 workload를 계산할 때:

- `frontal theta relative`
- `frontal theta / beta`
- `frontal alpha suppression`

를 중심으로 사용한다.

### 2.2 정신 피로 / 졸림 위험

주요 근거:

- [The influence of mental fatigue on brain activity: Evidence from a systematic review with meta-analyses](https://pubmed.ncbi.nlm.nih.gov/32108954/)
- [EEG-Based Assessment of Mental Fatigue in Students: A Systematic Review of Measurement Methods and Data Processing Protocols](https://www.mdpi.com/2076-3417/16/1/234)

핵심 정리:

- 정신 피로는 theta, alpha 증가와 자주 연결
- beta는 상대적으로 낮아지거나 덜 우세해지는 패턴이 자주 등장

그래서 엔진은 fatigue를 계산할 때:

- `global theta`
- `global alpha`
- `alpha / beta`
- `low beta`

를 묶어서 본다.

### 2.3 스트레스 부하

주요 근거:

- [The neural correlates of psychosocial stress: A systematic review and meta-analysis of spectral analysis EEG studies](https://pubmed.ncbi.nlm.nih.gov/35573807/)

핵심 정리:

- psychosocial stress 연구에서 비교적 일관된 방향은 `alpha 감소`, `beta 증가`
- FAA나 theta-alpha ratio 등은 더 불안정

그래서 엔진은 stress를 계산할 때:

- `low alpha`
- `high beta`
- `beta / alpha`

를 중심으로 사용하고, FAA는 현재 핵심 판단축에 넣지 않았다.

## 3. 장비 타당성

주요 근거:

- [Comparison of Medical and Consumer Wireless EEG Systems for Use in Clinical Trials](https://pubmed.ncbi.nlm.nih.gov/28824402/)
- [Beyond the lab: real-world benchmarking of wearable EEGs for passive brain-computer interfaces](https://pmc.ncbi.nlm.nih.gov/articles/PMC12779824/)

핵심 정리:

- Muse 같은 consumer EEG도 기본 스펙트럼은 잡을 수 있다.
- 다만 artifact, 세션 간 변동성, 신뢰도는 의료급보다 약하다.

그래서 현재 엔진은 반드시 함께 출력한다.

- `quality score`
- `artifact indicators`
- `limitations`

## 4. 현재 의도적으로 안 하는 것

- 우울증, ADHD, PTSD 같은 진단적 분류
- 사용자 감정을 세밀하게 `행복/슬픔/분노`처럼 확정 분류
- FAA 단독 기반 정서 판정

관련 배경:

- [Frontal EEG alpha asymmetry and emotion: From neural underpinnings and methodological considerations to psychopathology and social cognition](https://pubmed.ncbi.nlm.nih.gov/29243266/)

## 5. 향후 학습용 공개 데이터셋

현재 엔진은 설명 가능한 규칙 기반 1차 버전이다.  
다음 단계에서 supervised / calibrated model로 확장할 수 있게 공식 데이터셋 카탈로그를 같이 넣었다.

- EEGMAT: [PhysioNet EEG During Mental Arithmetic Tasks](https://www.physionet.org/content/eegmat/1.0.0/)
  작업부하 / 각성 유사 변화
- SEED-VIG: [SEED-VIG](https://weilongzheng.github.io/datasets/seed-vig/)
  각성 유지 / 피로
- DEAP: [DEAP Dataset](https://www.eecs.qmul.ac.uk/mmv/datasets/deap/download_split.html)
  정서 valence / arousal
- AMIGOS: [AMIGOS Dataset](https://eecs.qmul.ac.uk/mmv/datasets/amigos/index.html)
  정서 / 기분 / 사회적 맥락

## 6. 결론

현재 recognition 엔진은 다음 수준을 목표로 한다.

- `작업부하가 높다/낮다`
- `피로 위험이 높다/낮다`
- `스트레스 부하가 높다/낮다`
- `이완 수준`
- `각성 수준`
- `집중 준비도`

반대로 다음은 일부러 보수적으로 제한한다.

- 진단
- 세밀 감정 확정
- 과도한 해석
