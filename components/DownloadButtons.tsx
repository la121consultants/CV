import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Packer, Document, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import saveAs from 'file-saver';
import type { CvData } from '../types';
import { FileDown, FileText, Loader2 } from 'lucide-react';

interface DownloadButtonsProps {
  cvData: CvData;
  cvContainerRef: React.RefObject<HTMLDivElement>;
}

const createDocx = (cvData: CvData): Document => {
  const doc = new Document({
    creator: "LA121 AI CV Review",
    title: `CV - ${cvData.fullName}`,
    styles: {
      paragraphStyles: [
        {
          id: "normal",
          name: "Normal",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 22, font: "Calibri" },
          paragraph: { spacing: { after: 120 } },
        },
        {
          id: "h1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 48, bold: true, font: "Calibri Light" },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 240 } },
        },
        {
          id: "contact",
          name: "Contact",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 20 },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 240 } },
        },
        {
          id: "h2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 28, bold: true, color: "1E40AF" },
          paragraph: { spacing: { before: 240, after: 120 }, border: { bottom: { color: "DBEAFE", space: 1, style: "single", size: 18 } } },
        },
      ],
    },
    sections: [{
      children: [
        new Paragraph({ text: cvData.fullName, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun(cvData.email),
                new TextRun(" | "),
                new TextRun(cvData.phone),
                ...(cvData.linkedin ? [new TextRun(" | "), new TextRun(cvData.linkedin)] : []),
                ...(cvData.github ? [new TextRun(" | "), new TextRun(cvData.github)] : []),
                ...(cvData.website ? [new TextRun(" | "), new TextRun(cvData.website)] : []),
            ],
        }),
        new Paragraph({ text: "Professional Summary", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: cvData.summary, style: "normal" }),
        new Paragraph({ text: "Work Experience", heading: HeadingLevel.HEADING_2 }),
        ...cvData.experience.flatMap(exp => [
          new Paragraph({
            children: [
              new TextRun({ text: exp.jobTitle, bold: true }),
              new TextRun({ text: ` at ${exp.company}`, italics: true }),
            ],
          }),
          new Paragraph({ text: `${exp.location} | ${exp.dates}`, style: "normal", run: { color: "808080", size: 18 } }),
          ...exp.responsibilities.map(resp => new Paragraph({ text: resp, bullet: { level: 0 } })),
          new Paragraph(""), // Spacer
        ]),
        ...(cvData.projects && cvData.projects.length > 0 ? [
            new Paragraph({ text: "Projects", heading: HeadingLevel.HEADING_2 }),
            ...cvData.projects.flatMap(proj => [
                new Paragraph({ children: [new TextRun({ text: proj.name, bold: true })] }),
                new Paragraph({ text: proj.description }),
                ...(proj.technologies ? [new Paragraph({ children: [ new TextRun({ text: `Technologies: ${proj.technologies.join(', ')}`, italics: true, size: 18 }) ] })] : []),
                new Paragraph(""),
            ])
        ] : []),
        new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_2 }),
        ...Object.entries(cvData.skills).flatMap(([category, skills]) => skills.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({ text: `${category}: `, bold: true }),
              new TextRun(skills.join(', ')),
            ],
          }),
        ] : []),
        new Paragraph({ text: "Education", heading: HeadingLevel.HEADING_2 }),
        ...cvData.education.map(edu => new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true }),
            new TextRun(` - ${edu.university}, ${edu.dates}`),
          ],
        })),
        ...(cvData.leadership && cvData.leadership.length > 0 ? [
            new Paragraph({ text: "Leadership & Extracurriculars", heading: HeadingLevel.HEADING_2 }),
             ...cvData.leadership.flatMap(lead => [
                new Paragraph({ children: [ new TextRun({ text: lead.role, bold: true }), new TextRun({ text: ` at ${lead.organization}`, italics: true }) ] }),
                new Paragraph({ text: lead.dates, style: "normal", run: { color: "808080", size: 18 } }),
                ...lead.responsibilities.map(resp => new Paragraph({ text: resp, bullet: { level: 0 } })),
                new Paragraph(""),
            ])
        ] : []),
        ...(cvData.awards && cvData.awards.length > 0 ? [
            new Paragraph({ text: "Awards & Achievements", heading: HeadingLevel.HEADING_2 }),
            ...cvData.awards.map(award => new Paragraph({
                children: [
                    new TextRun({ text: award.name, bold: true }),
                    new TextRun(` - ${award.awardedBy}, ${award.date}`),
                ],
            }))
        ] : []),
        ...(cvData.certifications && cvData.certifications.length > 0 ? [
            new Paragraph({ text: "Certifications", heading: HeadingLevel.HEADING_2 }),
            ...cvData.certifications.map(cert => new Paragraph({
                 children: [
                    new TextRun({ text: cert.name, bold: true }),
                    new TextRun(` - ${cert.issuer}, ${cert.date}`),
                ],
            }))
        ] : []),
        new Paragraph({ text: "References", heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: cvData.references, style: "normal", run: { italics: true } }),
      ],
    }],
  });
  return doc;
};

export const DownloadButtons: React.FC<DownloadButtonsProps> = ({ cvData, cvContainerRef }) => {
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isWordLoading, setIsWordLoading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!cvContainerRef.current) return;
    setIsPdfLoading(true);
    try {
      const canvas = await html2canvas(cvContainerRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = 595.28; // A4 width in points
      const pdfHeight = 841.89; // A4 height in points
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const canvasAspectRatio = canvasWidth / canvasHeight;
      const pdfAspectRatio = pdfWidth / pdfHeight;
      
      let finalCanvasWidth, finalCanvasHeight;
      
      if (canvasAspectRatio > pdfAspectRatio) {
          finalCanvasWidth = pdfWidth;
          finalCanvasHeight = pdfWidth / canvasAspectRatio;
      } else {
          finalCanvasHeight = pdfHeight;
          finalCanvasWidth = pdfHeight * canvasAspectRatio;
      }

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4',
      });
      
      const totalPdfHeight = canvas.height * pdfWidth / canvas.width;
      let position = 0;
      let pageHeight = pdf.internal.pageSize.getHeight();
      
      const content = cvContainerRef.current;
      const contentHeight = content.scrollHeight;
      const capturedCanvas = await html2canvas(content, {scale: 2, useCORS: true});
      const imgDataUrl = capturedCanvas.toDataURL('image/png');
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = capturedCanvas.height * imgWidth / capturedCanvas.width;
      let heightLeft = imgHeight;
      
      pdf.addImage(imgDataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = -heightLeft;
        pdf.addPage();
        pdf.addImage(imgDataUrl, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${cvData.fullName.replace(/\s/g, '_')}_CV.pdf`);
    } catch (e) {
      console.error("Failed to generate PDF:", e);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setIsPdfLoading(false);
    }
  };
  
  const handleDownloadWord = async () => {
    setIsWordLoading(true);
    try {
      const doc = createDocx(cvData);
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${cvData.fullName.replace(/\s/g, '_')}_CV.docx`);
    } catch (e) {
      console.error("Failed to generate DOCX:", e);
      alert("Could not generate Word document. Please try again.");
    } finally {
      setIsWordLoading(false);
    }
  };

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

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <DownloadButton
        onClick={handleDownloadPdf}
        isLoading={isPdfLoading}
        icon={<FileDown className="mr-2 h-5 w-5" />}
        text="Download PDF"
        className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      />
      <DownloadButton
        onClick={handleDownloadWord}
        isLoading={isWordLoading}
        icon={<FileText className="mr-2 h-5 w-5" />}
        text="Download Word"
        className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
      />
    </div>
  );
};
