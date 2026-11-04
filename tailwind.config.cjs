module.exports = {
  // Scan ONLY real sources. Never the generated pages (index.html, es/, it/): they contain classes from the
  // previous build, so stale rules would survive one extra build and the output would not be reproducible.
  content: [
    "./scripts/page-template.html",
    "./scripts/build-static-pages.mjs",
    "./assets/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0B1B3D",
        secondary: "#1E3A8A",
        accent: "#8A6508",
        "accent-light": "#9D7410",
        "soft-text": "#475569",
        "light-bg": "#F8FAFC",
        "medium-gray": "#CBD5E1"
      },
      fontFamily: {
        sans: ["\"EB Garamond\"", "\"EB Garamond Fallback\"", "Georgia", "serif"]
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" }
        }
      }
    }
  }
};
