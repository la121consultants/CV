

import { GoogleGenAI, Type } from "@google/genai";
import type { CvData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        fullName: { type: Type.STRING, description: "The candidate's full name, taken from the provided user info." },
        email: { type: Type.STRING, description: "The candidate's email address, taken from the provided user info." },
        phone: { type: Type.STRING, description: "The candidate's phone number, taken from the provided user info." },
        linkedin: { type: Type.STRING, description: "URL to the candidate's LinkedIn profile. Use the one from the provided 'Candidate Information'. Omit if not provided." },
        github: { type: Type.STRING, description: "URL to the candidate's GitHub profile. Omit if not present in the original CV." },
        website: { type: Type.STRING, description: "URL to the candidate's personal website or portfolio. Omit if not present in the original CV." },
        summary: { type: Type.STRING, description: "A 3-5 sentence professional summary, rewritten to be a powerful pitch aligned with the job description and target roles." },
        experience: {
            type: Type.ARRAY,
            description: "The candidate's relevant work experience.",
            items: {
                type: Type.OBJECT,
                properties: {
                    jobTitle: { type: Type.STRING },
                    company: { type: Type.STRING },
                    location: { type: Type.STRING },
                    dates: { type: Type.STRING, description: "e.g., 'Jan 2020 - Present'" },
                    responsibilities: {
                        type: Type.ARRAY,
                        description: "Bulleted list of 3-5 key achievements and responsibilities, rewritten using action verbs and quantified results relevant to the job description.",
                        items: { type: Type.STRING }
                    }
                },
                required: ["jobTitle", "company", "location", "dates", "responsibilities"]
            }
        },
        education: {
            type: Type.ARRAY,
            description: "The candidate's education history.",
            items: {
                type: Type.OBJECT,
                properties: {
                    degree: { type: Type.STRING, description: "e.g., 'B.S. in Computer Science'" },
                    university: { type: Type.STRING },
                    dates: { type: Type.STRING, description: "e.g., 'Aug 2016 - May 2020'" }
                },
                required: ["degree", "university", "dates"]
            }
        },
        skills: {
            type: Type.OBJECT,
            description: "A categorized list of the candidate's skills, updated to include keywords from the job description.",
            properties: {
                "Programming Languages": { type: Type.ARRAY, items: { type: Type.STRING } },
                "Frameworks & Libraries": { type: Type.ARRAY, items: { type: Type.STRING } },
                "Tools & Platforms": { type: Type.ARRAY, items: { type: Type.STRING } },
                "Other Skills": { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        projects: {
            type: Type.ARRAY,
            description: "A list of personal or academic projects. Highly important for showcasing practical skills, especially for students or career changers. Omit if not present.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The project's name." },
                    description: { type: Type.STRING, description: "A brief description of the project, its purpose, and outcome." },
                    technologies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of technologies or tools used." },
                    link: { type: Type.STRING, description: "A URL to the project repository or live demo. Omit if not provided." }
                }
            }
        },
        certifications: {
            type: Type.ARRAY,
            description: "A list of relevant professional certifications. Omit if not present.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the certification." },
                    issuer: { type: Type.STRING, description: "The organization that issued the certification." },
                    date: { type: Type.STRING, description: "The date the certification was obtained." }
                }
            }
        },
        awards: {
            type: Type.ARRAY,
            description: "A list of awards, honors, or scholarships. Omit if not present.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the award." },
                    awardedBy: { type: Type.STRING, description: "The organization that gave the award." },
                    date: { type: Type.STRING, description: "The date the award was received." },
                    summary: { type: Type.STRING, description: "A brief description of the achievement. Omit if not needed." }
                }
            }
        },
        leadership: {
            type: Type.ARRAY,
            description: "A list of leadership roles or significant extracurricular activities. Omit if not present.",
            items: {
                type: Type.OBJECT,
                properties: {
                    role: { type: Type.STRING, description: "The title or role held." },
                    organization: { type: Type.STRING, description: "The name of the club, society, or organization." },
                    dates: { type: Type.STRING, description: "The duration of the role." },
                    responsibilities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Bulleted list of key responsibilities and achievements in the role." }
                }
            }
        },
        publications: {
            type: Type.ARRAY,
            description: "A list of publications or presentations. Especially relevant for academic or research roles. Omit if not present.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    authors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    journal: { type: Type.STRING, description: "The journal, conference, or publication venue." },
                    date: { type: Type.STRING },
                    link: { type: Type.STRING, description: "A URL to the publication. Omit if not provided." }
                }
            }
        },
        languages: {
            type: Type.ARRAY,
            description: "A list of languages and proficiency levels. Omit if not present.",
            items: {
                type: Type.OBJECT,
                properties: {
                    language: { type: Type.STRING },
                    proficiency: { type: Type.STRING, description: "e.g., 'Native', 'Fluent', 'Conversational'" }
                }
            }
        },
        references: { type: Type.STRING, description: "The static text 'References available upon request.' or a list of provided references." },
    },
    required: ["fullName", "email", "phone", "summary", "experience", "education", "skills", "references"]
};

const buildPrompt = (cv: string, jobDesc: string, userInfo: { name: string, email: string, phone: string, targetJobs: string, linkedin: string }): string => {
    return `
    You are an expert CV reviewer and professional resume writer with 20 years of experience helping candidates land jobs at top tech companies.

    Your task is to analyze the provided CV, job description, and candidate information, then rewrite the CV to be perfectly tailored for this specific job.

    **Candidate Information (Source of Truth for Contact Details):**
    - Full Name: ${userInfo.name}
    - Email: ${userInfo.email}
    - Phone: ${userInfo.phone}
    - LinkedIn: ${userInfo.linkedin || 'Not provided'}
    - Target Job Roles: ${userInfo.targetJobs}

    **Instructions:**
    1.  **Use Provided Contact Info:** You MUST use the Full Name, Email, Phone number, and LinkedIn URL from the "Candidate Information" section above for the contact details in the final CV. Ignore any different contact info found in the CV text.
    2.  **LinkedIn Handling:** If the LinkedIn URL is 'Not provided', you MUST omit the linkedin field from the JSON output. Otherwise, use the provided URL.
    3.  **Analyze Job Description:** Deeply analyze the job description to extract key requirements, skills, and qualifications.
    4.  **Rewrite Summary:** Rewrite the professional summary into a concise, powerful pitch that is perfectly aligned with the job description and the candidate's stated "Target Job Roles".
    5.  **Tailor Experience:** For each work experience entry, rewrite the bullet points. Use strong action verbs and quantify achievements wherever possible. Focus only on accomplishments most relevant to the target job.
    6.  **Update Skills:** Refresh the skills section to feature relevant skills mentioned in the job description that the candidate possesses. Group skills logically.
    7.  **Expand on Experience:** Actively look for information that can be categorized into Projects, Certifications, Awards, Leadership/Extracurriculars, Publications, and Languages. These sections are crucial for showcasing a candidate's full range of abilities, especially for students. If such information exists in the CV, populate the corresponding optional fields in the JSON output.
    8.  **Integrity:** Do NOT invent new experiences or skills. Only work with the information provided in the original CV. If the original CV is missing social links like GitHub/Website, omit those fields in the output.
    9.  **Formatting:** Adhere strictly to the provided JSON schema for your output.
    10. **References:** If the user has provided specific references text, use that for the 'references' field. Otherwise, use the static text: "References available upon request.".

    **[START JOB DESCRIPTION]**
    ${jobDesc}
    **[END JOB DESCRIPTION]**

    **[START CV]**
    ${cv}
    **[END CV]**

    Now, based on these instructions, generate the tailored CV in the specified JSON format.
    `;
};

const cleanAndParseJson = (text: string): any => {
    let jsonText = text.trim();
    
    // Clean potential markdown formatting
    if (jsonText.startsWith('```json')) {
        jsonText = jsonText.substring(7, jsonText.length - 3).trim();
    } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.substring(3, jsonText.length - 3).trim();
    }
    
    // Find the first and last curly brace to extract the main JSON object
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }
    
    return JSON.parse(jsonText);
};

export const generateTailoredCv = async (
    cv: string, 
    jobDesc: string, 
    userInfo: { name: string, email: string, phone: string, targetJobs: string, linkedin: string }
): Promise<CvData> => {
    const prompt = buildPrompt(cv, jobDesc, userInfo);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ text: prompt }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
                temperature: 0.3,
            }
        });
        
        return cleanAndParseJson(response.text) as CvData;
    } catch (error) {
        console.error("Error calling Gemini API for CV generation:", error);
        if (error instanceof Error) {
            if (error.message.includes('JSON')) {
                 throw new Error("The AI returned a response in an unexpected format. Please try adjusting your inputs and try again.");
            }
            throw new Error(`The AI service failed. This could be due to a network issue or invalid input. Details: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the CV.");
    }
};

const buildRefinementPrompt = (currentCvJson: string, userPrompt: string): string => {
    return `
    You are an expert CV editor. Your task is to refine the provided CV based on the user's request.

    **Current CV (in JSON format):**
    ${currentCvJson}

    **User's Request:**
    "${userPrompt}"

    **Instructions:**
    1.  Carefully analyze the user's request and the current CV data.
    2.  Modify the JSON data to incorporate the user's changes.
    3.  You MUST return the **entire, complete, and valid JSON object** for the CV, even if you only changed one part.
    4.  Adhere strictly to the original JSON schema. Do not add or remove top-level keys. The structure must remain the same.
    5.  Maintain the professional tone and quality of the CV.

    Now, generate the updated and complete CV in the specified JSON format.
    `;
};


export const refineCv = async (
    currentCv: CvData,
    userPrompt: string
): Promise<CvData> => {
    const currentCvJson = JSON.stringify(currentCv, null, 2);
    const prompt = buildRefinementPrompt(currentCvJson, userPrompt);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ text: prompt }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema, // Use the same schema to enforce structure
                temperature: 0.4, // Allow for a bit more creativity in refinement
            }
        });

        return cleanAndParseJson(response.text) as CvData;
    } catch (error) {
        console.error("Error calling Gemini API for refinement:", error);
        if (error instanceof Error) {
             if (error.message.includes('JSON')) {
                throw new Error("The AI returned an invalid format during refinement. Please try a different prompt.");
            }
            throw new Error(`The AI service failed during refinement. Details: ${error.message}`);
        }
        throw new Error("An unknown error occurred while refining the CV.");
    }
};

const buildCoverLetterPrompt = (cvData: CvData, jobDesc: string, targetJob: string): string => {
    const { fullName, summary, experience, skills } = cvData;

    return `
    You are an expert career coach and professional writer. Your task is to write a compelling, professional, and personalized cover letter based on the provided tailored CV and job description.

    **Candidate Information:**
    - Name: ${fullName}

    **Target Job:**
    - The candidate is applying for a "${targetJob}" role.

    **Candidate's Tailored CV (JSON format):**
    ${JSON.stringify({ summary, experience, skills }, null, 2)}

    **Full Job Description:**
    ${jobDesc}

    **Instructions:**
    1.  **Structure:** Write a standard professional cover letter with an introduction, body paragraphs, and a conclusion.
    2.  **Introduction:** Start by addressing the hiring manager (use a generic title like "Hiring Manager" as the name is not available). State the position the candidate is applying for and where they might have seen it (e.g., on LinkedIn, company website).
    3.  **Body Paragraphs (2-3):**
        -   Connect the candidate's experience and skills directly to the key requirements in the job description.
        -   Use information from the tailored CV's summary and experience sections. Highlight 2-3 key achievements or skills that are most relevant.
        -   Reflect the professional tone and keywords from the job description.
    4.  **Conclusion:** Reiterate the candidate's interest in the role and the company. Include a strong call to action, suggesting an interview to discuss their qualifications further.
    5.  **Tone:** The tone should be enthusiastic, confident, and professional.
    6.  **Formatting:** Do not use JSON. Output only the plain text of the cover letter, including the candidate's name at the end. Do not include headers like "**Cover Letter**" or similar markdown. Just the raw text of the letter itself.
    
    Now, write the cover letter.
    `;
};


export const generateCoverLetter = async (
    cvData: CvData,
    jobDesc: string,
    targetJob: string
): Promise<string> => {
    const prompt = buildCoverLetterPrompt(cvData, jobDesc, targetJob);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ text: prompt }],
            config: {
                temperature: 0.5, // Allow a bit more creativity for writing style
            }
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for cover letter:", error);
        throw new Error("Could not connect to the AI service to generate the cover letter.");
    }
};

const buildCoverLetterRefinementPrompt = (currentCoverLetter: string, userPrompt: string): string => {
    return `
    You are an expert cover letter editor. Your task is to refine the provided cover letter based on the user's request.

    **Current Cover Letter:**
    ${currentCoverLetter}

    **User's Request:**
    "${userPrompt}"

    **Instructions:**
    1.  Carefully analyze the user's request and the current cover letter.
    2.  Modify the text to incorporate the user's changes while maintaining a professional tone.
    3.  You MUST return only the plain text of the **entire, complete, and updated cover letter**. 
    4.  Do not add any headers, markdown, or explanations. Just the raw text of the letter itself.

    Now, generate the updated cover letter.
    `;
};

export const refineCoverLetter = async (
    currentCoverLetter: string,
    userPrompt: string
): Promise<string> => {
    const prompt = buildCoverLetterRefinementPrompt(currentCoverLetter, userPrompt);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ text: prompt }],
            config: {
                temperature: 0.5,
            }
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for cover letter refinement:", error);
        throw new Error("Could not connect to the AI service to refine the cover letter.");
    }
};

const buildStandaloneCoverLetterPrompt = (cvText: string, jobDesc: string, userInfo: { name: string, targetJobs: string }): string => {
    return `
    You are an expert career coach and professional writer. Your task is to write a compelling, professional, and personalized cover letter based on the provided raw CV text and a job description.

    **Candidate Information:**
    - Name: ${userInfo.name}

    **Target Job:**
    - The candidate is applying for a "${userInfo.targetJobs}" role.

    **Candidate's Full CV (Raw Text):**
    ${cvText}

    **Full Job Description:**
    ${jobDesc}

    **Instructions:**
    1.  **Analyze CV:** First, read through the raw CV text to thoroughly understand the candidate's experience, skills, and key achievements.
    2.  **Structure:** Write a standard professional cover letter with an introduction, body paragraphs, and a conclusion.
    3.  **Introduction:** Start by addressing the hiring manager (use a generic title like "Hiring Manager" as the name is not available). State the position the candidate is applying for.
    4.  **Body Paragraphs (2-3):**
        -   Connect the candidate's profile (from the provided CV text) directly to the key requirements in the job description.
        -   Highlight 2-3 of the most relevant achievements or skills from their CV.
        -   Reflect the professional tone and keywords from the job description.
    5.  **Conclusion:** Reiterate the candidate's interest in the role and the company. Include a strong call to action.
    6.  **Tone:** The tone should be enthusiastic, confident, and professional.
    7.  **Formatting:** Do not use JSON. Output only the plain text of the cover letter, including the candidate's name at the end. Do not include headers or markdown.

    Now, write the cover letter.
    `;
};

export const generateCoverLetterFromText = async (
    cvText: string,
    jobDesc: string,
    userInfo: { name: string, targetJobs: string }
): Promise<string> => {
    const prompt = buildStandaloneCoverLetterPrompt(cvText, jobDesc, userInfo);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ text: prompt }],
            config: {
                temperature: 0.5,
            }
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for standalone cover letter:", error);
        throw new Error("Could not connect to the AI service to generate the cover letter.");
    }
};
