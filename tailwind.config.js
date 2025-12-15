/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#6366f1',
        'primary-dark': '#4f46e5',
        'surface': '#1e1e2e',
        'surface-light': '#2a2a3e',
        'success': '#22c55e',
        'warning': '#f59e0b',
        'error': '#ef4444',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
