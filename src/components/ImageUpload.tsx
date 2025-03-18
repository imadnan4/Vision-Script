import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, FileText, FileSpreadsheet, FileEdit, CreditCard } from 'lucide-react';
import axios from 'axios';
import LanguageSelector from './LanguageSelector';

interface Props {
  onBack: () => void;
}

const ImageUpload: React.FC<Props> = ({ onBack }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'easyocr' | 'pytesseract'>('easyocr');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('image', selectedImage);
    formData.append('model', selectedModel);
    formData.append('language', selectedLanguage);

    try {
      const response = await axios.post('http://localhost:5000/upload_image', formData);
      setRecognizedText(response.data.recognized_text);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    setIsProcessing(false);
  };

  const downloadFormat = async (format: 'txt' | 'docx' | 'excel' | 'idcard') => {
    if (!recognizedText) return;

    setIsDownloading(true);
    try {
      const formData = new FormData();
      
      if (format === 'idcard') {
        if (selectedImage) {
          formData.append('image', selectedImage);
          formData.append('language', selectedLanguage);
        }
      } else {
        formData.append('format', format);
        formData.append('text_data', recognizedText);
      }

      const endpoint = format === 'idcard' 
        ? 'http://localhost:5000/extract_id_data' 
        : 'http://localhost:5000/download_format';

      const response = await axios.post(
        endpoint,
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
      const extension = format === 'excel' ? 'xlsx' : format === 'idcard' ? 'xlsx' : format;
      const filename = format === 'idcard' ? 'id_card_data' : 'extracted_text';
      link.setAttribute('download', `${filename}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
    setIsDownloading(false);
  };

  const downloadFormats = [
    { format: 'txt', icon: FileText, label: 'Plain Text' },
    { format: 'docx', icon: FileEdit, label: 'Word Document' },
    { format: 'excel', icon: FileSpreadsheet, label: 'Excel Spreadsheet' },
    { format: 'idcard', icon: CreditCard, label: 'ID Card Data' }
  ];

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
            <h2 className="text-3xl font-bold mb-4">Upload Image</h2>
            <p className="text-gray-400">Upload an image to extract text</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <label
              className={`block w-full aspect-video rounded-xl border-2 border-dashed ${
                isDragging ? 'border-white scale-105' : 'border-white/30'
              } hover:border-white/50 transition-all duration-300 cursor-pointer overflow-hidden`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />
              <div className="h-full flex flex-col items-center justify-center">
                {previewUrl ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-full rounded-lg"
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <Upload className="w-16 h-16 mb-4 mx-auto text-white/60" />
                    <p className="text-white/60">Drag and drop or click to upload</p>
                  </motion.div>
                )}
              </div>
            </label>
          </motion.div>

          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                onClick={uploadImage}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <motion.div 
                    className="flex items-center gap-2"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    Processing...
                  </motion.div>
                ) : (
                  'Extract Text'
                )}
              </motion.button>
            </motion.div>
          )}

          {recognizedText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <h3 className="text-xl font-semibold mb-4">Extracted Text:</h3>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 p-6 rounded-lg mb-8 font-mono text-gray-300"
              >
                {recognizedText}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 p-6 rounded-lg"
              >
                <h4 className="text-lg font-semibold mb-4 text-center">Download Options</h4>
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
                      onClick={() => downloadFormat(format as 'txt' | 'docx' | 'excel' | 'idcard')}
                      disabled={isDownloading}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <Icon className="w-8 h-8 text-white/80 group-hover:text-white transition-colors duration-300" />
                      <span className="font-medium text-sm text-center">{label}</span>
                      {isDownloading && (
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
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ImageUpload;