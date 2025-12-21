/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // use data-theme attribute for dark mode
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        // add other directories if needed
    ],
    theme: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/theme'), // enables @theme inline support
    ],
};
