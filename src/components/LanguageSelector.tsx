import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import axios from 'axios';

interface Language {
  code: string;
  name: string;
}

interface Props {
  selectedLanguage: string;
  onLanguageChange: (languageCode: string) => void;
}

const LanguageSelector: React.FC<Props> = ({ selectedLanguage, onLanguageChange }) => {
  const [languages, setLanguages] = useState<Record<string, string>>({
    'en': 'English' // Default language
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/supported_languages');
        setLanguages(response.data.languages);
      } catch (error) {
        console.error('Error fetching languages:', error);
        // If API call fails, at least have a few options
        setLanguages({
          'en': 'English',
          'fr': 'French',
          'es': 'Spanish',
          'de': 'German',
          'zh': 'Chinese'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectLanguage = (code: string) => {
    onLanguageChange(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm transition-colors"
        onClick={handleToggleDropdown}
      >
        <Globe className="w-4 h-4 text-white/80" />
        <span className="text-white/80">
          {isLoading ? 'Loading...' : languages[selectedLanguage] || 'English'}
        </span>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-10 mt-2 w-48 rounded-md bg-zinc-800 shadow-lg ring-1 ring-black ring-opacity-5 max-h-60 overflow-y-auto"
        >
          <div className="py-1">
            {Object.entries(languages).map(([code, name]) => (
              <button
                key={code}
                className={`block px-4 py-2 text-sm w-full text-left ${
                  selectedLanguage === code
                    ? 'bg-zinc-700 text-white'
                    : 'text-gray-300 hover:bg-zinc-700 hover:text-white'
                }`}
                onClick={() => handleSelectLanguage(code)}
              >
                {name}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LanguageSelector; 