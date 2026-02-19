/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#00D4FF', // Neon Cyan
                    50: '#e0fbff',
                    100: '#b3f2ff',
                    200: '#80eaff',
                    300: '#4de1ff',
                    400: '#26d9ff',
                    500: '#00D4FF',
                    600: '#00B4D8', // Darker variant requested
                    700: '#0090ad',
                    800: '#006d82',
                    900: '#004b59',
                    950: '#002633',
                },
                secondary: {
                    DEFAULT: '#121214', // Dark Card Surface
                    50: '#f6f7f9',
                    100: '#eceef2',
                    200: '#dce0e8',
                    300: '#c5cbd6',
                    400: '#a7b0bf',
                    500: '#8b96a8',
                    600: '#6f7a8c',
                    700: '#5a6273',
                    800: '#1a1f3a',
                    900: '#121214',
                    950: '#0a0e27',
                },
                background: {
                    DEFAULT: '#0A0A0C', // Deep Black Background
                },
                accent: {
                    DEFAULT: '#00D4FF',
                    500: '#00D4FF',
                    600: '#00B4D8',
                },
                gray: {
                    100: '#E6E6E6', // Main Text
                    200: '#d1d1d1',
                    300: '#bcbcbc',
                    400: '#969696', // Secondary Text
                    500: '#808080',
                    600: '#666666',
                    700: '#4d4d4d',
                    800: '#333333',
                    900: '#1a1a1a',
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
                'shimmer': 'shimmer 3s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-250% 0' },
                    '100%': { backgroundPosition: '250% 0' },
                }
            }
        },
    },
    plugins: [],
}
