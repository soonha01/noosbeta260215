# 프론트엔드 SRC 지식 베이스

## 한눈에 보기

`frontend/src`에는 실제 React 앱 소스가 있습니다. 라우트 shell, Muse/auth 흐름, solar travel 생성/플레이어 화면, API helper를 포함합니다.

## 폴더 구조

```text
src/
+-- App.jsx              # 최상위 route map입니다.
+-- pages/               # route wrapper와 page-level shell입니다.
+-- components/features/ # auth, Muse, board/chat, solar travel 기능입니다.
+-- components/layout/   # iframe과 transition wrapper입니다.
+-- components/ui/       # 시각 primitive와 effect입니다.
+-- lib/                 # env, API client, Muse helper입니다.
`-- legacy/              # 비활성 Vite-native landing 참고 코드입니다.
```

## 어디를 보면 되는가

| 작업 | 위치 | 설명 |
| --- | --- | --- |
| 라우트 변경 | `App.jsx`, `pages/**` | 대부분의 page는 feature component를 감싸는 shell입니다. |
| 루트 로그인/랜딩 상태 | `pages/root/NoosRootPage.jsx` | jump, login, embedded landing iframe을 다룹니다. |
| AI Objet 라우트 | `pages/ai-objet/AIObjetPage.jsx` | 임베디드 export를 iframe으로 보여줍니다. |
| 상태 설문 | `components/features/auth/StateSurveyPage.jsx`, `lib/stateSurvey.js` | 설문 점수 계산과 UI를 담당합니다. |
| Muse 연결 | `components/features/auth/Login.jsx`, `lib/muse/**` | Web Bluetooth와 live session buffer를 사용합니다. |
| Muse 대시보드 | `components/features/auth/MuseSignalDashboard.jsx` | EEG 시각 해석 화면입니다. |
| 행성 선택 | `components/features/solar/SolarExplorer.jsx` | gallery/media 강조 요소를 사용합니다. |
| 여행 workflow | `components/features/solar/SpaceTravel.jsx` | 큰 생성/플레이어 controller입니다. |
| 플레이어 UI | `components/features/solar/travel/` | 하위 컴포넌트와 local storage helper가 있습니다. |
| 백엔드 API | `lib/noosAiApi.js`, `lib/eegAnalysisApi.js` | fetch wrapper와 fallback을 담당합니다. |

## 작업 규칙

- Route component는 `App.jsx`에서 lazy-load됩니다. route wrapper는 얇게 유지합니다.
- 백엔드 base URL은 `lib/env.js`에서 가져옵니다. 이 파일이 `VITE_*`와 `REACT_APP_*` 값을 정규화합니다.
- NOOS AI 생성 호출은 `lib/noosAiApi.js`를 통과해야 합니다. EEG 제출은 `lib/eegAnalysisApi.js`를 통과해야 합니다.
- Muse live reading은 `lib/muse/liveMuseSession.js`로 공유합니다. 임시 global buffer를 병렬로 만들지 않습니다.
- 생성된 journey UI는 AI output, 정적 행성 media, WiZ 상태, local record, audio queue 상태를 함께 사용합니다. `SpaceTravel.jsx`를 수정할 때는 diff를 좁게 유지합니다.
- 이 영역에는 한국어 사용자 문구가 많습니다. copy를 바꿀 때 기존 말투를 유지합니다.

## 피해야 할 패턴

- 오래된 auth/admin/chat 파일의 하드코딩된 `localhost` API 상수를 새 코드에 복사하지 않습니다.
- 생성 요약이나 UI 문구에서 의료 진단처럼 보이는 표현을 만들지 않습니다.
- 새 production logic을 `legacy/vite-landing`에 넣지 않습니다.
- 생성 음악/조명 세션을 떠날 때 `stopWizLighting` cleanup을 우회하지 않습니다.
- queueing, crossfade, storage, WiZ cleanup 동작 보존까지 함께 다루지 않는다면 `SpaceTravel.jsx`를 가볍게 쪼개지 않습니다.

## 테스트 참고

- 현재 작성된 프론트엔드 테스트가 없다고 가정하지 말고, 실제 테스트 목록을 먼저 확인합니다.
- 우선 테스트하기 좋은 대상은 `lib/stateSurvey.js`, `lib/eegAnalysisApi.js`, `lib/noosAiApi.js`, `lib/muse/signalProcessing.js`입니다.
- 테스트가 부족한 영역에서는 `npm run build`를 기본 검증으로 사용합니다.
