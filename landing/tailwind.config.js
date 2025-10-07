/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          pastel: {
            pink: "#F9E5E1",
            brown: "#7C4A33",
            gold: "#D4AF37",
          },
        },
      },
    },
    plugins: [],
  };
  