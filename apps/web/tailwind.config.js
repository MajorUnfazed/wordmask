/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: 'var(--color-void)',
        surface: 'var(--color-surface)',
        accent: 'var(--color-accent)',
        'accent-light': 'var(--color-accent-light)',
        danger: 'var(--color-danger)',
      },
      fontFamily: {
        display: ['Cinzel Decorative', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
