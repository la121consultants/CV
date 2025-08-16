import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Packer, Document, Paragraph, TextRun } from 'docx';
import saveAs from 'file-saver';
import { FileDown, FileText, Loader2 } from 'lucide-react';

interface CoverLetterDisplayProps {
    coverLetterText: string;
    userName: string;
}

const DownloadButton: React.FC<{
    onClick: () => void;
    isLoading: boolean;
    icon: React.ReactNode;
    text: string;
    className?: string;
  }> = ({ onClick, isLoading, icon, text, className }) => (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${className} disabled:opacity-50 disabled:cursor-wait`}
    >
      {isLoading ? (
        <Loader2 className="animate-spin mr-2 h-5 w-5" />
      ) : (
        icon
      )}
      {text}
    </button>
  );


export const CoverLetterDisplay: React.FC<CoverLetterDisplayProps> = ({ coverLetterText, userName }) => {
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [isWordLoading, setIsWordLoading] = useState(false);

    const fileName = `${userName.replace(/\s/g, '_') || 'User'}_Cover_Letter`;

    const handleDownloadPdf = () => {
        setIsPdfLoading(true);
        try {
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                format: 'a4',
            });
            
            const margin = 40;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const usableWidth = pageWidth - margin * 2;
            const usableHeight = pageHeight - margin * 2;
            
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(12);
            
            const lines = pdf.splitTextToSize(coverLetterText, usableWidth);
            
            let cursorY = margin;
            
            lines.forEach((line: string) => {
                if (cursorY > usableHeight + margin) {
                    pdf.addPage();
                    cursorY = margin;
                }
                pdf.text(line, margin, cursorY);
                cursorY += 15; // line height
            });
            
            pdf.save(`${fileName}.pdf`);
        } catch (e) {
            console.error("Failed to generate PDF for cover letter:", e);
            alert("Could not generate PDF. Please try again.");
        } finally {
            setIsPdfLoading(false);
        }
    };

    const handleDownloadWord = async () => {
        setIsWordLoading(true);
        try {
            const paragraphs = coverLetterText.split('\n').map(text => 
                new Paragraph({
                    children: [new TextRun(text)],
                    spacing: { after: 120 }
                })
            );

            const doc = new Document({
                creator: "LA121 AI CV Review",
                title: `Cover Letter - ${userName}`,
                sections: [{ children: paragraphs }]
            });
            
            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${fileName}.docx`);
        } catch (e) {
            console.error("Failed to generate DOCX for cover letter:", e);
            alert("Could not generate Word document. Please try again.");
        } finally {
            setIsWordLoading(false);
        }
    };

    return (
        <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200 relative">
            <div className="absolute top-4 right-4 flex flex-col sm:flex-row gap-2">
                <DownloadButton
                    onClick={handleDownloadPdf}
                    isLoading={isPdfLoading}
                    icon={<FileDown className="mr-2 h-5 w-5" />}
                    text="PDF"
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                />
                <DownloadButton
                    onClick={handleDownloadWord}
                    isLoading={isWordLoading}
                    icon={<FileText className="mr-2 h-5 w-5" />}
                    text="Word"
                    className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                />
            </div>
            <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed pt-12 sm:pt-0">
                {coverLetterText}
            </pre>
        </div>
    );
};
