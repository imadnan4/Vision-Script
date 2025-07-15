import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileText, Zap, BarChart3, Download, Upload, Copy, Check, Loader2 } from 'lucide-react';
import axios from 'axios';
import ThemeToggle from './ThemeToggle';

interface Props {
  onBack: () => void;
  initialText?: string;
}

interface SummaryOptions {
  algorithms: Record<string, string>;
  smart_options: Record<string, string>;
  types: Record<string, string>;
  lengths: Record<string, string>;
}

interface OpenRouterStatus {
  minute_requests: number;
  minute_limit: number;
  daily_requests: number;
  daily_limit: number;
  is_rate_limited: boolean;
  cooldown_seconds: number;
}

interface SummaryResult {
  original_text: string;
  summary: string;
  algorithm: string;
  smart_option: string;
  type: string;
  length: string;
  statistics: {
    original_word_count: number;
    summary_word_count: number;
    reduction_percentage: number;
    original_reading_time_minutes: number;
    summary_reading_time_minutes: number;
  };
  status: string;
}

const TextSummarizer: React.FC<Props> = ({ onBack, initialText = '' }) => {
  const [inputText, setInputText] = useState<string>(initialText);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [options, setOptions] = useState<SummaryOptions | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('textrank');
  const [selectedSmartOption, setSelectedSmartOption] = useState('local_smart');
  const [selectedType, setSelectedType] = useState('paragraph');
  const [selectedLength, setSelectedLength] = useState('medium');
  const [copied, setCopied] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [orStatus, setOrStatus] = useState<OpenRouterStatus | null>(null);
  const [showRateLimit, setShowRateLimit] = useState(false);
  const [orError, setOrError] = useState<string>('');
  const [showOrSetup, setShowOrSetup] = useState(false);

  useEffect(() => {
    fetchSummarizationOptions();
    fetchOpenRouterStatus();
  }, []);

  const fetchSummarizationOptions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/summarization_options');
      setOptions(response.data);
    } catch (error) {
      console.error('Error fetching summarization options:', error);
    }
  };

  const fetchOpenRouterStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/openrouter_status');
      setOrStatus(response.data);
    } catch (error) {
      console.error('Error fetching OpenRouter status:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'text/plain') {
      setUploadStatus('Reading text file...');
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputText(content);
        setUploadStatus(`Loaded ${content.split(' ').length} words from ${file.name}`);
        setTimeout(() => setUploadStatus(''), 3000);
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
      // Handle PDF upload
      setIsProcessing(true);
      setUploadStatus('Extracting text from PDF...');
      try {
        const formData = new FormData();
        formData.append('pdf_file', file);

        const response = await axios.post('http://localhost:5000/extract_pdf_text', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        setInputText(response.data.text);
        setUploadStatus(`Extracted ${response.data.word_count} words from ${response.data.filename}`);
        setTimeout(() => setUploadStatus(''), 3000);
      } catch (error) {
        console.error('Error extracting PDF text:', error);
        setUploadStatus('Error extracting text from PDF');
        setTimeout(() => setUploadStatus(''), 3000);
      }
      setIsProcessing(false);
    } else {
      setUploadStatus('Please upload a TXT or PDF file.');
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  const summarizeText = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    try {
      const response = await axios.post('http://localhost:5000/summarize_text', {
        text: inputText,
        algorithm: selectedAlgorithm,
        smart_option: selectedSmartOption,
        type: selectedType,
        length: selectedLength
      });

      setSummaryResult(response.data);
      setShowComparison(true);

      // Refresh OpenRouter status after request
      if (selectedSmartOption === 'openrouter') {
        setTimeout(fetchOpenRouterStatus, 1000);
      }
    } catch (error: any) {
      console.error('Error summarizing text:', error);
      if (error.response?.data?.fallback_available) {
        // Show rate limit info and offer fallback
        setShowRateLimit(true);
        fetchOpenRouterStatus();
      }

      // Handle OpenRouter authentication errors
      if (error.response?.data?.error?.includes('API key not found') ||
          error.response?.data?.error?.includes('Invalid API key')) {
        setOrError(error.response.data.error);
        setShowOrSetup(true);
      }
    }
    setIsProcessing(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const downloadFormat = async (format: 'txt' | 'docx' | 'excel') => {
    if (!summaryResult) return;

    setIsDownloading(true);
    try {
      const formData = new FormData();
      formData.append('format', format);
      formData.append('text_data', summaryResult.summary);
      formData.append('original_text', summaryResult.original_text);
      formData.append('is_summary', 'true');
      
      const statsText = `
Word Count Reduction: ${summaryResult.statistics.reduction_percentage}%
Original: ${summaryResult.statistics.original_word_count} words (${summaryResult.statistics.original_reading_time_minutes} min read)
Summary: ${summaryResult.statistics.summary_word_count} words (${summaryResult.statistics.summary_reading_time_minutes} min read)
Algorithm: ${options?.algorithms[summaryResult.algorithm] || summaryResult.algorithm}
Type: ${options?.types[summaryResult.type] || summaryResult.type}
Length: ${options?.lengths[summaryResult.length] || summaryResult.length}
      `.trim();
      
      formData.append('statistics', statsText);

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
      link.setAttribute('download', `summary.${extension}`);
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
    { format: 'docx', icon: FileText, label: 'Word Document' },
    { format: 'excel', icon: BarChart3, label: 'Excel Report' }
  ];

  return (
    <div className="min-h-screen p-4 transition-theme duration-300 bg-gray-50 dark:bg-black">
      <div className="flex justify-between items-center mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-gray-900 dark:text-white flex items-center gap-2 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 px-6 py-3 rounded-lg backdrop-blur-sm transition-colors border border-gray-200 dark:border-white/10"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>

        <ThemeToggle variant="icon" size="md" />
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900/80 dark:to-black/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/10 p-8 text-gray-900 dark:text-white shadow-lg"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent">
              Text Summarizer
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Transform long texts into concise, meaningful summaries</p>
          </motion.div>

          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Input Text</h3>
              <label className="flex items-center gap-2 bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 px-4 py-2 rounded-lg cursor-pointer transition-colors border border-gray-200 dark:border-white/10">
                <Upload className="w-4 h-4 text-gray-600 dark:text-white/80" />
                <span className="text-sm text-gray-700 dark:text-white/80">Upload TXT/PDF File</span>
                <input
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here or upload a TXT/PDF file..."
              className="w-full h-64 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg p-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-white/30 transition-colors"
            />

            <div className="flex justify-between items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{inputText.split(' ').filter(word => word.length > 0).length} words</span>
              <span>~{Math.ceil(inputText.split(' ').filter(word => word.length > 0).length / 200)} min read</span>
            </div>

            {uploadStatus && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg px-3 py-2"
              >
                {uploadStatus}
              </motion.div>
            )}
          </motion.div>

          {/* Controls Section */}
          {options && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Summarization Options</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Smart Options */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Smart Summarization</label>
                  <select
                    value={selectedSmartOption}
                    onChange={(e) => setSelectedSmartOption(e.target.value)}
                    className="w-full bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-white/40 transition-colors"
                  >
                    {Object.entries(options.smart_options).map(([key, label]) => (
                      <option key={key} value={key} className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-white">
                        {label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {selectedSmartOption === 'local_smart' && "Uses advanced local algorithms for intelligent summarization"}
                    {selectedSmartOption === 'openrouter' && "Uses AI-powered Mistral model via OpenRouter (requires API key)"}
                  </p>

                  {/* OpenRouter Status */}
                  {selectedSmartOption === 'openrouter' && orStatus && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded text-xs">
                      <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>Per minute: {orStatus.minute_requests}/{orStatus.minute_limit}</span>
                        <span>Daily: {orStatus.daily_requests}/{orStatus.daily_limit}</span>
                      </div>
                      {orStatus.is_rate_limited && (
                        <div className="text-red-600 dark:text-red-400 mt-1">
                          Rate limited! Cooldown: {Math.floor(orStatus.cooldown_seconds / 60)}m {orStatus.cooldown_seconds % 60}s
                        </div>
                      )}
                    </div>
                  )}

                  {/* OpenRouter Setup Guide */}
                  {selectedSmartOption === 'openrouter' && (showOrSetup || orError) && (
                    <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded text-xs">
                      <div className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">🔑 OpenRouter API Setup Required</div>
                      <div className="text-gray-700 dark:text-gray-300 space-y-1">
                        <p>To use OpenRouter Mistral summarization, you need a free API key:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Go to <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">openrouter.ai/keys</a></li>
                          <li>Create a new API key (free tier available)</li>
                          <li>Add to backend/.env file: <code className="bg-gray-200 dark:bg-black/30 px-1 rounded text-gray-800 dark:text-gray-200">OPENROUTER_API_KEY=your_key_here</code></li>
                          <li>Restart the backend server</li>
                        </ol>
                        <p className="text-yellow-700 dark:text-yellow-300 mt-2">💡 Or use "Smart Summary (Local)" for offline summarization!</p>
                      </div>
                      <button
                        onClick={() => {setShowOrSetup(false); setOrError(''); setSelectedSmartOption('local_smart');}}
                        className="mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-500/20 hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded text-blue-700 dark:text-blue-300 text-xs transition-colors"
                      >
                        Switch to Local Smart Summary
                      </button>
                    </div>
                  )}
                </div>

                {/* Algorithm Selection (for non-smart options) */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Algorithm (Local)</label>
                  <select
                    value={selectedAlgorithm}
                    onChange={(e) => setSelectedAlgorithm(e.target.value)}
                    className="w-full bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-white/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedSmartOption === 'openrouter'}
                  >
                    {Object.entries(options.algorithms).map(([key, label]) => (
                      <option key={key} value={key} className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-white">
                        {label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {selectedSmartOption === 'openrouter' ? "Disabled when using OpenRouter AI" :
                     selectedAlgorithm === 'textrank' ? "Uses graph-based ranking algorithm" :
                     selectedAlgorithm === 'abstractive' ? "Creates new sentences that capture the essence" :
                     selectedAlgorithm === 'lsa' ? "Uses semantic analysis for topic extraction" :
                     selectedAlgorithm === 'luhn' ? "Focuses on word frequency and clustering" : ""}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Format</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-white/40 transition-colors"
                  >
                    {Object.entries(options.types).map(([key, label]) => (
                      <option key={key} value={key} className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-white">
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Length Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Length</label>
                  <select
                    value={selectedLength}
                    onChange={(e) => setSelectedLength(e.target.value)}
                    className="w-full bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-white/40 transition-colors"
                  >
                    {Object.entries(options.lengths).map(([key, label]) => (
                      <option key={key} value={key} className="bg-white dark:bg-zinc-800 text-gray-900 dark:text-white">
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 30px rgba(255,255,255,0.1)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black px-8 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={summarizeText}
                  disabled={isProcessing || !inputText.trim()}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="relative flex items-center gap-2">
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-white dark:text-black" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Summarize Text
                      </>
                    )}
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Results Section */}
          <AnimatePresence>
            {summaryResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Summary Results</h3>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        showComparison
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20'
                      }`}
                      onClick={() => setShowComparison(!showComparison)}
                    >
                      {showComparison ? 'Hide Comparison' : 'Show Comparison'}
                    </motion.button>
                  </div>
                </div>

                {/* Statistics */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/5 rounded-lg p-4 mb-6"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        {summaryResult.statistics.reduction_percentage}%
                      </div>
                      <div className="text-sm text-gray-400">Reduction</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">
                        {summaryResult.statistics.summary_word_count}
                      </div>
                      <div className="text-sm text-gray-400">Words</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        {summaryResult.statistics.summary_reading_time_minutes}m
                      </div>
                      <div className="text-sm text-gray-400">Read Time</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {options?.algorithms[summaryResult.algorithm]?.split(' ')[0] || summaryResult.algorithm}
                      </div>
                      <div className="text-sm text-gray-400">Algorithm</div>
                    </div>
                  </div>
                </motion.div>

                {/* Summary Display */}
                <div className={`grid gap-6 ${showComparison ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                  {showComparison && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/5 rounded-lg p-6"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold">Original Text</h4>
                        <span className="text-sm text-gray-400">
                          {summaryResult.statistics.original_word_count} words
                        </span>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {summaryResult.original_text}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: showComparison ? 20 : 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold">Summary</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">
                          {summaryResult.statistics.summary_word_count} words
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                          onClick={() => copyToClipboard(summaryResult.summary)}
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <p className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                        {summaryResult.summary}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Download Options */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 bg-white/5 rounded-lg p-6"
                >
                  <h4 className="text-lg font-semibold mb-4 text-center">Download Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {downloadFormats.map(({ format, icon: Icon, label }) => (
                      <motion.button
                        key={format}
                        whileHover={{
                          scale: 1.05,
                          backgroundColor: 'rgba(255,255,255,0.15)'
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="relative overflow-hidden bg-white/80 dark:bg-white/10 p-6 rounded-lg flex flex-col items-center gap-3 hover:bg-white dark:hover:bg-white/20 transition-all duration-300 group border border-gray-200 dark:border-white/10"
                        onClick={() => downloadFormat(format as 'txt' | 'docx' | 'excel')}
                        disabled={isDownloading}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <Icon className="w-8 h-8 text-gray-600 dark:text-white/80 group-hover:text-blue-600 dark:group-hover:text-white transition-colors duration-300" />
                        <span className="font-medium text-sm text-center text-gray-700 dark:text-white">{label}</span>
                        {isDownloading && (
                          <motion.div
                            className="absolute inset-0 bg-white/90 dark:bg-black/50 flex items-center justify-center backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <Loader2 className="w-6 h-6 text-blue-600 dark:text-white animate-spin" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default TextSummarizer;
