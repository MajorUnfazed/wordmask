/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: 'var(--color-void)',
        surface: 'var(--color-surface)',
        accent: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
        'accent-light': 'rgb(var(--color-accent-light-rgb) / <alpha-value>)',
        cyan: 'rgb(var(--color-cyan-rgb) / <alpha-value>)',
        'cyan-light': 'rgb(var(--color-cyan-light-rgb) / <alpha-value>)',
        danger: 'rgb(var(--color-danger-rgb) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Chakra Petch', 'Rajdhani', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        wordmark: ['Orbitron', 'Chakra Petch', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
