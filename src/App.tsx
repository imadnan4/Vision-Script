import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload } from 'lucide-react';
import RealTimeDetection from './components/RealTimeDetection';
import ImageUpload from './components/ImageUpload';

function App() {
  const [mode, setMode] = useState<'home' | 'realtime' | 'upload'>('home');

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
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 bg-black/50" />
      
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
              className="max-w-2xl mx-auto text-center text-white"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                className="mb-12"
              >
                <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                  VisionScript
                </h1>
                <p className="text-xl text-gray-400">
                  Extract text from images or use real-time camera detection
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.button
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(255,255,255,0.1)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-xl p-8 text-center transition-all duration-300"
                  onClick={() => setMode('realtime')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <Camera className="w-16 h-16 mx-auto mb-6 text-white/80 group-hover:text-white transition-colors duration-300" />
                  <h2 className="text-2xl font-semibold mb-3">Real-Time Detection</h2>
                  <p className="text-gray-400 group-hover:text-gray-300">Use your camera for instant text detection</p>
                </motion.button>

                <motion.button
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(255,255,255,0.1)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-xl p-8 text-center transition-all duration-300"
                  onClick={() => setMode('upload')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <Upload className="w-16 h-16 mx-auto mb-6 text-white/80 group-hover:text-white transition-colors duration-300" />
                  <h2 className="text-2xl font-semibold mb-3">Upload Image</h2>
                  <p className="text-gray-400 group-hover:text-gray-300">Upload an image for text extraction</p>
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
            <RealTimeDetection onBack={() => setMode('home')} />
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
            <ImageUpload onBack={() => setMode('home')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;