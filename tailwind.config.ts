import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        accent: '#22c55e', // verde do destaque
        brandFrom: '#7c3aed', // roxo
        brandTo: '#2563eb',   // azul
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)'
      },
      borderRadius: {
        xl: '0.75rem'
      }
    },
  },
  plugins: [],
} satisfies Config