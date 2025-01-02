/** @type {import('tailwindcss').Config} */
// This line provides TypeScript support and ensures proper IntelliSense for the Tailwind CSS configuration

export default {
  darkMode: ["class"],
  // **Content Paths**:
  // Specify the files Tailwind should scan to generate styles.
  // This includes the index.html file and all files within the "src" directory
  // with the extensions .js, .ts, .jsx, and .tsx.
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  // **Theme Configuration**:
  // Extend the default Tailwind theme here. This section is used to customize
  // default styles, add new utilities, or override existing ones.
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      backgroundImage: {
        "radial-gradient":
          "radial-gradient(circle, #F7F1F0 30%, #C3A6A0 50%, #A15C38 105%)",
      },
      animation: {
        fadeIn: "fadeIn 2s ease-in-out",
        slideUp: "slideUp 1s ease-out",
        gradient: "gradient 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        gradient: {
          "0%": { background: "linear-gradient(to bottom, #F7F1F0, #C3A6A0)" },
          "50%": { background: "linear-gradient(to bottom, #C3A6A0, #A15C38)" },
          "100%": {
            background: "linear-gradient(to bottom, #F7F1F0, #C3A6A0)",
          },
        },
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
};
