
import React, { useState } from 'react';
import { X, Star, ThumbsUp, Heart, Send, Loader2, CheckCircle } from 'lucide-react';
import { logFeedbackToGoogleSheet } from '../services/googleSheetService';
import type { FeedbackData } from '../services/googleSheetService';
import type { FeedbackEntry } from '../types';

interface FeedbackModalProps {
    onClose: () => void;
}

const FEEDBACK_STORAGE_KEY = 'la121FeedbackLog';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isHelpful, setIsHelpful] = useState<'Yes' | 'No' | ''>('');
    const [wouldRecommend, setWouldRecommend] = useState<'Yes' | 'No' | ''>('');
    const [comments, setComments] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Please provide a rating before submitting.");
            return;
        }
        setError(null);
        setIsSubmitting(true);

        const feedbackData: FeedbackData = {
            rating,
            isHelpful,
            wouldRecommend,
            comments
        };

        try {
            // Log to Google Sheet (fire and forget)
            logFeedbackToGoogleSheet(feedbackData);

            // Also save to local storage for admin panel viewer
            const newFeedbackEntry: FeedbackEntry = {
                ...feedbackData,
                timestamp: new Date().toISOString()
            };
            const currentFeedback = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
            currentFeedback.unshift(newFeedbackEntry); // Add to beginning of array
            localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(currentFeedback));

            setIsSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred.");
            setIsSubmitting(false);
        }
    };
    
    if (isSuccess) {
        return (
             <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                 <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center transform transition-all duration-300 ease-out scale-100 animate-fadeInScale">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900">Thank You!</h3>
                    <p className="text-gray-600 mt-2">Your feedback has been submitted.</p>
                 </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative transform transition-all duration-300 ease-out scale-95 animate-fadeInScale">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal">
                    <X className="h-6 w-6" />
                </button>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Share Your Feedback</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating */}
                    <div>
                        <label className="block text-md font-semibold text-gray-700 mb-2">How would you rate your experience? (5 is best)</label>
                        <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none"
                                >
                                    <Star className={`h-8 w-8 transition-colors ${ (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300' }`} fill="currentColor"/>
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Helpfulness */}
                    <div>
                        <label className="block text-md font-semibold text-gray-700 mb-2">Was this helpful in simplifying your job application process?</label>
                        <div className="flex space-x-4">
                           <RadioOption name="isHelpful" value="Yes" checked={isHelpful === 'Yes'} onChange={setIsHelpful} icon={<ThumbsUp className="h-5 w-5"/>}/>
                           <RadioOption name="isHelpful" value="No" checked={isHelpful === 'No'} onChange={setIsHelpful} icon={<ThumbsUp className="h-5 w-5 transform -scale-y-100"/>}/>
                        </div>
                    </div>
                    {/* Recommendation */}
                    <div>
                        <label className="block text-md font-semibold text-gray-700 mb-2">Would you suggest it to friends and family?</label>
                         <div className="flex space-x-4">
                           <RadioOption name="wouldRecommend" value="Yes" checked={wouldRecommend === 'Yes'} onChange={setWouldRecommend} icon={<Heart className="h-5 w-5"/>}/>
                           <RadioOption name="wouldRecommend" value="No" checked={wouldRecommend === 'No'} onChange={setWouldRecommend} icon={<Heart className="h-5 w-5 opacity-50"/>}/>
                        </div>
                    </div>
                    {/* Comments */}
                    <div>
                         <label htmlFor="comments" className="block text-md font-semibold text-gray-700 mb-2">Any other comments or suggestions?</label>
                         <textarea
                            id="comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            rows={4}
                            placeholder="Tell us what you think..."
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                         />
                    </div>
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold text-lg rounded-lg shadow-lg hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isSubmitting ? <><Loader2 className="animate-spin mr-2 h-5 w-5"/> Submitting...</> : <><Send className="mr-2 h-5 w-5"/> Submit Feedback</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Helper for styled radio buttons
const RadioOption: React.FC<{name: string, value: 'Yes' | 'No', checked: boolean, onChange: (val: 'Yes' | 'No') => void, icon: React.ReactNode}> = ({name, value, checked, onChange, icon}) => (
    <label className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${checked ? 'bg-primary-light border-primary' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
        <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="hidden"/>
        {icon}
        <span className="font-semibold">{value}</span>
    </label>
);
