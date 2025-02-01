/** @type {import('tailwindcss').Config} */
export default {
  content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
      extend: {
        fontSize: {
          base: ['2.4vh', '2vh'],
        }
      },
  },
  plugins: [],
}