export const STEP_SEATING = 'seating';
export const STEP_TICKET = 'ticket';
export const STEP_PLAYER = 'player';
export const STEP_DASHBOARD = 'dashboard';
export const STEP_PROFILE = 'profile';

export const EXIT_TO_PLANETS = 'planets';
export const EXIT_TO_HOME = 'home';

export const STATE_STORAGE_KEY = 'noos_current_state';
export const FEEDBACK_STORAGE_KEY = 'noos_feedback_history';
export const MEMO_STORAGE_KEY = 'noos_dashboard_note';
export const PROFILE_STORAGE_KEY = 'noos_user_profile';

export const TRACK_DURATION_SEC = 226;

export const DEFAULT_PROFILE = {
  userId: 'noos-traveler',
  name: 'Space Traveler',
  email: 'traveler@noos.space',
  phone: '',
  password: '',
};

export const PLANET_MEDIA = {
  mercury: {
    title: 'Mercury',
    moodTarget: '순간 점화 집중',
    description:
      '태양과 가장 가까운 고속 궤도. 빠른 시작과 강한 추진력이 필요한 순간에 적합한 환경입니다.',
    trackName: 'Mercury Pulse',
    image: 'https://www.solarsystemscope.com/images/textures/full/2k_makemake_fictional.jpg',
  },
  venus: {
    title: 'Venus',
    moodTarget: '창의적 몰입',
    description:
      '감각적이고 따뜻한 밀도의 흐름. 아이디어를 확장하고 섬세한 표현을 끌어올리는 분위기입니다.',
    trackName: 'Venus Drift',
    image: 'https://nasa3d.arc.nasa.gov/shared_assets/images/ven0aaa2/ven0aaa2-copy-428-321.jpg',
  },
  earth: {
    title: 'Earth',
    moodTarget: '균형형 집중',
    description:
      '안정적인 리듬과 균형 잡힌 공간. 장시간의 업무와 학습을 편안하게 지속하기 위한 환경입니다.',
    trackName: 'Earth Balance',
    image: 'https://img00.deviantart.net/04ef/i/2009/114/3/e/new_earth_texture_map_by_lightondesigns.jpg',
  },
  mars: {
    title: 'Mars',
    moodTarget: '결단/실행 모드',
    description:
      '강한 결단과 실행을 밀어주는 추진형 환경. 시작을 미루는 시간을 줄이고 돌파력을 올려줍니다.',
    trackName: 'Mars Forward',
    image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/217233/mars_texture.jpg',
    audio: '/media/travel-player/audio/mars/mars.mp3',
  },
  jupiter: {
    title: 'Jupiter',
    moodTarget: '확장형 리더십',
    description:
      '넓고 단단한 스케일의 집중감. 큰 결정을 내리거나 팀 단위 사고를 정리할 때 적합한 분위기입니다.',
    trackName: 'Jupiter Command',
    image: 'https://www.jpl.nasa.gov/spaceimages/images/largesize/PIA07782_hires.jpg',
  },
  saturn: {
    title: 'Saturn',
    moodTarget: '깊은 사유',
    description:
      '차분하고 오래 지속되는 사고의 밀도. 전략 수립, 기획, 연구와 같은 긴 호흡 작업에 적합합니다.',
    trackName: 'Saturn Ring Study',
    image: 'https://www.solarsystemscope.com/images/textures/full/2k_saturn.jpg',
  },
  uranus: {
    title: 'Uranus',
    moodTarget: '전환형 창의',
    description:
      '기존 틀을 벗어나 새로운 관점을 확장하는 흐름. 구조 전환이 필요한 창의 작업에 적합합니다.',
    trackName: 'Uranus Shift',
    image: 'https://img00.deviantart.net/957c/i/2017/165/4/9/uranus_texture_map_by_jcpag2010-db7yjwb.png',
  },
  neptune: {
    title: 'Neptune',
    moodTarget: '딥워크 몰입',
    description:
      '잡음을 최대한 억제하고 깊은 몰입 상태로 진입하는 환경. 코딩, 독서, 분석 작업에 최적화됩니다.',
    trackName: 'Neptune Deep Focus',
    image: 'https://www.solarsystemscope.com/images/textures/full/2k_neptune.jpg',
  },
  pluto: {
    title: 'Pluto',
    moodTarget: '회복/정리',
    description:
      '하루를 정리하고 내면을 안정시키는 정돈형 환경. 회복과 전환, 수면 전 루틴에 적합합니다.',
    trackName: 'Pluto Calm Night',
    image: 'https://pre00.deviantart.net/4677/th/pre/f/2015/314/4/e/pluto_map__2015_nov_10__by_snowfall_the_cat-d918tlb.png',
  },
};
