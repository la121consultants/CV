
import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { UploadCloud, Loader2 } from 'lucide-react';

// Set up the worker for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.min.js';


interface FileUploadProps {
  label: string;
  onFileRead: (content: string) => void;
  isInvalid?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, onFileRead, isInvalid = false }) => {
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setFileName(file.name);
    setError('');

    try {
      let text = '';
      if (file.type === 'text/plain') {
        text = await file.text();
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(' ');
        }
        text = fullText;
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else {
        throw new Error('Unsupported file type. Please upload .txt, .pdf, or .docx');
      }
      onFileRead(text);
    } catch (e: any) {
      console.error('File parsing error:', e);
      setError(e.message || 'Failed to parse file.');
      onFileRead('');
    } finally {
      setIsParsing(false);
       // Reset file input so user can upload the same file again
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-full">
      <label htmlFor={label} className={`block text-lg font-semibold mb-2 ${isInvalid ? 'text-red-600' : 'text-gray-700'}`}>
        {label}
      </label>
      <div
        className={`flex justify-center items-center w-full px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition ${
            isInvalid ? 'border-red-500' : 'border-gray-300'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          id={label}
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.pdf,.docx"
          disabled={isParsing}
        />
        {isParsing ? (
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        ) : (
          <UploadCloud className="h-5 w-5 text-gray-500" />
        )}
        <span className="ml-2 text-sm font-medium text-gray-600">
          {isParsing ? 'Parsing...' : (fileName || 'Upload .txt, .pdf, or .docx')}
        </span>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
