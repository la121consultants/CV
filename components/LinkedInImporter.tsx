
import React, { useState } from 'react';
import { X, Linkedin, Loader2, AlertCircle } from 'lucide-react';

interface LinkedInImporterProps {
  onClose: () => void;
  onImport: (text: string) => void;
}

export const LinkedInImporter: React.FC<LinkedInImporterProps> = ({ onClose, onImport }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!url || !url.includes('linkedin.com/jobs/view/')) {
        setError('Please enter a valid LinkedIn job URL.');
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
        // NOTE: This uses a public CORS proxy. In a production environment, you should host your own.
        // Switched from api.allorigins.win to corsproxy.io for better reliability.
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch page. Status: ${response.status}`);
        }
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // LinkedIn job descriptions are typically in this element.
        const descriptionElement = doc.querySelector('.show-more-less-html__markup');
        
        if (!descriptionElement || !descriptionElement.textContent) {
            throw new Error("Could not find job description. The page structure may have changed, or the job posting is private.");
        }
        
        // The text content contains the job description.
        const jobDescription = descriptionElement.textContent.trim();
        onImport(jobDescription);

    } catch (e: any) {
        console.error("LinkedIn import error:", e);
        setError(`Failed to import from LinkedIn. This can happen due to network issues or changes in LinkedIn's page structure. Please try again in a moment, or copy and paste the job description manually. Error: ${e.message || 'Unknown'}`);
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative transform transition-all duration-300 ease-out scale-95 animate-fadeInScale">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="flex items-center mb-4">
          <Linkedin className="h-8 w-8 text-[#0077B5] mr-3" />
          <h3 className="text-2xl font-bold text-gray-900">Import Job from LinkedIn</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Paste the URL of a job posting from LinkedIn, and we'll automatically extract the description for you.
        </p>

        <div className="space-y-4">
            <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.linkedin.com/jobs/view/..."
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                disabled={isLoading}
            />
            <button
              onClick={handleImport}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold text-lg rounded-lg shadow-lg hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5"/>
                    Importing...
                </>
              ) : 'Import Job Description'}
            </button>
        </div>

        {error && (
            <div className="bg-red-100 border border-red-200 text-red-800 p-3 rounded-lg mt-4 flex items-start text-sm">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"/>
                <span>{error}</span>
            </div>
        )}
      </div>
    </div>
  );
};
