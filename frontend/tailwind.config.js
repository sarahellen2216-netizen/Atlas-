```js
/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],

  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#22C55E",

        danger: "#EF4444",
        warning: "#F59E0B",

        dark: "#1F2937",

        background: "#F8FAFC"
      },

      fontFamily: {
        poppins: [
          "Poppins",
          "sans-serif"
        ],

        inter: [
          "Inter",
          "sans-serif"
        ]
      },

      boxShadow: {
        card:
          "0 4px 20px rgba(15, 23, 42, 0.06)"
      },

      borderRadius: {
        xl: "1rem"
      }
    }
  },

  plugins: []
};
```
