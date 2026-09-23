/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        academic: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1557D6', // Strong academic blue from reference image
          700: '#0D3EA8', // Primary dark
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        paper: {
          ivory: '#F5F1E8',   // Reference warm background
          warm: '#FAF8F5',    // Soft ivory surface
          ribbon: '#F7F5EE',  // Top editorial banner
          surface: '#FFFDF7', // Paper cards
          card: '#FFFFFF',
          border: '#D9D5CA',  // Paper edge border
          borderLight: '#E5E0D8',
          sub: '#687080',     // Secondary editorial text
        },
        charcoal: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#172033', // Deep charcoal typography
          950: '#0F172A',
        },
        amberAccent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          sticky: '#FEF9C3',
          stickyBorder: '#FDE047',
        },
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#1557D6',
          600: '#1557D6',
          700: '#0D3EA8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        editorial: ['Newsreader', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        handwritten: ['Caveat', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'paper-sm': '0 1px 3px rgba(23, 32, 51, 0.04), 0 1px 2px rgba(23, 32, 51, 0.02)',
        'paper': '0 3px 12px -2px rgba(23, 32, 51, 0.05), 0 1px 4px -1px rgba(23, 32, 51, 0.02)',
        'paper-elevated': '0 8px 24px -4px rgba(23, 32, 51, 0.08), 0 2px 6px -1px rgba(23, 32, 51, 0.03)',
        'sticky': '0 4px 10px -1px rgba(180, 83, 9, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
