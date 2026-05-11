import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        jupyter: {
          orange: "#F37626",
          gray: "#757575",
          lightGray: "#EEEEEE",
          border: "#CFCFCF",
          bg: "#FFFFFF",
          blue: "#337AB7",
          hoverBlue: "#286090"
        }
      }
    },
  },
  plugins: [],
};
export default config;
