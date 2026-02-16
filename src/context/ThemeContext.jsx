// src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  const [direction, setDirection] = useState('ltr');

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('dir', direction);
    
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
  }, [theme, direction]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const setDirectionMode = (dir) => {
    setDirection(dir);
  };

  const getThemeColors = () => {
    const themes = {
      light: {
        primary: '#007bff',
        secondary: '#6c757d',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#212529',
        textSecondary: '#6c757d',
        border: '#dee2e6',
        shadow: 'rgba(0, 0, 0, 0.1)',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
      },
      dark: {
        primary: '#0d6efd',
        secondary: '#6c757d',
        background: '#121212',
        surface: '#1e1e1e',
        text: '#e9ecef',
        textSecondary: '#adb5bd',
        border: '#495057',
        shadow: 'rgba(0, 0, 0, 0.3)',
        success: '#198754',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#0dcaf0'
      }
    };
    
    return themes[theme];
  };

  const value = {
    theme,
    direction,
    toggleTheme,
    setDirectionMode,
    isDarkMode: theme === 'dark',
    isLightMode: theme === 'light',
    colors: getThemeColors()
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};