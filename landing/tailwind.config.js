// landing/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // opcional: para las clases que usaste tipo bg-pastel-pink, text-pastel-brown
        "pastel-pink": "#FDECF3",
        "pastel-brown": "#6B4E3D",
      },
    },
  },
  plugins: [],
};
