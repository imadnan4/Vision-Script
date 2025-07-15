/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom theme colors for VisionScript
        primary: {
          50: '#f8fafc',   // Very light gray
          100: '#f1f5f9',  // Light gray
          200: '#e2e8f0',  // Light gray
          300: '#cbd5e1',  // Medium light gray
          400: '#94a3b8',  // Medium gray
          500: '#64748b',  // Default gray
          600: '#475569',  // Medium dark gray
          700: '#334155',  // Dark gray
          800: '#1e293b',  // Very dark gray
          900: '#0f172a',  // Almost black
          950: '#020617',  // Darkest
        },
        // Theme-specific backgrounds
        background: {
          light: '#ffffff',
          dark: '#0f172a',
        },
        // Theme-specific surfaces (cards, panels)
        surface: {
          light: '#f8fafc',
          dark: '#1e293b',
        },
        // Theme-specific borders
        border: {
          light: '#e2e8f0',
          dark: '#334155',
        },
        // Enhanced accent colors for better dark mode contrast
        accent: {
          blue: {
            light: '#3b82f6',
            dark: '#60a5fa',
          },
          green: {
            light: '#10b981',
            dark: '#34d399',
          },
          yellow: {
            light: '#f59e0b',
            dark: '#fbbf24',
          },
          red: {
            light: '#ef4444',
            dark: '#f87171',
          },
        }
      },
      // Custom animations for theme transitions
      animation: {
        'theme-transition': 'theme-transition 0.3s ease-in-out',
      },
      keyframes: {
        'theme-transition': {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        }
      },
      // Custom transitions
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
      }
    },
  },
  plugins: [],
};
