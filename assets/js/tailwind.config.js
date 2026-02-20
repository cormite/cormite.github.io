tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: '#0B1B3D',
        secondary: '#1E3A8A',
        accent: '#B8860B',
        'accent-light': '#D4A84B',
        'soft-text': '#475569',
        'light-bg': '#F8FAFC',
        'medium-gray': '#CBD5E1'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }
        }
      }
    }
  }
};

if (typeof tailwind.refresh === 'function') {
  tailwind.refresh();
}
