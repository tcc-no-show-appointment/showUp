/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cyan: '#06b6d4', // cyan-500
          blue: '#2563eb', // blue-600
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
      }
    },
  },
  plugins: [],
}
