/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                game: {
                    dark: 'var(--bg-core)', // Dynamic Navy/Black/White
                    red: 'var(--primary)',  // Dynamic Red/Gold/Blue
                    yellow: 'var(--secondary)', // Dynamic Yellow/White/Navy
                    white: 'var(--text-main)', // Dynamic Text
                    gray: 'var(--text-dim)',
                    surface: 'var(--surface)',
                    border: 'var(--border)',
                    input: 'var(--bg-input)'
                },
                ribbit: {
                    dark: '#0D0D0D', // Cinematic Black
                    white: '#FFFFFF',
                    gray: '#9CA3AF',
                    purple: '#7B4FF1', // Neon Purple Accent
                    teal: '#00E0B8'    // Teal Accent
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'], // Tech feel
            },
        },
    },
    plugins: [],
}
