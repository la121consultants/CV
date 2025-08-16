import emailjs from '@emailjs/browser';

/**
 * Sends a verification email using EmailJS.
 * Assumes an EmailJS template is set up with variables:
 * - to_email: The recipient's email address.
 * - verification_code: The 6-digit code.
 */
export const sendVerificationEmail = async (to_email: string, verification_code: string): Promise<boolean> => {
    const serviceId = localStorage.getItem('emailJsServiceId');
    const templateId = localStorage.getItem('emailJsTemplateId');
    const publicKey = localStorage.getItem('emailJsPublicKey');

    if (!serviceId || !templateId || !publicKey) {
        console.warn("EmailJS service is not configured. Cannot send email.");
        return false; // Indicate that email was not sent
    }

    const templateParams = {
        to_email,
        verification_code,
    };

    try {
        await emailjs.send(serviceId, templateId, templateParams, { publicKey });
        console.log("Verification email sent successfully via EmailJS.");
        return true; // Indicate success
    } catch (error) {
        console.error("Failed to send email via EmailJS:", error);
        throw new Error("Failed to send verification email. Please check EmailJS configuration and network.");
    }
};
