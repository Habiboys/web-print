import { useState } from "react";
import axios from 'axios';

import FileUpload from "./components/FileUpload";
import PDFPreview from "./components/Preview";
import PrintOptions from "./components/PrintOptions";

// Tentukan BASE_URL sesuai dengan server Anda
const BASE_URL = "http://localhost:3000"; // Sesuaikan dengan URL backend Anda

function App() {
  const [fileData, setFileData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [printOptions, setPrintOptions] = useState({
    pages: "all",
    copies: 1,
    orientation: "portrait",  // Menambahkan orientasi ke state
  });
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState('');  // Menambahkan state untuk status print

  const handleFileUploaded = (data) => {
    console.log('File uploaded:', data);
    setFileData(data);
    
    if (data?.url) {
      const fullUrl = `${data.url}`;
      console.log('Full PDF URL:', fullUrl);
      setPdfUrl(fullUrl);
    }
  };

  const handleOptionsSelected = async (options) => {
    setPrintOptions(options);
    try {
      setIsPrinting(true);
      setPrintStatus('Printing... Please wait.');
      await handlePrint(fileData, options);
    } catch (error) {
      console.error('Print error:', error);
      alert('Failed to print. Please try again.');
      setPrintStatus('Failed to print. Please try again.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrint = async (file, options) => {
    try {
      const response = await axios.post(`${BASE_URL}/print`, {
        fileUrl: file.url,  // Backend akan menerima URL relatif
        options: {
          pages: options.pages,
          copies: options.copies,
          orientation: options.orientation,  // Mengirimkan data orientasi ke backend
        }
      });

      const { message } = response.data;
      console.log(message);  // Untuk melihat status cetak dari backend

      // Menampilkan pemberitahuan sukses
      setPrintStatus('Document sent to printer successfully! Please wait for the print job.');

      // Cek status pencetakan setiap 2 detik
      const checkPrintStatus = setInterval(async () => {
        try {
          const statusResponse = await axios.get(`${BASE_URL}/print-status/${message.jobId}`);
          const { status, completed } = statusResponse.data;
          
          console.log(`Print status: ${status}`);
          
          if (completed) {
            clearInterval(checkPrintStatus);
            setPrintStatus('Document printed successfully!');
          }
        } catch (error) {
          console.error('Error checking print status:', error);
          clearInterval(checkPrintStatus);
        }
      }, 2000);
    } catch (error) {
      console.error('Print error:', error);
      setPrintStatus('Failed to print. Please try again.');
      throw new Error('Failed to print document');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl text-center font-bold mb-4">Web Print LEA</h1>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Upload Document</h2>
        <FileUpload onFileUploaded={handleFileUploaded} />
      </section>

      {/* Preview Section */}
      {pdfUrl && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Document Preview</h2>
          <div className="border rounded-lg p-4">
            <PDFPreview fileUrl={pdfUrl} />
          </div>
        </section>
      )}

      {/* Print Options Section */}
      {fileData && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Print Settings</h2>
          <PrintOptions 
            onOptionsSelected={handleOptionsSelected}
            isLoading={isPrinting}
            initialOptions={printOptions}
          />
        </section>
      )}

      {/* Print Status Message */}
      {printStatus && (
        <section className="mb-6">
          <p className="text-xl font-semibold text-center text-blue-500">{printStatus}</p>
        </section>
      )}
    </div>
  );
}

export default App;
