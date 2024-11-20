import os
import time
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS
import win32print
import win32api
from PyPDF2 import PdfReader, PdfWriter
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

app = Flask(__name__)
app = Flask(__name__, static_folder='uploads')


# Konfigurasi CORS
CORS(app)

# Konfigurasi file upload
UPLOAD_FOLDER = 'uploads'
TEMP_FOLDER = 'temp'
ALLOWED_EXTENSIONS = {'pdf'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['TEMP_FOLDER'] = TEMP_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size

# Memastikan folder upload dan temp ada
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Menyajikan file statis yang di-upload
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(os.path.join(app.root_path, 'uploads'), filename)


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Menghitung jumlah halaman PDF
        try:
            with open(filepath, 'rb') as f:
                reader = PdfReader(f)
                num_pages = len(reader.pages)

            # Menghitung harga berdasarkan jumlah halaman (Rp 600 per halaman)
            harga = num_pages * 600

            return jsonify({
                "message": "File uploaded successfully",
                "filename": filename,
                "numPages": num_pages,
                "harga": harga,
                "url": f"{request.host_url}uploads/{filename}"  # URL yang dapat diakses
            })
        except Exception as e:
            return jsonify({"message": "Failed to read PDF", "error": str(e)}), 500
    else:
        return jsonify({"message": "Only PDF files are allowed!"}), 400
@app.route('/print', methods=['POST'])
def print_file():
    try:
        data = request.get_json()
        print(data)
        file_url = data.get('fileUrl')
        options = data.get('options', {})
        
        # Opsi cetak
        pages = options.get('pages', 'all')
        copies = int(options.get('copies', 1))

        filename = os.path.basename(file_url)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

        if not os.path.exists(filepath):
            return jsonify({"message": "File not found"}), 404

        # Seleksi halaman
        temp_pdf_path = os.path.join(app.config['TEMP_FOLDER'], f"temp_{int(time.time())}.pdf")
        with open(filepath, 'rb') as f:
            reader = PdfReader(f)
            writer = PdfWriter()

            if pages == 'all':
                selected_pages = list(range(len(reader.pages)))
            else:
                selected_pages = [int(p) - 1 for p in pages.split(',')]

            for page_num in selected_pages:
                writer.add_page(reader.pages[page_num])

            with open(temp_pdf_path, 'wb') as temp_pdf:
                writer.write(temp_pdf)

        # Konversi ke grayscale jika diperlukan
        final_path = temp_pdf_path


        # Konfigurasi printer
        printer_name = win32print.GetDefaultPrinter()

        # Cetak dokumen beberapa kali sesuai jumlah salinan
        for _ in range(copies):
            win32api.ShellExecute(0, "print", final_path, f'/d:"{printer_name}"', ".", 0)
            time.sleep(2)  # Beri jeda untuk setiap salinan cetak

        return jsonify({
            "message": "Document sent to printer successfully",
            "printer": printer_name,
            "copies": copies
        }), 200

    except Exception as e:
        return jsonify({"message": "Print failed", "error": str(e)}), 500
    finally:
        # Membersihkan file sementara
        try:
            if os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)
 
        except Exception as cleanup_error:
            print(f"Error cleaning up temporary file: {cleanup_error}")

if __name__ == '__main__':
    app.run(debug=True, port=3000)
