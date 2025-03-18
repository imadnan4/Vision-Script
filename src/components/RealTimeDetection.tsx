import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Download, Play, Pause, RefreshCw, Lock, Unlock, FileText, FileSpreadsheet, FileEdit, CreditCard, Eye, EyeOff, Check } from 'lucide-react';
import axios from 'axios';
import LanguageSelector from './LanguageSelector';

interface Props {
  onBack: () => void;
}

interface Detection {
  text: string;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  status: string;
}

const RealTimeDetection: React.FC<Props> = ({ onBack }) => {
  const webcamRef = useRef<Webcam>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [captureInterval, setCaptureInterval] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<'easyocr' | 'pytesseract'>('easyocr');
  const [isBoxesLocked, setIsBoxesLocked] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [capturedImageData, setCapturedImageData] = useState<string | null>(null);
  const [lastDetections, setLastDetections] = useState<Detection[]>([]);
  const [showCaptureConfirmation, setShowCaptureConfirmation] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const handleStartCapture = useCallback(() => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    const interval = setInterval(() => {
      captureFrame();
    }, 1000); // Capture frame every second
    
    setCaptureInterval(interval);
  }, [isCapturing]);

  const handleStopCapture = useCallback(() => {
    if (captureInterval) {
      clearInterval(captureInterval);
      setCaptureInterval(null);
    }
    setIsCapturing(false);
  }, [captureInterval]);

  const captureFrame = useCallback(async () => {
    if (!webcamRef.current || isLoading) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsLoading(true);
    
    // Remove the data:image/jpeg;base64, prefix
    const base64Data = imageSrc.split(',')[1];

    try {
      const response = await axios.post('http://localhost:5000/camera_feed', {
        image: base64Data,
        model: selectedModel,
        language: selectedLanguage
      });
      
      // Store the new detections
      const newDetections = response.data.detections || [];
      
      // If boxes are locked, keep the last saved detections
      if (!isBoxesLocked) {
        setDetections(newDetections);
        setLastDetections(newDetections);
      }
    } catch (error) {
      console.error('Error processing frame:', error);
    }
    
    setIsLoading(false);
  }, [isLoading, selectedModel, isBoxesLocked, selectedLanguage]);

  // Effect to handle when lock/unlock boxes are toggled
  useEffect(() => {
    if (!isBoxesLocked) {
      // When unlocking, update with the most recent detections
      setDetections(lastDetections);
    }
  }, [isBoxesLocked, lastDetections]);

  // Process an image for text detection
  const processImageForDetection = useCallback(async (imageData: string) => {
    setIsLoading(true);
    
    try {
      // Extract the base64 data
      const base64Data = imageData.split(',')[1];
      
      const response = await axios.post('http://localhost:5000/camera_feed', {
        image: base64Data,
        model: selectedModel,
        language: selectedLanguage
      });
      
      // Update detections from the processed image
      const newDetections = response.data.detections || [];
      setDetections(newDetections);
      setLastDetections(newDetections);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedModel, selectedLanguage]);

  // Capture and process a still frame
  const captureStillFrame = useCallback(() => {
    if (!webcamRef.current) return;
    
    // Get the screenshot
    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return;
    
    // Store the image data
    setCapturedImageData(screenshot);
    
    // Show capture confirmation
    setShowCaptureConfirmation(true);
    setTimeout(() => {
      setShowCaptureConfirmation(false);
    }, 2000);
    
    // Process the captured image
    processImageForDetection(screenshot);
    
    return screenshot;
  }, [processImageForDetection]);

  const toggleBoundaries = useCallback(() => {
    setShowBoundaries(prev => !prev);
  }, []);

  const toggleDownloadOptions = useCallback(() => {
    setShowDownloadOptions(prev => !prev);
  }, []);

  const downloadFormat = async (format: 'txt' | 'docx' | 'excel' | 'idcard') => {
    if (detections.length === 0) return;
    
    setIsDownloading(true);
    try {
      if (format === 'idcard') {
        // For ID card, we need to capture a still frame first if we don't have one
        const imageData = capturedImageData || captureStillFrame();
        if (!imageData) {
          console.error('Failed to capture image for ID card processing');
          setIsDownloading(false);
          return;
        }
        
        // Convert base64 to blob
        const base64Data = imageData.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        const blob = new Blob(byteArrays, {type: 'image/jpeg'});
        const imageFile = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('language', selectedLanguage);
        
        const response = await axios.post(
          'http://localhost:5000/extract_id_data',
          formData,
          {
            responseType: 'blob',
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'id_card_data.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else if (format === 'txt') {
        // Direct download as text file
        const textContent = detections.map(d => d.text).join('\n');
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'detected_text.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Server-side format conversion for docx and excel
        const textContent = detections.map(d => d.text).join('\n');
        const formData = new FormData();
        formData.append('format', format);
        formData.append('text_data', textContent);
        
        const response = await axios.post(
          'http://localhost:5000/download_format',
          formData,
          {
            responseType: 'blob',
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const extension = format === 'excel' ? 'xlsx' : format;
        const filename = 'detected_text';
        link.setAttribute('download', `${filename}.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
    
    setIsDownloading(false);
  };

  const downloadFormats = [
    { format: 'txt', icon: FileText, label: 'Plain Text', description: 'Simple text file (.txt)' },
    { format: 'docx', icon: FileEdit, label: 'Word Document', description: 'Microsoft Word format (.docx)' },
    { format: 'excel', icon: FileSpreadsheet, label: 'Excel Spreadsheet', description: 'Excel spreadsheet (.xlsx)' },
    { format: 'idcard', icon: CreditCard, label: 'ID Card Data', description: 'Extract ID card information (.xlsx)' }
  ];

  // Reset on component unmount
  useEffect(() => {
    return () => {
      if (captureInterval) {
        clearInterval(captureInterval);
      }
    };
  }, [captureInterval]);

  return (
    <div className="min-h-screen p-4 bg-black">
      <div className="flex justify-between items-center mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-white flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm transition-colors"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>

        <div className="flex items-center gap-4">
          <LanguageSelector 
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
          
          <motion.div 
            className="flex items-center gap-3 bg-white/5 p-2 rounded-lg backdrop-blur-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-sm text-white/80">EasyOCR</span>
            <motion.div
              className={`relative w-12 h-6 rounded-full p-1 cursor-pointer ${
                selectedModel === 'pytesseract' ? 'bg-blue-500' : 'bg-gray-600'
              }`}
              onClick={() => setSelectedModel(prev => 
                prev === 'easyocr' ? 'pytesseract' : 'easyocr'
              )}
            >
              <motion.div
                className="absolute w-4 h-4 bg-white rounded-full shadow-md"
                layout
                transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                style={{ left: selectedModel === 'easyocr' ? '4px' : '28px' }}
              />
            </motion.div>
            <span className="text-sm text-white/80">Pytesseract</span>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-white"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-4">Real-Time Text Detection</h2>
            <p className="text-gray-400">Point your camera at text to detect it in real-time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="relative overflow-hidden rounded-xl aspect-video bg-black">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
              />
              
              {/* Capture preview overlay */}
              {capturedImageData && (
                <div className="absolute top-4 right-4 w-32 h-24 rounded overflow-hidden border-2 border-white shadow-lg">
                  <img 
                    src={capturedImageData} 
                    alt="Captured frame" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/30"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw className="w-10 h-10 text-white" />
                    </motion.div>
                  </motion.div>
                )}
                
                {showCaptureConfirmation && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white py-2 px-4 rounded-full flex items-center gap-2 shadow-lg"
                  >
                    <Check className="w-5 h-5" />
                    <span>Frame captured!</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {detections.map((detection, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`absolute ${showBoundaries ? 'border-2 border-green-500' : ''} rounded`}
                  style={{
                    left: `${detection.bbox.x}px`,
                    top: `${detection.bbox.y}px`,
                    width: `${detection.bbox.width}px`,
                    height: `${detection.bbox.height}px`,
                  }}
                >
                  {showBoundaries && (
                    <motion.div 
                      className="absolute -top-7 left-0 px-2 py-1 text-xs font-mono bg-green-500 text-black rounded"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {detection.text}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-4 flex-wrap"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                isCapturing
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-white hover:bg-gray-100 text-black'
              }`}
              onClick={isCapturing ? handleStopCapture : handleStartCapture}
            >
              {isCapturing ? (
                <>
                  <Pause className="w-5 h-5" />
                  Stop Capture
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Capture
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                isBoxesLocked
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              onClick={() => setIsBoxesLocked(!isBoxesLocked)}
            >
              {isBoxesLocked ? (
                <>
                  <Lock className="w-5 h-5" />
                  Locked
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5" />
                  Lock Boxes
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                showBoundaries
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              onClick={toggleBoundaries}
            >
              {showBoundaries ? (
                <>
                  <Eye className="w-5 h-5" />
                  Boundaries On
                </>
              ) : (
                <>
                  <EyeOff className="w-5 h-5" />
                  Boundaries Off
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              onClick={captureStillFrame}
            >
              <Camera className="w-5 h-5" />
              Capture Frame
            </motion.button>
          </motion.div>

          {detections.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <h3 className="text-xl font-semibold mb-4">Detected Text:</h3>
              <div className="bg-zinc-800/50 border border-white/10 rounded-lg p-4 max-h-60 overflow-y-auto mb-8">
                <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                  {detections.map(d => d.text).join('\n')}
                </pre>
              </div>
              
              <div className="flex flex-col items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors mb-6"
                  onClick={toggleDownloadOptions}
                >
                  <Download className="w-5 h-5" />
                  {showDownloadOptions ? "Hide Download Options" : "Download Detected Text"}
                </motion.button>

                <AnimatePresence>
                  {showDownloadOptions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full bg-white/5 rounded-lg p-6 overflow-hidden"
                    >
                      <h4 className="text-lg font-semibold mb-4 text-center">Select Download Format</h4>
                      <div className="flex flex-col gap-3">
                        {downloadFormats.map(({ format, icon: Icon, label, description }) => (
                          <motion.button
                            key={format}
                            whileHover={{ 
                              backgroundColor: 'rgba(255,255,255,0.15)'
                            }}
                            whileTap={{ scale: 0.98 }}
                            className="relative overflow-hidden bg-white/10 p-4 rounded-lg flex items-center gap-4 hover:bg-white/20 transition-all duration-300 text-left"
                            onClick={() => downloadFormat(format as 'txt' | 'docx' | 'excel' | 'idcard')}
                            disabled={isDownloading}
                          >
                            <div className="flex-shrink-0 w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-grow">
                              <h5 className="font-semibold text-white">{label}</h5>
                              <p className="text-sm text-gray-400">{description}</p>
                            </div>
                            {isDownloading && (
                              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RealTimeDetection;