

// The user's live Web App URL has been integrated.
const GOOGLE_SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbw7MERIolxiArJAZw7WoWj0dc027OCBP6mvrsXlTYedOaqADiu937798LY5eWrm1wJXCg/exec';

/**
 * Sends the captured user information to a Google Sheet via a Web App URL.
 * This method uses FormData which is more reliable for cross-origin POST requests.
 */
export const logSubmissionToGoogleSheet = async (userInfo: { name: string, email: string, phone: string, location: string, targetJobs: string, linkedin: string, referralSource: string, employmentStatus: string }) => {
    if (!GOOGLE_SHEET_WEB_APP_URL || GOOGLE_SHEET_WEB_APP_URL.includes('YOUR_WEB_APP_ID')) {
        console.warn('Google Sheet Web App URL is not configured. User submission will not be logged.');
        return;
    }

    const formData = new FormData();
    // The Apps Script expects a 'payload' parameter containing the JSON string.
    const payload = { ...userInfo, type: 'submission' };
    formData.append('payload', JSON.stringify(payload));

    try {
        await fetch(GOOGLE_SHEET_WEB_APP_URL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors',
        });
        console.log("User submission data has been sent to Google Sheet.");
    } catch (e) {
        console.error("Failed to send user submission data to Google Sheet:", e);
    }
};

export interface FeedbackData {
    rating: number;
    isHelpful: 'Yes' | 'No' | '';
    wouldRecommend: 'Yes' | 'No' | '';
    comments: string;
}

/**
 * Sends user feedback to a Google Sheet via a Web App URL.
 */
export const logFeedbackToGoogleSheet = async (feedbackData: FeedbackData) => {
    if (!GOOGLE_SHEET_WEB_APP_URL || GOOGLE_SHEET_WEB_APP_URL.includes('YOUR_WEB_APP_ID')) {
        console.warn('Google Sheet Web App URL is not configured. Feedback will not be logged.');
        // We throw an error here so the UI can notify the user.
        throw new Error('Feedback service is not available at the moment.');
    }

    const formData = new FormData();
    const payload = { ...feedbackData, type: 'feedback', timestamp: new Date().toISOString() };
    formData.append('payload', JSON.stringify(payload));

    try {
        // 'no-cors' is a fire-and-forget method. We won't get a success/error response,
        // but it's reliable for sending data to a Google Apps Script that isn't configured for CORS.
        await fetch(GOOGLE_SHEET_WEB_APP_URL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors',
        });
        console.log("Feedback data has been sent to Google Sheet.");
    } catch (e) {
        console.error("Failed to send feedback to Google Sheet:", e);
        // We don't throw an error here because the request might have gone through despite a client-side network error.
        // We will proceed with an optimistic "Thank You" message in the UI.
    }
};