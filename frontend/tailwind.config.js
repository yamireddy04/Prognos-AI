/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Instrument Sans', 'system-ui', 'sans-serif'],
          serif: ['Instrument Serif', 'Georgia', 'serif'],
          mono: ['JetBrains Mono', 'monospace'],
        },
        colors: {
          cobalt: {
            DEFAULT: '#1a56db',
            light: '#3b72f6',
            pale: '#eff4ff',
            border: '#c3d5fc',
          },
          clinical: {
            50: '#f8f9fb',
            100: '#f0f2f5',
            200: '#e2e6ec',
            300: '#c8cfd9',
            400: '#9aa3b0',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
          },
          success: { DEFAULT: '#059669', pale: '#f0fdf4' },
          warning: { DEFAULT: '#d97706', pale: '#fffbeb' },
          danger: { DEFAULT: '#e11d48', pale: '#fff1f2' },
          info: { DEFAULT: '#0d9488', pale: '#f0fdfa' },
        },
        boxShadow: {
          xs: '0 1px 2px rgba(0,0,0,0.05)',
          sm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
          md: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
          lg: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
          xl: '0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.03)',
          'cobalt': '0 4px 14px rgba(26,86,219,0.25)',
        },
        borderRadius: {
          xl: '14px',
          '2xl': '18px',
          '3xl': '24px',
        },
        animation: {
          'slide-up': 'slideUp 0.35s ease-out',
          'fade-in': 'fadeIn 0.3s ease-out',
          'pulse-slow': 'pulse 3s ease-in-out infinite',
        },
      },
    },
    plugins: [],
  }