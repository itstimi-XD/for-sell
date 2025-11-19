// 테마 정의
export const THEMES = {
  // 무료 테마
  default: {
    id: 'default',
    name: '기본',
    premium: false,
    pomodoro: ['#FF6B6B', '#FF8E53', '#FFB347'],
    shortBreak: ['#4ECDC4', '#44A08D', '#5BCFC5'],
    longBreak: ['#667EEA', '#764BA2', '#8E73E8'],
  },
  ocean: {
    id: 'ocean',
    name: '오션',
    premium: false,
    pomodoro: ['#2E3192', '#1BFFFF', '#4FACFE'],
    shortBreak: ['#00F260', '#0575E6'],
    longBreak: ['#1A2980', '#26D0CE'],
  },
  sunset: {
    id: 'sunset',
    name: '선셋',
    premium: false,
    pomodoro: ['#FF512F', '#DD2476'],
    shortBreak: ['#FF9966', '#FF5E62'],
    longBreak: ['#FFA751', '#FFE259'],
  },

  // 프리미엄 테마
  aurora: {
    id: 'aurora',
    name: '오로라',
    premium: true,
    pomodoro: ['#13547A', '#80D0C7'],
    shortBreak: ['#00D4FF', '#090979'],
    longBreak: ['#2C3E50', '#4CA1AF'],
  },
  lavender: {
    id: 'lavender',
    name: '라벤더',
    premium: true,
    pomodoro: ['#8E54E9', '#4776E6'],
    shortBreak: ['#B06AB3', '#4568DC'],
    longBreak: ['#834D9B', '#D04ED6'],
  },
  forest: {
    id: 'forest',
    name: '포레스트',
    premium: true,
    pomodoro: ['#134E5E', '#71B280'],
    shortBreak: ['#0F9B8E', '#16A085'],
    longBreak: ['#114357', '#F29492'],
  },
  mint: {
    id: 'mint',
    name: '민트',
    premium: true,
    pomodoro: ['#00B4DB', '#0083B0'],
    shortBreak: ['#00C9FF', '#92FE9D'],
    longBreak: ['#56CCF2', '#2F80ED'],
  },
  rose: {
    id: 'rose',
    name: '로즈',
    premium: true,
    pomodoro: ['#F85032', '#E73827'],
    shortBreak: ['#FF6B95', '#FFC796'],
    longBreak: ['#E43A15', '#E65245'],
  },
  midnight: {
    id: 'midnight',
    name: '미드나잇',
    premium: true,
    pomodoro: ['#232526', '#414345'],
    shortBreak: ['#1E3C72', '#2A5298'],
    longBreak: ['#0F2027', '#203A43', '#2C5364'],
  },
  peachy: {
    id: 'peachy',
    name: '피치',
    premium: true,
    pomodoro: ['#ED4264', '#FFEDBC'],
    shortBreak: ['#FFDEE9', '#B5FFFC'],
    longBreak: ['#FEC163', '#DE4313'],
  },
  cosmic: {
    id: 'cosmic',
    name: '코스믹',
    premium: true,
    pomodoro: ['#5f2c82', '#49a09d'],
    shortBreak: ['#C04848', '#480048'],
    longBreak: ['#360033', '#0b8793'],
  },
  sakura: {
    id: 'sakura',
    name: '사쿠라',
    premium: true,
    pomodoro: ['#FFB7B7', '#FF6B95'],
    shortBreak: ['#FFE5E5', '#FFA8A8'],
    longBreak: ['#FF9A9E', '#FAD0C4'],
  },
  arctic: {
    id: 'arctic',
    name: '아틱',
    premium: true,
    pomodoro: ['#E0EAFC', '#CFDEF3'],
    shortBreak: ['#A1FFCE', '#FAFFD1'],
    longBreak: ['#FDFBFB', '#EBEDEE'],
  },
};

// 무료 테마 목록
export const FREE_THEMES = Object.values(THEMES).filter(t => !t.premium);

// 프리미엄 테마 목록
export const PREMIUM_THEMES = Object.values(THEMES).filter(t => t.premium);

// 테마 ID로 테마 가져오기
export const getThemeById = (id) => {
  return THEMES[id] || THEMES.default;
};
