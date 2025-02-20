import cv2
import easyocr
import pytesseract
import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import tempfile
import os
import base64
import xlsxwriter
from PIL import Image, ImageEnhance



app = Flask(__name__)
CORS(app)
reader = easyocr.Reader(['en'])

def extract_text(file_path, model='easyocr'):
    if model == 'pytesseract':
        img = Image.open(file_path)
        return pytesseract.image_to_string(img)
    else:
        results = reader.readtext(file_path)
        return ' '.join([res[1] for res in results])

@app.route('/upload_image', methods=['POST'])
def upload_image():
    file = request.files['image']
    model = request.form.get('model', 'easyocr').lower()
    file_path = os.path.join(tempfile.gettempdir(), file.filename)
    file.save(file_path)
    
    extracted_text = extract_text(file_path, model)
    
    return jsonify({
        "recognized_text": extracted_text
    })

@app.route('/download_format', methods=['POST'])
def download_format():
    chosen_format = request.form.get('format')
    text_data = request.form.get('text_data', '')

    if chosen_format == 'txt':
        tmp_path = os.path.join(tempfile.gettempdir(), "extracted_text.txt")
        with open(tmp_path, 'w') as f:
            f.write(text_data)
        return send_file(tmp_path, as_attachment=True)

    elif chosen_format == 'docx':
        from docx import Document
        doc = Document()
        doc.add_paragraph(text_data)
        tmp_path = os.path.join(tempfile.gettempdir(), "extracted_text.docx")
        doc.save(tmp_path)
        return send_file(tmp_path, as_attachment=True)

    elif chosen_format == 'excel':
        tmp_path = os.path.join(tempfile.gettempdir(), "extracted_text.xlsx")
        workbook = xlsxwriter.Workbook(tmp_path)
        worksheet = workbook.add_worksheet()
        for idx, line in enumerate(text_data.split('\n')):
            worksheet.write(idx, 0, line)
        workbook.close()
        return send_file(tmp_path, as_attachment=True)
    
    else:
        return jsonify({"error": "Invalid format"}), 400

def clean_extracted_text(text):
    keys = [
        "Name", "Father Name", "Gender", "Country of Stay", "Identity Number",
        "Date of Birth", "Date of Issue", "Date of Expiry"
    ]
    extracted_data = {}
    
    for key in keys:
        if key in text:
            try:
                extracted_data[key] = text.split(key)[1].split(keys[keys.index(key) + 1])[0].strip()
            except IndexError:
                extracted_data[key] = text.split(key)[-1].strip()
    
    return extracted_data

@app.route('/extract_id_data', methods=['POST'])
def extract_id_data():
    file = request.files['image']
    file_path = os.path.join(tempfile.gettempdir(), file.filename)
    file.save(file_path)
    
    extracted_text = extract_text(file_path)
    extracted_data = clean_extracted_text(extracted_text)
    
    tmp_path = os.path.join(tempfile.gettempdir(), "id_card_data.xlsx")
    workbook = xlsxwriter.Workbook(tmp_path)
    worksheet = workbook.add_worksheet()
    row = 0
    for key, value in extracted_data.items():
        worksheet.write(row, 0, key)
        worksheet.write(row, 1, value)
        row += 1
    workbook.close()
    
    return send_file(tmp_path, as_attachment=True, download_name="id_card_data.xlsx")

@app.route('/camera_feed', methods=['POST'])
def camera_feed():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400

        model = data.get('model', 'easyocr').lower()
        image_bytes = base64.b64decode(data['image'])
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if model == 'pytesseract':
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Apply thresholding to remove noise
            gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
            
            # Resize image to improve text recognition
            scale_percent = 150  # Increase size by 150%
            width = int(gray.shape[1] * scale_percent / 100)
            height = int(gray.shape[0] * scale_percent / 100)
            gray = cv2.resize(gray, (width, height), interpolation=cv2.INTER_CUBIC)
            
            # Convert back to PIL image for Pytesseract
            img = Image.fromarray(gray)
            
            # Use optimized OCR settings
            extracted_text = pytesseract.image_to_string(img, config='--psm 6 --oem 3')
            
            return jsonify({
                "detections": [{
                    "text": extracted_text,
                    "bbox": {"x": 0, "y": 0, "width": 100, "height": 20},
                    "status": "success"
                }]
            })
        else:
            # Existing EasyOCR implementation
            results = reader.readtext(frame)
            detections = []
            for (bbox, text, prob) in results:
                (tl, tr, br, bl) = bbox
                x = int(tl[0])
                y = int(tl[1])
                width = int(br[0] - tl[0])
                height = int(br[1] - tl[1])
                detections.append({
                    "text": text,
                    "bbox": {"x": x, "y": y, "width": width, "height": height},
                    "status": "success"
                })
            return jsonify({"detections": detections})

    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "error"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
