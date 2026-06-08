import { PLANET_LIGHTING_PREVIEW } from './lightingPreview';
import { publicAsset } from '../../../../lib/env';

export const STEP_SEATING = 'seating';
export const STEP_TICKET = 'ticket';
export const STEP_GENERATING = 'generating';
export const STEP_PLAYER = 'player';
export const STEP_DASHBOARD = 'dashboard';
export const STEP_PROFILE = 'profile';

export const EXIT_TO_PLANETS = 'planets';
export const EXIT_TO_HOME = 'home';

export const STATE_STORAGE_KEY = 'noos_current_state';
export const FEEDBACK_STORAGE_KEY = 'noos_feedback_history';
export const TRAVEL_RECORDS_STORAGE_KEY = 'noos_travel_records';
export const MEMO_STORAGE_KEY = 'noos_dashboard_note';
export const PROFILE_STORAGE_KEY = 'noos_user_profile';
export const AI_CONTEXT_STORAGE_KEY = 'noos_ai_context';
export const LIVE_MUSE_SESSION_STORAGE_KEY = 'noos_live_muse_session';

export const TRACK_DURATION_SEC = 226;

export const DEFAULT_PROFILE = {
  userId: 'noos-traveler',
  name: 'Space Traveler',
  email: 'traveler@noos.space',
  phone: '',
  password: '',
};

const planetImage = (planet) => publicAsset(`media/planets/textures/${planet}.jpg`);
const planetBackground = (planet) => publicAsset(`media/planets/backgrounds/${planet}.jpg`);

export const PLANET_MEDIA = {
  mercury: {
    title: 'Mercury',
    moodTarget: '순간 점화 집중',
    description:
      '망설임을 줄이고 빠르게 시작할 수 있도록 돕는 환경입니다. 짧은 시간 안에 집중을 켜고, 작업 진입 속도를 끌어올리고 싶을 때 적합합니다.',
    trackName: 'Mercury Pulse',
    image: planetImage('mercury'),
    backgroundImage: planetBackground('mercury'),
    lightingPreview: PLANET_LIGHTING_PREVIEW.mercury,
  },
  venus: {
    title: 'Venus',
    moodTarget: '온기 있는 창의',
    description:
      '감각과 감정을 부드럽게 깨워 아이디어가 자연스럽게 흐르도록 돕는 환경입니다. 글쓰기, 디자인, 브랜딩처럼 섬세한 표현과 연상이 필요한 순간에 어울립니다.',
    trackName: 'Venus Drift',
    image: planetImage('venus'),
    backgroundImage: planetBackground('venus'),
    lightingPreview: PLANET_LIGHTING_PREVIEW.venus,
  },
  earth: {
    title: 'Earth',
    moodTarget: '균형형 집중',
    description:
      '과하게 긴장하지 않으면서도 안정적으로 집중을 유지하도록 설계된 환경입니다. 장시간 업무, 학습, 루틴 작업을 편안하게 이어가고 싶을 때 적합합니다.',
    trackName: 'Earth Balance',
    image: planetImage('earth'),
    backgroundImage: planetBackground('earth'),
    lightingPreview: PLANET_LIGHTING_PREVIEW.earth,
  },
  mars: {
    title: 'Mars',
    moodTarget: '결단과 실행',
    description:
      '미루고 있던 일을 바로 행동으로 옮길 수 있도록 추진력을 높이는 환경입니다. 빠른 결단, 실행, 돌파가 필요한 순간에 가장 잘 맞습니다.',
    trackName: 'Mars Forward',
    image: planetImage('mars'),
    backgroundImage: planetBackground('mars'),
    audio: publicAsset('media/travel-player/audio/mars/mars.mp3'),
    lightingPreview: PLANET_LIGHTING_PREVIEW.mars,
  },
  jupiter: {
    title: 'Jupiter',
    moodTarget: '전략적 존재감',
    description:
      '큰 그림을 보고 판단의 중심을 잡을 수 있도록 돕는 환경입니다. 중요한 선택, 발표 준비, 리더십이 필요한 상황에서 넓고 단단한 사고를 지원합니다.',
    trackName: 'Jupiter Command',
    image: planetImage('jupiter'),
    backgroundImage: planetBackground('jupiter'),
    lightingPreview: PLANET_LIGHTING_PREVIEW.jupiter,
  },
  saturn: {
    title: 'Saturn',
    moodTarget: '깊은 사유',
    description:
      '느리고 정교한 사고를 오래 유지할 수 있도록 돕는 환경입니다. 기획, 연구, 구조 설계, 철학적 정리처럼 긴 호흡의 사고가 필요한 순간에 적합합니다.',
    trackName: 'Saturn Ring Study',
    image: planetImage('saturn'),
    backgroundImage: planetBackground('saturn'),
    lightingPreview: PLANET_LIGHTING_PREVIEW.saturn,
  },
  uranus: {
    title: 'Uranus',
    moodTarget: '전환형 창의',
    description:
      '익숙한 방식에서 벗어나 새로운 관점으로 사고를 전환하도록 돕는 환경입니다. 막힌 아이디어를 깨고, 발상 전환이나 실험적 접근이 필요할 때 어울립니다.',
    trackName: 'Uranus Shift',
    image: planetImage('uranus'),
    backgroundImage: planetBackground('uranus'),
    lightingPreview: PLANET_LIGHTING_PREVIEW.uranus,
  },
  neptune: {
    title: 'Neptune',
    moodTarget: '딥워크 몰입',
    description:
      '외부 잡음을 최대한 줄이고 좁고 깊은 집중 상태로 들어가도록 설계된 환경입니다. 코딩, 독서, 논문, 분석처럼 높은 몰입 밀도가 필요한 작업에 적합합니다.',
    trackName: 'Neptune Deep Focus',
    image: planetImage('neptune'),
    backgroundImage: planetBackground('neptune'),
    lightingPreview: PLANET_LIGHTING_PREVIEW.neptune,
  },
  pluto: {
    title: 'Pluto',
    moodTarget: '회복과 리셋',
    description:
      '긴장을 낮추고 감각을 천천히 가라앉히며 하루를 정리하도록 돕는 환경입니다. 과부하 이후 회복, 정서적 안정, 전환이 필요한 시간에 가장 잘 맞습니다.',
    trackName: 'Pluto Calm Night',
    image: planetImage('pluto'),
    backgroundImage: planetBackground('pluto'),
    lightingPreview: PLANET_LIGHTING_PREVIEW.pluto,
  },
};
