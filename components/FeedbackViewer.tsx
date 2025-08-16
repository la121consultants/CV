import React, { useState, useEffect } from 'react';
import type { FeedbackEntry } from '../types';
import { Star, ThumbsUp, Heart, MessageSquare, Clock } from 'lucide-react';

const FEEDBACK_STORAGE_KEY = 'la121FeedbackLog';

const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={`h-5 w-5 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" />
        ))}
        <span className="ml-2 text-sm font-bold text-gray-600">{rating}/5</span>
    </div>
);

const YesNoIcon: React.FC<{ value: 'Yes' | 'No' | '' }> = ({ value }) => {
    if (!value) return <span className="text-gray-400 text-sm">Not answered</span>;
    const isYes = value === 'Yes';
    return (
        <span className={`flex items-center text-sm font-semibold ${isYes ? 'text-green-600' : 'text-red-600'}`}>
            {isYes ? <ThumbsUp className="h-4 w-4 mr-1.5" /> : <ThumbsUp className="h-4 w-4 mr-1.5 transform -scale-y-100" />}
            {value}
        </span>
    );
};

export const FeedbackViewer: React.FC = () => {
    const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
    
    useEffect(() => {
        try {
            const storedFeedback = localStorage.getItem(FEEDBACK_STORAGE_KEY);
            setFeedback(storedFeedback ? JSON.parse(storedFeedback) : []);
        } catch (e) {
            console.error("Failed to parse feedback from localStorage", e);
            setFeedback([]);
        }
    }, []);

    if (feedback.length === 0) {
        return <p className="text-center text-gray-500 py-4">No user feedback has been submitted yet.</p>;
    }

    return (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {feedback.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start">
                        <RatingStars rating={item.rating} />
                        <div className="flex items-center text-xs text-gray-500" title={new Date(item.timestamp).toLocaleString()}>
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {timeSince(new Date(item.timestamp))}
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                           <span className="font-semibold text-gray-700">Helpful:</span>
                           <YesNoIcon value={item.isHelpful} />
                        </div>
                         <div className="flex items-center space-x-2">
                           <span className="font-semibold text-gray-700">Would Recommend:</span>
                           <YesNoIcon value={item.wouldRecommend} />
                        </div>
                    </div>
                    {item.comments && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600 italic">"{item.comments}"</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
