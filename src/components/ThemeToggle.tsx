import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  variant = 'button'
}) => {
  const { theme, toggleTheme } = useTheme();

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'h-8 w-16 p-1',
      icon: 'h-4 w-4',
      text: 'text-xs'
    },
    md: {
      button: 'h-10 w-20 p-1',
      icon: 'h-5 w-5',
      text: 'text-sm'
    },
    lg: {
      button: 'h-12 w-24 p-1.5',
      icon: 'h-6 w-6',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size];

  // Animation variants
  const toggleVariants = {
    light: { x: 0 },
    dark: { x: '100%' }
  };

  const iconVariants = {
    hidden: { opacity: 0, rotate: -180, scale: 0.5 },
    visible: { opacity: 1, rotate: 0, scale: 1 }
  };

  if (variant === 'icon') {
    return (
      <motion.button
        onClick={toggleTheme}
        className={`
          relative inline-flex items-center justify-center
          rounded-lg p-2 transition-all duration-300
          bg-white/10 hover:bg-white/20 dark:bg-black/10 dark:hover:bg-black/20
          border border-white/20 dark:border-white/10
          backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent
          theme-toggle
          ${className}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <motion.div
          key={theme}
          variants={iconVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {theme === 'light' ? (
            <Moon className={`${config.icon} text-gray-700 dark:text-gray-300`} />
          ) : (
            <Sun className={`${config.icon} text-yellow-500`} />
          )}
        </motion.div>
      </motion.button>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Theme Toggle Switch */}
      <motion.button
        onClick={toggleTheme}
        className={`
          relative inline-flex ${config.button} rounded-full
          bg-gray-200 dark:bg-gray-700
          border-2 border-gray-300 dark:border-gray-600
          transition-colors duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
          hover:bg-gray-300 dark:hover:bg-gray-600
          theme-toggle
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Currently in ${theme} mode. Click to switch to ${theme === 'light' ? 'dark' : 'light'} mode.`}
      >
        {/* Toggle Slider */}
        <motion.div
          className={`
            absolute top-0.5 left-0.5 bottom-0.5
            w-1/2 rounded-full
            bg-white dark:bg-gray-800
            shadow-lg
            flex items-center justify-center
          `}
          variants={toggleVariants}
          animate={theme}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <motion.div
            key={theme}
            variants={iconVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {theme === 'light' ? (
              <Sun className={`${config.icon} text-yellow-500`} />
            ) : (
              <Moon className={`${config.icon} text-blue-400`} />
            )}
          </motion.div>
        </motion.div>

        {/* Background Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <Sun className={`${config.icon} text-yellow-400 opacity-50`} />
          <Moon className={`${config.icon} text-blue-400 opacity-50`} />
        </div>
      </motion.button>

      {/* Theme Label (Optional) */}
      <span className={`${config.text} font-medium text-gray-700 dark:text-gray-300 capitalize`}>
        {theme}
      </span>
    </div>
  );
};

export default ThemeToggle;
