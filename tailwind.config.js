/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Add your custom tokens here
      colors: {
        primary: '#0F172A',
        secondary: '#22D3EE',
        accent: '#FACC15',
      },
      fontFamily: {
        // If you want a separate heading font
        heading: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}