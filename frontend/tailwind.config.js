/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'cardinal-fruit': ['Cardinal Fruit', 'Poppins', 'Arial Black', 'Helvetica', 'sans-serif'],
        'freesentation': ['Freesentation', 'Roboto', 'Arial', 'Helvetica', 'sans-serif'],
        'freesentation-black': ['Freesentation Black', 'Freesentation', 'Roboto', 'Arial', 'Helvetica', 'sans-serif'],
        'freesentation-bold': ['Freesentation Bold', 'Freesentation', 'Roboto', 'Arial', 'Helvetica', 'sans-serif'],
        'sf-pro': ['SF Pro', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Inter', 'Roboto', 'sans-serif'],
        'sf-pro-bold': ['SF Pro Bold', 'SF Pro', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Inter', 'Roboto', 'sans-serif'],
        'sf-pro-heavy': ['SF Pro Heavy', 'SF Pro', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Inter', 'Roboto', 'sans-serif'],
        'sf-pro-display': ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Inter', 'Roboto', 'sans-serif'],
        'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'inter-display': ['Inter Display', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'instrument-serif': ['Instrument Serif', 'Georgia', 'Times New Roman', 'serif'],
        'gowun-batang': ['GowunBatang', 'Georgia', 'Times New Roman', 'serif'],
      },
      colors: {
        'azure': {
          50: '#008cff',
          63: '#52a2ed',
          82: '#a3ceff',
        },
        'grey': {
          14: '#222225',
          96: '#f5f5f7',
          97: '#f6f0fe',
        }
      },
      spacing: {
        '0.8': '0.8px',
        '15.095': '15.095px',
        '15.09': '15.09px',
        '19.2': '19.2px',
        '24.48': '24.48px',
        '27.2': '27.2px',
        '29.81': '29.81px',
        '33.6': '33.6px',
        '79.99': '79.99px',
        '91': '91px',
        '97': '97px',
        '155.94': '155.94px',
        '191.75': '191.75px',
        '330.67': '330.67px',
        '497.78': '497.78px',
        '520.45': '520.45px',
        '550.59': '550.59px',
        '622.22': '622.22px',
        '1041': '1041px',
      },
      letterSpacing: {
        '-0.2': '-0.2px',
        '-0.32': '-0.32px',
        '-0.42': '-0.42px',
        '-1.4': '-1.4px',
        '-1.44': '-1.44px',
        '-1.92': '-1.92px',
        '-2.6': '-2.6px',
        '-3.1': '-3.1px',
      },
      lineHeight: {
        '16.8': '16.8px',
        '19.2': '19.2px',
        '24.48': '24.48px',
        '27.2': '27.2px',
        '33.6': '33.6px',
      },
      borderRadius: {
        '23': '23px',
        '28': '28px',
        '35': '35px',
        '40': '40px',
        '70': '70px',
        '100': '100px',
      },
      backdropBlur: {
        '5': '5px',
      },
      maskImage: {
        'gradient': 'linear-gradient(black, transparent)',
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        gradient: 'gradient 8s linear infinite'
      },
    },
  },
  plugins: [],
}