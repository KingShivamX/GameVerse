import React, { createContext, useContext, useState, useLayoutEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const THEMES = {
    CYBER: {
        id: 'cyber',
        name: 'CYBER',
        colors: {
            '--bg-core': '#0F1923',      // Valorant Navy
            '--bg-dark': '#0D0D0D',      // Deep Black
            '--primary': '#FF4655',      // Valorant Red
            '--secondary': '#FCE300',    // Cyber Yellow
            '--text-main': '#FFFFFF',
            '--text-dim': '#9CA3AF',
            '--border': 'rgba(255, 255, 255, 0.1)',
            '--surface': 'rgba(15, 25, 35, 0.8)',
            '--hud-bg': 'rgba(15, 25, 35, 0.8)',
            '--bg-input': 'rgba(0, 0, 0, 0.4)'
        }
    },
    MIDAS: {
        id: 'midas',
        name: 'MIDAS',
        colors: {
            '--bg-core': '#050505',      // Void Black
            '--bg-dark': '#000000',      // Pure Black
            '--primary': '#FFD700',      // Pure Gold
            '--secondary': '#FBF6E5',    // Cream/White Gold
            '--text-main': '#FFF8E1',    // Light Gold Text
            '--text-dim': '#8A7E57',     // Antique Gold
            '--border': 'rgba(255, 215, 0, 0.2)',
            '--surface': 'rgba(10, 10, 10, 0.9)',
            '--hud-bg': 'rgba(5, 5, 5, 0.9)',
            '--bg-input': 'rgba(0, 0, 0, 0.5)'
        }
    },
    OLYMPUS: {
        id: 'olympus',
        name: 'OLYMPUS',
        colors: {
            '--bg-core': '#F5F7FA',      // Bright White/Grey
            '--bg-dark': '#FFFFFF',      // Pure White
            '--primary': '#2563EB',      // Tech Blue or '#000000' for Stark contrast. Let's go Electric Blue.
            '--secondary': '#0F172A',    // Navy Slate (Contrast)
            '--text-main': '#0F172A',    // Dark Slate
            '--text-dim': '#64748B',     // Slate Grey
            '--border': 'rgba(0, 0, 0, 0.1)',
            '--surface': 'rgba(255, 255, 255, 0.9)',
            '--hud-bg': 'rgba(255, 255, 255, 0.95)',
            '--bg-input': 'rgba(0, 0, 0, 0.05)'
        }
    }
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(THEMES.CYBER);

    // Apply CSS Variables
    useLayoutEffect(() => {
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
    }, [theme]);

    const cycleTheme = () => {
        const themeList = Object.values(THEMES);
        const currentIndex = themeList.findIndex(t => t.id === theme.id);
        const nextTheme = themeList[(currentIndex + 1) % themeList.length];
        setTheme(nextTheme);
    };

    const setSpecificTheme = (themeId) => {
        const found = Object.values(THEMES).find(t => t.id === themeId.toLowerCase());
        if (found) setTheme(found);
    };

    return (
        <ThemeContext.Provider value={{ theme, cycleTheme, setSpecificTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
