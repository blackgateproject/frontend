/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: [
      "nord",
      {
        blackgate: {
          "primary": "#521EA0",
          "secondary": "#B80000",
          "accent": "#FFFFFF",
          "neutral": "#FFFFFF",
          "base-100": "#ffffff",
          "base-200": "#F7F3F8",
          "base-300": "#F8F5F9",
        },
      },
    ], // Set the default theme to "light"
  },
}