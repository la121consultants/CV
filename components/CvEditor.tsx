
import React, { useState } from 'react';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { AlertTriangle, Sparkles } from 'lucide-react';

interface CvEditorProps {
    onRefine: (prompt: string) => void;
    isRefining: boolean;
    error: string | null;
}

export const CvEditor: React.FC<CvEditorProps> = ({ onRefine, isRefining, error }) => {
    const [prompt, setPrompt] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // The check for refinement limits is now handled entirely in App.tsx.
        // This component's only job is to capture the prompt and call the handler.
        if (!prompt.trim() || isRefining) return;
        onRefine(prompt);
    };

    return (
        <div className="mt-10 pt-8 border-t-2 border-dashed border-gray-300">
            <h3 className="text-2xl font-bold text-gray-800">AI Editor</h3>
            <p className="text-gray-600 mb-4">
                Not quite right? Tell the AI what you want to change. For example: "Make my summary more impactful" or "Add a key achievement to my most recent job."
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
                                <Sparkles className="mr-2 h-5 w-5" /> Refine CV
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
