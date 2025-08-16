
import React from 'react';
import { FileText, Sparkles, AlertTriangle } from 'lucide-react';

interface UsageTrackerProps {
    generationCount: number;
    refinementCount: number;
    generationLimit: number;
    refinementLimit: number;
}

export const UsageTracker: React.FC<UsageTrackerProps> = ({
    generationCount,
    refinementCount,
    generationLimit,
    refinementLimit
}) => {
    const generationsLeft = Math.max(0, generationLimit - generationCount);
    const refinementsLeft = Math.max(0, refinementLimit - refinementCount);

    const hasRemainingUses = generationsLeft > 0 || refinementsLeft > 0;

    return (
        <div className={`p-4 rounded-xl mb-12 max-w-4xl mx-auto flex items-center shadow-md border ${hasRemainingUses ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-300'}`}>
            {hasRemainingUses ? (
                <Sparkles className="h-8 w-8 text-blue-500 mr-4 flex-shrink-0" />
            ) : (
                <AlertTriangle className="h-8 w-8 text-yellow-500 mr-4 flex-shrink-0" />
            )}
            <div>
                <h3 className={`text-lg font-bold ${hasRemainingUses ? 'text-blue-800' : 'text-yellow-800'}`}>
                    {hasRemainingUses ? 'Free Actions Remaining' : 'Free Actions Used'}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-sm text-gray-700">
                    <div className="flex items-center mt-1 sm:mt-0">
                        <FileText className="h-4 w-4 mr-2 text-gray-500"/>
                        <span>
                            <strong className="font-semibold">{generationsLeft}</strong> of {generationLimit} CV Generations
                        </span>
                    </div>
                    <div className="flex items-center mt-1 sm:mt-0">
                        <Sparkles className="h-4 w-4 mr-2 text-gray-500"/>
                        <span>
                             <strong className="font-semibold">{refinementsLeft}</strong> of {refinementLimit} AI Refinements
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
