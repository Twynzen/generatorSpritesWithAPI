/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Matrix Theme Colors
        'matrix': {
          'green': '#00ff41',
          'green-dark': '#00cc33',
          'green-light': '#39ff14',
          'green-glow': '#00ff4180',
          'cyan': '#00d4ff',
          'cyan-dark': '#00a8cc',
        },
        // Dark backgrounds
        'void': {
          'black': '#000000',
          'darker': '#050505',
          'dark': '#0a0a0a',
          'DEFAULT': '#0d0d0d',
          'light': '#121212',
          'lighter': '#1a1a1a',
        },
        // Surface colors (slightly lighter for cards/panels)
        'surface': '#0d0d0d',
        'surface-light': '#141414',
        'surface-lighter': '#1a1a1a',
        // Semantic colors
        'primary': '#00ff41',
        'primary-dark': '#00cc33',
        'primary-light': '#39ff14',
        'secondary': '#00d4ff',
        'secondary-dark': '#00a8cc',
        'success': '#00ff41',
        'warning': '#ffb800',
        'error': '#ff3333',
        'error-dark': '#cc0000',
        // Text colors
        'text': {
          'primary': '#00ff41',
          'secondary': '#00cc33',
          'muted': '#666666',
          'light': '#888888',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
        'display': ['Orbitron', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'flicker': 'flicker 0.15s infinite',
        'scan-line': 'scanLine 8s linear infinite',
        'matrix-rain': 'matrixRain 20s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'typing': 'typing 3.5s steps(40, end)',
        'blink-caret': 'blinkCaret .75s step-end infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 15px #00ff41',
            borderColor: '#00ff41'
          },
          '50%': {
            boxShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41',
            borderColor: '#39ff14'
          },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        matrixRain: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glow: {
          'from': {
            textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41'
          },
          'to': {
            textShadow: '0 0 20px #00ff41, 0 0 30px #00ff41, 0 0 40px #00ff41'
          },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        blinkCaret: {
          'from, to': { borderColor: 'transparent' },
          '50%': { borderColor: '#00ff41' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'matrix': '0 0 10px #00ff41, 0 0 20px #00ff4150',
        'matrix-lg': '0 0 20px #00ff41, 0 0 40px #00ff4150, 0 0 60px #00ff4130',
        'matrix-inner': 'inset 0 0 20px #00ff4120',
        'neon-green': '0 0 5px #00ff41, 0 0 10px #00ff41',
        'neon-cyan': '0 0 5px #00d4ff, 0 0 10px #00d4ff',
        'glow-sm': '0 0 10px currentColor',
        'glow-md': '0 0 20px currentColor',
        'glow-lg': '0 0 30px currentColor',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(#00ff4108 1px, transparent 1px), linear-gradient(90deg, #00ff4108 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'scanlines': 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
      borderWidth: {
        '1': '1px',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
