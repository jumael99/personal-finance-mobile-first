/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Newsreader', 'serif'],
        sans: ['"SFMono-Regular"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        glass:
          '0 2.8px 2.2px rgba(0, 0, 0, 0.035), 0 6.7px 5.3px rgba(0, 0, 0, 0.047), 0 12.5px 10px rgba(0, 0, 0, 0.06), 0 22.3px 17.9px rgba(0, 0, 0, 0.07), 0 41.8px 33.4px rgba(0, 0, 0, 0.086), 0 24px 24px -12px rgba(0, 0, 0, 0.06)',
      },
      backdropBlur: {
        glass: '14px',
      },
      colors: {
        finance: {
          charcoal: '#241208',
          cream: '#FCF9F6',
          paper: '#FCF9F6',
          text: '#241208',
          muted: '#6E5447',
          line: 'rgba(36, 18, 8, 0.12)',
          cyan: '#92CFF2',
          plum: '#E7A98E',
          slate: '#CBBFB6',
          rust: '#F47C59',
          teal: '#92CFF2',
          red: '#F47C59',
          peach: 'rgba(244, 124, 89, 0.12)',
          ochre: '#F47C59',
        },
      },
    },
  },
  plugins: [],
};
