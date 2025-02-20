import React, { useCallback, useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Copy, Download, FileText, FileSpreadsheet, FileEdit, CreditCard } from 'lucide-react';
import axios from 'axios';

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
}

const RealTimeDetection: React.FC<Props> = ({ onBack }) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedText, setCapturedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'easyocr' | 'pytesseract'>('easyocr');

  // Draw bounding boxes
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showBoundaries) {
      detections.forEach(detection => {
        const { x, y, width, height } = detection.bbox;
        
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = '#00FF00';
        const textWidth = ctx.measureText(detection.text).width;
        ctx.fillRect(x - 2, y - 20, textWidth + 4, 20);

        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.fillText(detection.text, x, y - 5);
      });
    }
  }, [detections, showBoundaries]);

  const processFrame = useCallback(async () => {
    if (isProcessing) return;

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setIsProcessing(true);
    try {
      const response = await axios.post('http://localhost:5000/camera_feed', {
        image: imageSrc.split(',')[1],
        model: selectedModel
      });
      setDetections(response.data.detections || []);
    } catch (error) {
      console.error('Error processing frame:', error);
    }
    setIsProcessing(false);
  }, [isProcessing, selectedModel]);

  const captureImage = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setCapturedImage(imageSrc);
    setIsProcessing(true);
    
    try {
      const response = await axios.post('http://localhost:5000/camera_feed', {
        image: imageSrc.split(',')[1],
        model: selectedModel
      });
      
      const newText = response.data.detections
        .map((detection: Detection) => detection.text)
        .join('\n');
      
      setCapturedText(newText);
    } catch (error) {
      console.error('Error processing captured image:', error);
    }
    
    setIsProcessing(false);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const downloadFormat = async (format: 'txt' | 'docx' | 'excel' | 'idcard') => {
    if (!capturedText || !capturedImage) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      
      if (format === 'idcard') {
        const imageFile = dataURLtoFile(capturedImage, 'capture.jpg');
        formData.append('image', imageFile);
      } else {
        formData.append('format', format);
        formData.append('text_data', capturedText);
      }

      const endpoint = format === 'idcard' 
        ? 'http://localhost:5000/extract_id_data' 
        : 'http://localhost:5000/download_format';

      const response = await axios.post(endpoint, formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': format === 'idcard' ? 'multipart/form-data' : 'application/x-www-form-urlencoded'
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'idcard' ? 'xlsx' : format;
      const filename = format === 'idcard' ? 'id_card_data' : 'captured_text';
      link.setAttribute('download', `${filename}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
    setIsProcessing(false);
  };

  const downloadFormats = [
    { format: 'txt', icon: FileText, label: 'Plain Text' },
    { format: 'docx', icon: FileEdit, label: 'Word Document' },
    { format: 'excel', icon: FileSpreadsheet, label: 'Excel Spreadsheet' },
    { format: 'idcard', icon: CreditCard, label: 'ID Card Data' }
  ];

  useEffect(() => {
    const interval = setInterval(processFrame, 2000);
    return () => clearInterval(interval);
  }, [processFrame]);

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

        <motion.div 
          className="flex items-center gap-3 bg-white/5 p-2 rounded-lg backdrop-blur-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
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

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        >
          <div className="relative">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-3 text-white">
              <Camera className="w-6 h-6" />
              <span className="font-medium">Real-time detection active</span>
              <div className="flex ml-auto gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  onClick={captureImage}
                >
                  <Download className="w-5 h-5" />
                </motion.button>
                {isProcessing && (
                  <motion.div 
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Detections List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-8 bg-black rounded-xl border border-white/10 text-white"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold">Detected Text:</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              onClick={() => copyText(detections.map(d => d.text).join('\n'))}
              disabled={detections.length === 0}
            >
              <Copy className="w-5 h-5" />
            </motion.button>
          </div>
          
  {detections.length > 0 ? (
    <ul className="space-y-3">
      {detections.map((detection, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors"
        >
          {selectedModel === 'pytesseract' ? (
            <pre>{detection.text}</pre>
          ) : (
            detection.text
          )}
        </motion.li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-400">No text detected yet...</p>
  )}
        </motion.div>

        {/* Captured Content */}
        {capturedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-8 bg-black rounded-xl border border-white/10 text-white"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold">Captured Content:</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                onClick={() => copyText(capturedText)}
                disabled={!capturedText}
              >
                <Copy className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="space-y-4">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full rounded-lg"
              />
              <div className="bg-white/5 p-4 rounded-lg">
                {capturedText || "Processing captured image..."}
              </div>

              {capturedText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 p-6 rounded-lg mt-4"
                >
                  <h4 className="text-lg font-semibold mb-4 text-center">Export Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {downloadFormats.map(({ format, icon: Icon, label }) => (
                      <motion.button
                        key={format}
                        whileHover={{ 
                          scale: 1.05,
                          backgroundColor: 'rgba(255,255,255,0.15)'
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="relative overflow-hidden bg-white/10 p-6 rounded-lg flex flex-col items-center gap-3 hover:bg-white/20 transition-all duration-300 group"
                        onClick={() => downloadFormat(format as any)}
                        disabled={isProcessing}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <Icon className="w-8 h-8 text-white/80 group-hover:text-white transition-colors duration-300" />
                        <span className="font-medium text-sm text-center">{label}</span>
                        {isProcessing && (
                          <motion.div 
                            className="absolute inset-0 bg-black/50 flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RealTimeDetection;