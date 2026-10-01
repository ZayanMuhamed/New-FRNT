/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--bg)',
          text: 'var(--text)',
          muted: 'var(--muted)',
          accent: 'var(--accent)',
          border: 'var(--border)',
          'border-focus': 'var(--border-focus)',
          card: 'var(--card-bg)',
          glow: 'var(--glow-color)',
        },
      },
      fontFamily: {
        geist: ['Geist', 'sans-serif'],
        space: ['"Space Grotesk"', 'sans-serif'],
        current: ['var(--font-family)', 'sans-serif'],
      },
      borderRadius: {
        'theme-input': 'var(--radius-input)',
        'theme-btn': 'var(--radius-btn)',
      },
      boxShadow: {
        'theme-glow': '0 0 25px var(--glow-color)',
        'theme-accent': '0 0 20px -2px var(--accent)',
      },
    },
  },
  plugins: [],
}
