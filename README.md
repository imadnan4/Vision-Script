# Vision-Script

A cutting-edge OCR (Optical Character Recognition) solution built with React, TypeScript, and Python, featuring a modern tech stack and intelligent document processing capabilities. Transform your physical documents into digital format with ease and precision.

## 🌟 Key Features

### 📸 Smart Document Capture
- Drag-and-drop file upload support
- Real-time camera-based document scanning
- Intelligent frame capture and processing
- Support for multiple image formats (JPG, PNG, BMP)
- Advanced image preprocessing for optimal results

### 🔍 Powerful OCR Processing
- High-accuracy text extraction using Tesseract OCR
- Smart document layout analysis
- Automatic document deskewing and orientation correction
- Noise reduction and image enhancement
- Confidence-based text filtering

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

## 📁 Project Structure

```
vision-script/
├── frontend/         # React + TypeScript frontend
│   ├── components/   # Reusable UI components
│   └── styles/       # Tailwind CSS styling
├── backend/         # Python Flask backend
│   ├── ocr/         # OCR processing logic
│   └── api/         # REST API endpoints
├── src/            # Core application source
├── docs/           # Documentation
├── env/            # Environment configuration
└── node_modules/   # Dependencies
```

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone git@github.com:imadnan4/Vision-Script.git
   ```

2. Install dependencies:
   ```bash
   npm install
   cd backend
   pip install -r requirements.txt
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

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
- OpenCV for image processing
- python-docx for Word document generation
- openpyxl for Excel file handling

## 🔜 Upcoming Features
- Multi-language support
- PDF document processing
- Cloud storage integration
- Machine learning-based text correction
- Collaborative editing features
- User management system
- Advanced formatting options

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

- Adnan
- GitHub: [@imadnan4](https://github.com/imadnan4)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page. 