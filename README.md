# VisionScript

A cutting-edge text extraction and summarization solution built with React, TypeScript, and Python, featuring a modern tech stack and intelligent document processing capabilities. Transform your physical documents into digital format with ease and precision.

##  Recent Updates

- **AI Text Summarization** - Added intelligent text summarization with OpenRouter Mistral integration
- **PDF Support** - Upload and process PDF documents for text extraction and summarization
- **Smart Response Cleaning** - AI responses automatically formatted for human readability
- **Multilanguage Support** - Added support for 13+ languages with seamless language switching
- **UI Improvements** - Enhanced user interface for better user experience
- **Backend Optimization** - Improved text detection accuracy and processing speed

##  Key Features

###  Smart Document Capture
- Drag-and-drop file upload support
- Real-time camera-based document scanning
- Intelligent frame capture and processing
- Support for multiple image formats (JPG, PNG, BMP)
- Advanced image preprocessing for optimal results

###  Powerful OCR Processing
- High-accuracy text extraction using Tesseract OCR
- Smart document layout analysis
- Automatic document deskewing and orientation correction
- Noise reduction and image enhancement
- Confidence-based text filtering
- **Multi-language support** for text recognition in 13+ languages

### 📄 Advanced Export Options
- Multiple export formats:
  - Text files (TXT) with UTF-8 encoding
  - Word documents (DOCX) with formatting preservation
  - Excel spreadsheets (XLSX) for tabular data
- Smart paragraph and layout detection
- Header/footer identification
- Table structure recognition

### 🎯 Real-Time Processing
- Live camera feed processing
- Instant text extraction feedback
- Progress indicators and status updates
- Performance optimization for smooth operation
- Frame rate and resolution control

### 🛡️ Robust Error Handling
- Comprehensive input validation
- Detailed error messaging
- Automatic retry mechanisms
- Fallback strategies
- Secure file handling

### 🤖 AI-Powered Text Summarization
- **Smart Summarization Options**:
  - Local Smart Summary - Advanced algorithms for intelligent text condensation
  - AI Summary (OpenRouter Mistral) - High-quality AI-powered summarization
- **Multiple Summary Formats**:
  - Paragraph summaries for natural reading
  - Bullet point summaries for quick scanning
  - Key phrase extraction for topic identification
- **Customizable Length Control**:
  - Short (25%) - Quick overview in 2-3 sentences
  - Medium (50%) - Balanced summary in 3-4 sentences
  - Long (75%) - Detailed summary in 5-7 sentences
- **PDF Support** - Upload and summarize PDF documents directly
- **Rate Limit Management** - Real-time API usage monitoring with cooldown display
- **Clean Output** - AI responses automatically cleaned for human readability

### 🌐 Multi-Language Support
- Support for 13+ languages including:
  - English, French, Spanish, German
  - Italian, Portuguese, Dutch
  - Chinese, Japanese, Korean
  - Russian, Arabic, Hindi
- Language-specific text recognition optimization
- Easy language selection via dropdown interface
- Real-time language switching

## 📁 Project Structure

```
VisionScript/
├── src/             # React + TypeScript frontend
│   ├── components/  # Reusable UI components
│   │   ├── ImageUpload.tsx       # Image upload component
│   │   ├── RealTimeDetection.tsx # Camera-based detection
│   │   ├── LanguageSelector.tsx  # Language selection component
│   │   └── TextSummarizer.tsx    # Text summarization component
│   └── styles/      # Tailwind CSS styling
├── backend/         # Python Flask backend
│   ├── main_test.py # Main application server
│   └── .env         # Environment configuration
├── docs/           # Documentation
└── node_modules/   # Dependencies
```

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone git@github.com:imadnan4/VisionScript.git
   ```

2. Navigate to the project directory:
   ```bash
   cd VisionScript
   ```

3. Install dependencies:
   ```bash
   npm install
   cd backend
   pip install -r requirements.txt
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. (Optional) Set up AI Text Summarization:
   - Get a free API key from [OpenRouter](https://openrouter.ai/keys)
   - Add to `backend/.env` file:
     ```
     OPENROUTER_API_KEY=your_api_key_here
     ```
   - Restart the backend server to enable AI summarization

6. Using the multilanguage feature:
   - Look for the globe icon in the interface
   - Click to open the language dropdown
   - Select your preferred language for OCR processing
   - The system will automatically optimize text recognition for the selected language

7. Using the text summarizer:
   - Upload images/PDFs or use camera to extract text
   - Click "Summarize Text" button on extracted text
   - Or go directly to "Text Summarizer" from the home screen
   - Choose between Local Smart Summary or AI Summary (OpenRouter)
   - Select format (paragraph, bullets, key phrases) and length
   - Export summaries in TXT, DOCX, or Excel format

## 🛠️ Technical Stack

### Frontend
- React 18+ with TypeScript
- Vite for fast development
- Tailwind CSS for modern styling
- Framer Motion for smooth animations
- React Context API for state management

### Backend
- Python Flask for API endpoints
- Tesseract OCR for text extraction
- EasyOCR for multi-language support
- OpenCV for image processing
- python-docx for Word document generation
- PyPDF2 for PDF text extraction
- **Text Summarization Stack**:
  - SUMY library for local extractive summarization
  - NLTK for natural language processing
  - OpenRouter API integration for AI-powered summarization
  - Mistral AI model for high-quality text generation
  - Custom response cleaning algorithms

## 🔜 Upcoming Features
- **Text Translation** - Integrate Google Translate API for multi-language text translation
- **Voice-to-Text** - Add speech recognition for audio file transcription
- **Smart Text Comparison** - Compare multiple documents and highlight differences
- **Text Analytics Dashboard** - Word count, reading time, sentiment analysis, and readability scores
- **Custom Summary Templates** - User-defined summary formats (executive summary, meeting notes, etc.)
- **Batch Processing** - Process multiple images/PDFs in one operation
- **Text Search & Highlight** - Search within extracted text and highlight matches
- **Export to More Formats** - Add support for Markdown, HTML, and plain text exports
- **OCR Confidence Scoring** - Display confidence levels for extracted text with editing suggestions
- **Dark/Light Theme Toggle** - Customizable UI themes for better user experience

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

- Adnan
- GitHub: [@imadnan4](https://github.com/imadnan4)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page. 
