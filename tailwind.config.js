/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172126',
        muted: '#647179',
        canvas: '#f6f7fb',
        brand: '#0f766e',
        accent: '#e5b34b'
      },
      boxShadow: {
        soft: '0 12px 40px rgba(27, 44, 51, 0.08)'
      }
    }
  },
  plugins: []
};
