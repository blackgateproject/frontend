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
          "primary": "#0068ff",
          "secondary": "#0040ff",
          "accent": "#AE4AFF",
          "neutral": "#FFFFFF",
          "base-100": "#ffffff",
          "base-200": "#F4F4F4",
          "base-300": "#F3F3F3",
        },
      },
    ], // Set the default theme to "light"
  },
}