import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Theme types
export type Theme = 'light' | 'dark';

// Theme context interface
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isSystemDark: boolean;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Local storage key for theme preference
const THEME_STORAGE_KEY = 'visionscript-theme';

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
}

// Hook to detect system preference
const useSystemTheme = (): boolean => {
  const [isSystemDark, setIsSystemDark] = useState<boolean>(
    () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };

    // Modern browsers only (legacy support removed for Fast Refresh compatibility)
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isSystemDark;
};

// Get initial theme from localStorage or system preference
const getInitialTheme = (isSystemDark: boolean): Theme => {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  
  // Fallback to system preference
  return isSystemDark ? 'dark' : 'light';
};

// Apply theme to document
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;

  // Remove existing theme classes
  root.classList.remove('light', 'dark');

  // Add new theme class
  root.classList.add(theme);

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
  } else {
    // Create meta theme-color if it doesn't exist
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = theme === 'dark' ? '#0f172a' : '#ffffff';
    document.head.appendChild(meta);
  }
};

// Theme Provider Component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const isSystemDark = useSystemTheme();
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme(isSystemDark));

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Save theme to localStorage
  const saveTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  };

  // Set theme function
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Context value
  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
    isSystemDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};


