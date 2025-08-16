
import React, { useState, useEffect } from 'react';
import { ExternalLink, Calendar, Database, Loader2, AlertTriangle, TrendingUp } from 'lucide-react';

const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1hHtX51ex8mkTi6pi5MoLrmI1pa_DQZcpD5wsd1wrqwE/edit?usp=sharing';
// The Web App URL is needed here to fetch stats
const GOOGLE_SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw7MERIolxiArJAZw7WoWj0dc027OCBP6mvrsXlTYedOaqADiu937798LY5eWrm1wJXCg/exec';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


export const UserDataDownloader: React.FC = () => {
    const [stats, setStats] = useState<{today: number; thisMonth: number; total: number} | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);

    useEffect(() => {
        if (!GOOGLE_SHEET_WEB_APP_URL || GOOGLE_SHEET_WEB_APP_URL.includes('YOUR_WEB_APP_ID')) {
            setIsLoading(false);
            setError("The data analytics service is not configured.");
            return;
        }

        const fetchStats = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // A unique query param helps prevent caching issues
                const response = await fetch(`${GOOGLE_SHEET_WEB_APP_URL}?t=${new Date().getTime()}`);
                if (!response.ok) {
                    throw new Error(`The analytics service returned an error: ${response.statusText}`);
                }
                const data = await response.json();
                if (data.status === 'success') {
                    setStats(data);
                } else {
                    throw new Error(data.message || 'An unknown error occurred in the analytics script.');
                }
            } catch (e: any) {
                console.error("Error fetching stats:", e);
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Candidate Data Log</h3>
                    <p className="text-sm text-gray-500">Access the full submission log in your private Google Sheet.</p>
                </div>
                 <a 
                    href={GOOGLE_SHEET_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover">
                    <ExternalLink className="h-4 w-4 mr-2"/>
                    Open Sheet
                </a>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Usage Analytics</h3>
                 {isLoading && (
                    <div className="flex items-center justify-center p-10 bg-white rounded-lg border">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mr-3" />
                        <span className="text-gray-600">Loading live analytics...</span>
                    </div>
                )}
                {error && (
                     <div className="flex items-center p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        <AlertTriangle className="h-6 w-6 mr-3" />
                        <div>
                            <p className="font-bold">Could not load analytics</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}
                {!isLoading && !error && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <StatCard title="Submissions Today" value={stats.today} icon={<Calendar className="h-6 w-6 text-white"/>} color="bg-blue-500" />
                       <StatCard title="This Month" value={stats.thisMonth} icon={<TrendingUp className="h-6 w-6 text-white"/>} color="bg-green-500" />
                       <StatCard title="Total Submissions" value={stats.total} icon={<Database className="h-6 w-6 text-white"/>} color="bg-gray-700" />
                    </div>
                )}
            </div>
        </div>
    );
};
