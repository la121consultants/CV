

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { TextAreaInput } from './TextAreaInput';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { CvDisplay, LayoutType } from './CvDisplay';
import { DownloadButtons } from './DownloadButtons';
import { FileUpload } from './FileUpload';
import { ProgressBar } from './ProgressBar';
import { LinkedInImporter } from './LinkedInImporter';
import { CvEditor } from './CvEditor';
import { UsageTracker } from './UsageTracker';
import { HowItWorks } from './HowItWorks';
import { CoverLetterDisplay } from './CoverLetterDisplay';
import { CvBuilderForm } from './CvBuilderForm';
import { CoverLetterEditor } from './CoverLetterEditor';
import { LayoutSelector } from './LayoutSelector';
import { FeedbackModal } from './FeedbackModal';
import { logSubmissionToGoogleSheet } from '../services/googleSheetService';
import { generateTailoredCv, refineCv, generateCoverLetter, refineCoverLetter, generateCoverLetterFromText } from '../services/geminiService';
import type { CvData, LoggedInUser } from '../types';
import { AlertTriangle, Sparkles, User, Mail, Phone, MapPin, Briefcase, Linkedin, FileText, MessageSquare, HelpCircle, Edit3 } from 'lucide-react';

interface InfoInputProps {
  name: string;
  placeholder: string;
  value: string;
  icon: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  isInvalid?: boolean;
  readOnly?: boolean;
}

const InfoInput: React.FC<InfoInputProps> = ({ name, placeholder, value, icon, onChange, type = "text", isInvalid = false, readOnly = false }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      {icon}
    </div>
    <input
      type={type}
      name={name}
      id={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full pl-10 p-3 border rounded-lg shadow-sm focus:ring-2 transition ${
        isInvalid ? 'border-red-500 ring-red-300 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'
      } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      required
      readOnly={readOnly}
    />
  </div>
);

const LOGGED_IN_ONETIME_LIMIT = 1;
const ANONYMOUS_GENERATION_LIMIT = 3;
const ANONYMOUS_REFINEMENT_LIMIT = 5;
const ANONYMOUS_USAGE_KEY = 'la121AnonymousUsage';

interface MainAppViewProps {
    loggedInUser: LoggedInUser | null;
    setLoggedInUser: React.Dispatch<React.SetStateAction<LoggedInUser | null>>;
    onUsageLimit: (isUpgrade: boolean) => void;
}

export const MainAppView: React.FC<MainAppViewProps> = ({ loggedInUser, setLoggedInUser, onUsageLimit }) => {
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '', location: '', targetJobs: '', linkedin: '', referralSource: '', employmentStatus: '' });
  const [cvText, setCvText] = useState<string>('');
  const [jobDescText, setJobDescText] = useState<string>('');
  const [generatedCv, setGeneratedCv] = useState<CvData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState({ step: 0, text: '' });
  const [isLinkedinModalOpen, setLinkedinModalOpen] = useState(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [refinementError, setRefinementError] = useState<string | null>(null);
  
  const [generationCount, setGenerationCount] = useState(0);
  const [refinementCount, setRefinementCount] = useState(0);

  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState<boolean>(false);
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);
  const [isRefiningCoverLetter, setIsRefiningCoverLetter] = useState<boolean>(false);
  const [coverLetterRefinementError, setCoverLetterRefinementError] = useState<string | null>(null);
  
  const [mode, setMode] = useState<'improve' | 'scratch' | 'cover-letter'>('improve');
  const [shouldGenerateCoverLetter, setShouldGenerateCoverLetter] = useState(true);
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('modern');
  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const topOfFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loggedInUser) {
      try {
        const anonUsageRaw = localStorage.getItem(ANONYMOUS_USAGE_KEY);
        if (anonUsageRaw) {
          const anonUsage = JSON.parse(anonUsageRaw);
          if (typeof anonUsage === 'object' && anonUsage !== null) {
            setGenerationCount(anonUsage.generations || 0);
            setRefinementCount(anonUsage.refinements || 0);
          } else if (typeof anonUsage === 'number') { // Legacy support
            setGenerationCount(anonUsage);
            setRefinementCount(0);
          }
        } else {
          setGenerationCount(0);
          setRefinementCount(0);
        }
      } catch {
        setGenerationCount(0);
        setRefinementCount(0);
      }
    } else {
      if (loggedInUser.role === 'onetime' && loggedInUser.usageCount !== undefined) {
        setGenerationCount(loggedInUser.usageCount);
      } else {
        setGenerationCount(0); // Pro/superadmin have no limits
      }
      setRefinementCount(0); // Only anonymous users have refinement counts tracked
    }
  }, [loggedInUser]);

  useEffect(() => {
    // Sync email with login status to ensure correct data is logged.
    setUserInfo(prev => ({ ...prev, email: loggedInUser?.email || '' }));
  }, [loggedInUser]);

  useEffect(() => {
    setGeneratedCv(null);
    setCoverLetter(null);
    setApiError(null);
    setValidationErrors([]);
    setRefinementError(null);
    setCoverLetterError(null);
    setCoverLetterRefinementError(null);
  }, [mode]);

  const cvDisplayRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
    if(validationErrors.includes(name)) {
        setValidationErrors(prev => prev.filter(e => e !== name));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
    if(validationErrors.includes(name)) {
        setValidationErrors(prev => prev.filter(e => e !== name));
    }
  };

  const startProgressSimulation = () => {
    const steps = [
      "Analyzing Profile & Job Description...", "Rewriting Professional Summary...", "Tailoring Work Experience...",
      "Optimizing Skills Section...", "Finalizing Your CV...",
    ];
    let currentStep = 0;
    setProgress({ step: 1, text: steps[0] });
    progressIntervalRef.current = window.setInterval(() => {
      currentStep = (currentStep + 1) % steps.length;
      setProgress({ step: currentStep + 1, text: steps[currentStep] });
    }, 2500);
  };

  const stopProgressSimulation = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgress({ step: 0, text: '' });
  };
  
  const incrementUsage = (type: 'generation' | 'refinement') => {
      if (!loggedInUser) {
        const currentUsageRaw = localStorage.getItem(ANONYMOUS_USAGE_KEY);
        let currentUsage = { generations: 0, refinements: 0 };
        if (currentUsageRaw) {
            try {
                const parsed = JSON.parse(currentUsageRaw);
                if (typeof parsed === 'number') {
                    currentUsage.generations = parsed;
                } else if (typeof parsed === 'object' && parsed !== null) {
                    currentUsage = { ...currentUsage, ...parsed };
                }
            } catch {}
        }

        if (type === 'generation') {
            const newGenCount = currentUsage.generations + 1;
            setGenerationCount(newGenCount);
            localStorage.setItem(ANONYMOUS_USAGE_KEY, JSON.stringify({ ...currentUsage, generations: newGenCount }));
        } else {
            const newRefCount = currentUsage.refinements + 1;
            setRefinementCount(newRefCount);
            localStorage.setItem(ANONYMOUS_USAGE_KEY, JSON.stringify({ ...currentUsage, refinements: newRefCount }));
        }
        return;
      }
      
      if (loggedInUser.role === 'onetime') {
          if (type === 'generation') {
              const newCount = (loggedInUser.usageCount || 0) + 1;
              const updatedUser = { ...loggedInUser, usageCount: newCount };
              setLoggedInUser(updatedUser);
              setGenerationCount(newCount);
              
              const usersRaw = localStorage.getItem('la121Users');
              if (usersRaw) {
                  try {
                      const users = JSON.parse(usersRaw);
                      const userIndex = users.findIndex((u: any) => u.email === loggedInUser.email);
                      if (userIndex !== -1) {
                          users[userIndex].usageCount = newCount;
                          localStorage.setItem('la121Users', JSON.stringify(users));
                      }
                  } catch (e) {
                      console.error("Failed to update user usage in localStorage", e);
                  }
              }
          }
      }
      // No usage tracking for pro/superadmin
  }

  const handleSubmit = useCallback(async () => {
    if (loggedInUser) {
        if (loggedInUser.role === 'onetime' && generationCount >= LOGGED_IN_ONETIME_LIMIT) {
            onUsageLimit(false);
            return;
        }
    } else {
        if (generationCount >= ANONYMOUS_GENERATION_LIMIT) {
            setApiError("You've used your 3 free reviews. Please upgrade to continue.");
            onUsageLimit(false);
            return;
        }
    }

    setApiError(null);
    setCoverLetterError(null);

    const missingFields: string[] = [];
    if (!userInfo.name) missingFields.push("name");
    if (!userInfo.email) missingFields.push("email");
    if (!userInfo.phone) missingFields.push("phone");
    if (!userInfo.location) missingFields.push("location");
    if (!userInfo.targetJobs) missingFields.push("targetJobs");
    if (!userInfo.referralSource) missingFields.push("referralSource");
    if (!userInfo.employmentStatus) missingFields.push("employmentStatus");
    if (!cvText) missingFields.push("cvText");

    if (missingFields.length > 0) {
      setValidationErrors(missingFields);
      setApiError(`Please fill in all required fields to continue.`);
      return;
    }
    setValidationErrors([]);

    setIsLoading(true);
    setGeneratedCv(null);
    setCoverLetter(null);
    startProgressSimulation();

    let newCvData: CvData | null = null;
    try {
      newCvData = await generateTailoredCv(cvText, jobDescText, userInfo);
      setGeneratedCv(newCvData);
      incrementUsage('generation');
      await logSubmissionToGoogleSheet(userInfo);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred. Please try again.';
      setApiError(`Failed to generate CV. ${errorMessage}`);
      setIsLoading(false);
      stopProgressSimulation();
      return;
    }
    
    if (newCvData && (mode === 'improve' || mode === 'scratch') && shouldGenerateCoverLetter) {
      try {
        const clResult = await generateCoverLetter(newCvData, jobDescText, userInfo.targetJobs);
        setCoverLetter(clResult);
      } catch (clError) {
        const errorMessage = clError instanceof Error ? clError.message : 'An unknown error occurred.';
        setCoverLetterError(`Your CV is ready, but the cover letter could not be generated: ${errorMessage}`);
      }
    }

    setIsLoading(false);
    stopProgressSimulation();
  }, [cvText, jobDescText, userInfo, loggedInUser, generationCount, mode, shouldGenerateCoverLetter, onUsageLimit]);

  const handleGenerateStandaloneCoverLetter = useCallback(async () => {
     if (loggedInUser) {
        if (loggedInUser.role === 'onetime' && generationCount >= LOGGED_IN_ONETIME_LIMIT) {
            onUsageLimit(false);
            return;
        }
    } else {
        if (generationCount >= ANONYMOUS_GENERATION_LIMIT) {
            setApiError("You've used your 3 free reviews. Please upgrade to continue.");
            onUsageLimit(false);
            return;
        }
    }

    setApiError(null);
    const missingFields: string[] = [];
    if (!userInfo.name) missingFields.push("name");
    if (!userInfo.email) missingFields.push("email");
    if (!userInfo.phone) missingFields.push("phone");
    if (!userInfo.location) missingFields.push("location");
    if (!userInfo.targetJobs) missingFields.push("targetJobs");
    if (!userInfo.referralSource) missingFields.push("referralSource");
    if (!userInfo.employmentStatus) missingFields.push("employmentStatus");
    if (!cvText) missingFields.push("cvText");
    if (!jobDescText) missingFields.push("jobDescText");
    if (missingFields.length > 0) {
      setValidationErrors(missingFields);
      setApiError(`Please fill in all required fields to continue.`);
      return;
    }
    setValidationErrors([]);

    setIsLoading(true);
    setCoverLetter(null);
    
    try {
      const result = await generateCoverLetterFromText(cvText, jobDescText, { name: userInfo.name, targetJobs: userInfo.targetJobs });
      setCoverLetter(result);
      incrementUsage('generation');
      await logSubmissionToGoogleSheet(userInfo);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred. Please try again.';
      setApiError(`Failed to generate Cover Letter. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [cvText, jobDescText, userInfo, loggedInUser, generationCount, onUsageLimit]);

  const handleCvRefinement = async (prompt: string) => {
    if (!generatedCv) return;

    if (loggedInUser) {
      if (loggedInUser.role === 'onetime') {
        setRefinementError("Refinements are a Pro feature. Please upgrade for unlimited editing.");
        onUsageLimit(true);
        return;
      }
    } else {
      if (refinementCount >= ANONYMOUS_REFINEMENT_LIMIT) {
        setRefinementError("You've used all your free refinements. Please upgrade for unlimited editing.");
        onUsageLimit(false);
        return;
      }
    }

    setIsRefining(true);
    setRefinementError(null);

    try {
      const refinedResult = await refineCv(generatedCv, prompt);
      setGeneratedCv(refinedResult);
      if (!loggedInUser) {
        incrementUsage('refinement');
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown refinement error occurred.';
      setRefinementError(errorMessage);
    } finally {
      setIsRefining(false);
    }
  };
  
  const handleManualGenerateCoverLetter = async () => {
    if (!generatedCv) return;
    
    // Duplicating usage check here for this specific action
    if (loggedInUser) {
        if (loggedInUser.role === 'onetime' && generationCount >= LOGGED_IN_ONETIME_LIMIT) {
            onUsageLimit(false);
            return;
        }
    } else {
        if (generationCount >= ANONYMOUS_GENERATION_LIMIT) {
            setApiError("You've used your 3 free reviews. Please upgrade to continue.");
            onUsageLimit(false);
            return;
        }
    }

    setIsGeneratingCoverLetter(true);
    setCoverLetterError(null);
    setCoverLetter(null);

    try {
        const result = await generateCoverLetter(generatedCv, jobDescText, userInfo.targetJobs);
        setCoverLetter(result);
        incrementUsage('generation'); // This action also counts as a generation
        await logSubmissionToGoogleSheet(userInfo);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setCoverLetterError(errorMessage);
    } finally {
        setIsGeneratingCoverLetter(false);
    }
  };

  const handleCoverLetterRefinement = async (prompt: string) => {
    if (!coverLetter) return;

    if (loggedInUser) {
      if (loggedInUser.role === 'onetime') {
        setCoverLetterRefinementError("Refinements are a Pro feature. Please upgrade for unlimited editing.");
        onUsageLimit(true);
        return;
      }
    } else {
      if (refinementCount >= ANONYMOUS_REFINEMENT_LIMIT) {
        setCoverLetterRefinementError("You've used all your free refinements. Please upgrade for unlimited editing.");
        onUsageLimit(false);
        return;
      }
    }
    
    setIsRefiningCoverLetter(true);
    setCoverLetterRefinementError(null);

    try {
        const refinedResult = await refineCoverLetter(coverLetter, prompt);
        setCoverLetter(refinedResult);
        if (!loggedInUser) {
            incrementUsage('refinement');
        }
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown refinement error occurred.';
        setCoverLetterRefinementError(errorMessage);
    } finally {
        setIsRefiningCoverLetter(false);
    }
  };

  const handleEditInputs = () => {
    setGeneratedCv(null);
    setCoverLetter(null);
    setApiError(null);
    setValidationErrors([]);
    setRefinementError(null);
    setCoverLetterError(null);
    setCoverLetterRefinementError(null);
    topOfFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const showLoggedInUsageTracker = loggedInUser && loggedInUser.role === 'onetime';
  const showAnonymousUsageTracker = !loggedInUser && (generationCount < ANONYMOUS_GENERATION_LIMIT || refinementCount < ANONYMOUS_REFINEMENT_LIMIT);
  
  const ModeSelector = () => (
    <div className="flex justify-center mb-8">
      <div className="bg-gray-200 rounded-full p-1 flex space-x-1">
        <button
          onClick={() => setMode('improve')}
          className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${
            mode === 'improve' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-300'
          }`}
        >
          Improve CV
        </button>
        <button
          onClick={() => setMode('scratch')}
          className={`px-6 py-2 text-sm font-semibold rounded-full transition-colors ${
            mode === 'scratch' ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-300'
          }`}
        >
          Build CV
        </button>
      </div>
    </div>
  );

  const mainButtonText = "Generate CV";
      
  const mainButtonAction = mode === 'cover-letter' ? handleGenerateStandaloneCoverLetter : handleSubmit;

  const canRefine = !loggedInUser || loggedInUser.role === 'pro' || loggedInUser.role === 'superadmin';

  return (
    <>
      <div ref={topOfFormRef} className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get Your AI-Powered Application in Minutes
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our AI expert tailors your resume and writes your cover letter to perfection.
          </p>
        </div>
        
        <HowItWorks />

        {showLoggedInUsageTracker && (
             <UsageTracker 
                generationCount={generationCount}
                refinementCount={0}
                generationLimit={LOGGED_IN_ONETIME_LIMIT}
                refinementLimit={0}
             />
        )}
        {showAnonymousUsageTracker && (
             <UsageTracker 
                generationCount={generationCount}
                refinementCount={refinementCount}
                generationLimit={ANONYMOUS_GENERATION_LIMIT}
                refinementLimit={ANONYMOUS_REFINEMENT_LIMIT}
             />
        )}
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 1: Tell Us About You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoInput name="name" placeholder="Full Name" value={userInfo.name} icon={<User className="h-5 w-5 text-gray-400" />} onChange={handleUserInfoChange} isInvalid={validationErrors.includes('name')} />
            <InfoInput name="email" placeholder="Email Address" value={userInfo.email} icon={<Mail className="h-5 w-5 text-gray-400" />} type="email" onChange={handleUserInfoChange} isInvalid={validationErrors.includes('email')} readOnly={!!loggedInUser} />
            <InfoInput name="phone" placeholder="Phone Number" value={userInfo.phone} icon={<Phone className="h-5 w-5 text-gray-400" />} type="tel" onChange={handleUserInfoChange} isInvalid={validationErrors.includes('phone')} />
            <InfoInput name="location" placeholder="Your Location (e.g. London, UK)" value={userInfo.location} icon={<MapPin className="h-5 w-5 text-gray-400" />} onChange={handleUserInfoChange} isInvalid={validationErrors.includes('location')} />
            <InfoInput name="targetJobs" placeholder="What job are you looking for?" value={userInfo.targetJobs} icon={<Briefcase className="h-5 w-5 text-gray-400" />} onChange={handleUserInfoChange} isInvalid={validationErrors.includes('targetJobs')}/>
            <InfoInput name="linkedin" placeholder="LinkedIn Profile URL (optional)" value={userInfo.linkedin} icon={<Linkedin className="h-5 w-5 text-gray-400" />} onChange={handleUserInfoChange}/>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HelpCircle className="h-5 w-5 text-gray-400" />
                </div>
                <select
                    name="referralSource"
                    id="referralSource"
                    value={userInfo.referralSource}
                    onChange={handleSelectChange}
                    className={`w-full pl-10 p-3 border rounded-lg shadow-sm focus:ring-2 transition ${
                        validationErrors.includes('referralSource') ? 'border-red-500 ring-red-300 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'
                    } ${!userInfo.referralSource ? 'text-gray-500' : 'text-gray-900'}`}
                    required
                >
                    <option value="" disabled>How did you hear about us?*</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Word of Mouth / Friend">Word of Mouth / Friend</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <select
                    name="employmentStatus"
                    id="employmentStatus"
                    value={userInfo.employmentStatus}
                    onChange={handleSelectChange}
                    className={`w-full pl-10 p-3 border rounded-lg shadow-sm focus:ring-2 transition ${
                        validationErrors.includes('employmentStatus') ? 'border-red-500 ring-red-300 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary'
                    } ${!userInfo.employmentStatus ? 'text-gray-500' : 'text-gray-900'}`}
                    required
                >
                    <option value="" disabled>Current Employment Status*</option>
                    <option value="Employed">Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Student">Student</option>
                    <option value="Open to work">Open to work</option>
                    <option value="Other">Other</option>
                </select>
            </div>
          </div>
        </div>
        
        <ModeSelector />

        {(mode === 'improve') && (
           <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8 animate-fadeIn">
             <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 2: Provide Your Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <FileUpload label="Your Current CV" onFileRead={(text) => {
                      setCvText(text);
                      if (validationErrors.includes('cvText')) setValidationErrors(p => p.filter(e => e !== 'cvText'));
                  }} isInvalid={validationErrors.includes('cvText')} />
                  <TextAreaInput
                    id="cv-input"
                    value={cvText}
                    onChange={(e) => {
                        setCvText(e.target.value);
                        if (validationErrors.includes('cvText')) setValidationErrors(p => p.filter(e => e !== 'cvText'));
                    }}
                    rows={15}
                    placeholder="...or paste your CV text here."
                    isInvalid={validationErrors.includes('cvText')}
                  />
                </div>
                <div>
                  <FileUpload label="Job Description" onFileRead={(text) => {
                      setJobDescText(text);
                      if (validationErrors.includes('jobDescText')) setValidationErrors(p => p.filter(e => e !== 'jobDescText'));
                  }} isInvalid={validationErrors.includes('jobDescText')} />
                   <div className="flex items-center my-3">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="flex-shrink mx-4 text-sm font-semibold text-gray-500">OR</span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                  <button
                    onClick={() => setLinkedinModalOpen(true)}
                    className="w-full flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition"
                  >
                    <Linkedin className="h-5 w-5 mr-2 text-[#0077B5]" />
                    Import from LinkedIn
                  </button>
                  <TextAreaInput
                    id="job-desc-input"
                    value={jobDescText}
                    onChange={(e) => {
                        setJobDescText(e.target.value);
                        if (validationErrors.includes('jobDescText')) setValidationErrors(p => p.filter(e => e !== 'jobDescText'));
                    }}
                    rows={15}
                    placeholder="...or paste the job description text here."
                    isInvalid={validationErrors.includes('jobDescText')}
                  />
                </div>
              </div>
           </div>
        )}

        {mode === 'scratch' && (
            <CvBuilderForm onCvUpdate={setCvText} onJdUpdate={setJobDescText} />
        )}
        
        {(mode === 'improve' || mode === 'scratch') && (
          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center">
              <input
                  type="checkbox"
                  id="shouldGenerateCoverLetter"
                  checked={shouldGenerateCoverLetter}
                  onChange={(e) => setShouldGenerateCoverLetter(e.target.checked)}
                  className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="shouldGenerateCoverLetter" className="ml-3 block text-md font-semibold text-gray-700 cursor-pointer">
                  Generate cover letter
              </label>
          </div>
        )}

        <div className="text-center mt-8">
            <Button
                onClick={mainButtonAction}
                disabled={isLoading || (mode !== 'cover-letter' && (!cvText || !userInfo.name || !userInfo.email || !userInfo.phone))}
            >
                {isLoading ? (
                    <>
                        <Spinner /> Generating...
                    </>
                ) : (
                    <>
                        <Sparkles className="mr-2 h-6 w-6" /> {mainButtonText}
                    </>
                )}
            </Button>
        </div>

        {apiError && (
          <div className="mt-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-bold flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Action Required
            </p>
            <p>{apiError}</p>
          </div>
        )}
        
        {isLoading && progress.step > 0 && (
          <div className="mt-8">
            <ProgressBar steps={5} currentStep={progress.step} currentText={progress.text} />
          </div>
        )}
      </div>

      {(generatedCv || coverLetter) && !isLoading && (
        <div className="mt-12 bg-gray-100 p-4 sm:p-8 rounded-2xl w-full">
           <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Your AI-Generated Documents</h2>

          {generatedCv && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
               <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
                 <h3 className="text-2xl font-bold text-gray-800 mb-3 sm:mb-0">Your Tailored CV</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                          onClick={handleEditInputs}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                          <Edit3 className="mr-2 h-5 w-5" />
                          Edit Inputs
                      </button>
                      <DownloadButtons cvData={generatedCv} cvContainerRef={cvDisplayRef} />
                  </div>
               </div>
               
               <LayoutSelector selectedLayout={selectedLayout} onSelectLayout={setSelectedLayout} />

               <CvDisplay cvData={generatedCv} ref={cvDisplayRef} layout={selectedLayout} />
               
               {!coverLetter && (
                  <div className="mt-6 text-center">
                    <button
                        onClick={handleManualGenerateCoverLetter}
                        disabled={isGeneratingCoverLetter}
                        className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-white font-bold text-lg rounded-lg shadow-lg hover:bg-secondary-hover focus:outline-none focus:ring-4 focus:ring-orange-300 transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isGeneratingCoverLetter ? <Spinner/> : <MessageSquare className="mr-2 h-5 w-5"/>}
                        Generate Cover Letter
                    </button>
                    {coverLetterError && <p className="text-red-600 mt-2 text-sm">{coverLetterError}</p>}
                  </div>
               )}
               
               {canRefine && <CvEditor onRefine={handleCvRefinement} isRefining={isRefining} error={refinementError} />}
            </div>
          )}

           {coverLetter && (
                <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Cover Letter</h3>
                    <CoverLetterDisplay coverLetterText={coverLetter} userName={userInfo.name} />
                    {canRefine && <CoverLetterEditor onRefine={handleCoverLetterRefinement} isRefining={isRefiningCoverLetter} error={coverLetterRefinementError} />}
                </div>
            )}
            
            <div className="mt-12 text-center">
                 <Button onClick={() => setFeedbackModalOpen(true)}>
                    Provide Feedback
                 </Button>
            </div>
        </div>
      )}
      
      {isLinkedinModalOpen && (
        <LinkedInImporter
          onClose={() => setLinkedinModalOpen(false)}
          onImport={(text) => {
            setJobDescText(text);
            setLinkedinModalOpen(false);
          }}
        />
      )}
      
      {isFeedbackModalOpen && (
        <FeedbackModal onClose={() => setFeedbackModalOpen(false)} />
      )}
    </>
  );
};
