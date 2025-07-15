import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, FileText } from 'lucide-react';
import RealTimeDetection from './components/RealTimeDetection';
import ImageUpload from './components/ImageUpload';
import TextSummarizer from './components/TextSummarizer';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [mode, setMode] = useState<'home' | 'realtime' | 'upload' | 'summarizer'>('home');
  const [summarizerText, setSummarizerText] = useState<string>('');

  const handleSummarize = (text: string) => {
    setSummarizerText(text);
    setMode('summarizer');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen transition-theme duration-300 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-zinc-900 dark:to-black smooth-scroll">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]" />
      <div className="absolute inset-0 bg-white/30 dark:bg-black/50" />

      {/* Theme Toggle - Conditional Position */}
      {mode === 'home' && (
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle variant="icon" size="md" />
        </div>
      )}
      
      <AnimatePresence mode="wait">
        {mode === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative container mx-auto px-4 py-16"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-2xl mx-auto text-center text-gray-900 dark:text-white"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                className="mb-12"
              >
                <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent">
                  VisionScript
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Extract text from images, use real-time camera detection, and create intelligent summaries
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.button
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(59, 130, 246, 0.15)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-black border border-gray-200 dark:border-white/10 rounded-xl p-8 text-center transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500/50"
                  onClick={() => setMode('realtime')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <Camera className="w-16 h-16 mx-auto mb-6 text-gray-600 dark:text-white/80 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                  <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Real-Time Detection</h2>
                  <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">Use your camera for instant text detection</p>
                </motion.button>

                <motion.button
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(16, 185, 129, 0.15)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-black border border-gray-200 dark:border-white/10 rounded-xl p-8 text-center transition-all duration-300 hover:border-green-300 dark:hover:border-green-500/50"
                  onClick={() => setMode('upload')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <Upload className="w-16 h-16 mx-auto mb-6 text-gray-600 dark:text-white/80 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300" />
                  <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Upload Image</h2>
                  <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">Upload an image for text extraction</p>
                </motion.button>

                <motion.button
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(168, 85, 247, 0.15)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-black border border-gray-200 dark:border-white/10 rounded-xl p-8 text-center transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-500/50"
                  onClick={() => setMode('summarizer')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <FileText className="w-16 h-16 mx-auto mb-6 text-gray-600 dark:text-white/80 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300" />
                  <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Text Summarizer</h2>
                  <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">Summarize long texts into key insights</p>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {mode === 'realtime' && (
          <motion.div
            key="realtime"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <RealTimeDetection
              onBack={() => setMode('home')}
              onSummarize={handleSummarize}
            />
          </motion.div>
        )}

        {mode === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <ImageUpload
              onBack={() => setMode('home')}
              onSummarize={handleSummarize}
            />
          </motion.div>
        )}

        {mode === 'summarizer' && (
          <motion.div
            key="summarizer"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <TextSummarizer
              onBack={() => {
                setMode('home');
                setSummarizerText('');
              }}
              initialText={summarizerText}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;