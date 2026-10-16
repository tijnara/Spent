import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                spent: {
                    violet: {
                        light: '#9f7aea',
                        DEFAULT: '#6b46c1',
                        dark: '#44337a',
                        bg: '#f3e8ff'
                    },
                    yellow: {
                        light: '#fef08a',
                        DEFAULT: '#ecc94b',
                        dark: '#d69e2e',
                    }
                }
            },
        },
    },
    plugins: [],
};
export default config;