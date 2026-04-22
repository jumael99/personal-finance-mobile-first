/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fustat', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 20px 40px rgba(49, 154, 255, 0.08), inset 0 4px 4px rgba(255,255,255,0.25)',
      },
      backdropBlur: {
        glass: '50px',
      },
      colors: {
        finance: {
          charcoal: '#201F24',
          cream: '#F8F4F0',
          paper: '#FFFFFF',
          text: '#201F24',
          muted: '#696868',
          line: '#F3F3F3',
          cyan: '#82C9D7',
          plum: '#934F6F',
          slate: '#595C6B',
          rust: '#C96F4A',
          teal: '#277C78',
          red: '#C94B4B',
          peach: '#FDF1E8',
          ochre: '#B6824F',
        },
      },
    },
  },
  plugins: [],
};
