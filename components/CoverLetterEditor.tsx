
import React, { useState } from 'react';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { AlertTriangle, Sparkles } from 'lucide-react';

interface CoverLetterEditorProps {
    onRefine: (prompt: string) => void;
    isRefining: boolean;
    error: string | null;
}

export const CoverLetterEditor: React.FC<CoverLetterEditorProps> = ({ onRefine, isRefining, error }) => {
    const [prompt, setPrompt] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isRefining) return;
        onRefine(prompt);
        setPrompt(''); // Clear prompt after submission
    };

    return (
        <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-800">Refine Your Cover Letter</h4>
            <p className="text-gray-600 mb-4 text-sm">
                Want to make changes? Tell the AI what to adjust. For example: "Make the tone more enthusiastic" or "Mention my experience with project management."
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your instructions here..."
                    rows={3}
                    className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                    disabled={isRefining}
                />
                <div className="flex justify-end">
                    <Button type="submit" disabled={isRefining || !prompt.trim()}>
                        {isRefining ? (
                            <>
                                <Spinner /> Refining...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5" /> Refine Cover Letter
                            </>
                        )}
                    </Button>
                </div>
            </form>
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center mt-4" role="alert">
                    <AlertTriangle className="h-6 w-6 mr-3" />
                    <div>
                        <p className="font-bold">Refinement Error</p>
                        <p>{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
