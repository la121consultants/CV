
import React from 'react';
import { Target, User, Edit3, Sparkles, Download, Youtube } from 'lucide-react';

const Step: React.FC<{ icon: React.ReactNode; title: string; description: string; stepNumber: number }> = ({ icon, title, description, stepNumber }) => (
  <div className="flex flex-col items-center text-center">
    <div className="relative mb-4">
      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary-light text-primary border-2 border-primary">
        {icon}
      </div>
      <div className="absolute -top-2 -right-2 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-bold text-lg">
        {stepNumber}
      </div>
    </div>
    <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
    <p className="text-gray-600 text-sm max-w-xs">{description}</p>
  </div>
);

export const HowItWorks: React.FC = () => {
  return (
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
      <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
        Follow these steps to create job-winning application documents. You get 3 free CV reviews, after which a subscription is required to continue.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
        <Step 
          stepNumber={1}
          icon={<Target className="h-10 w-10" />}
          title="Choose Your Goal"
          description="Select whether to improve a CV, build one from scratch, or write a standalone cover letter."
        />
        <Step 
          stepNumber={2}
          icon={<User className="h-10 w-10" />}
          title="Provide Your Info"
          description="Fill in your contact details and the specific job you are targeting."
        />
        <Step 
          stepNumber={3}
          icon={<Edit3 className="h-10 w-10" />}
          title="Add Content"
          description="Upload or paste your existing CV and the relevant job description."
        />
        <Step 
          stepNumber={4}
          icon={<Sparkles className="h-10 w-10" />}
          title="Generate with AI"
          description="Let our AI craft, tailor, and enhance your professional documents in seconds."
        />
        <Step 
          stepNumber={5}
          icon={<Download className="h-10 w-10" />}
          title="Download & Apply"
          description="Your tailored CV and cover letter are ready to download in PDF or Word."
        />
      </div>
      
      <div className="mt-20 pt-16 border-t border-gray-200">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Watch It in Action</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
          See a step-by-step guide on how to get the most out of our AI CV tailoring tool.
        </p>
        <div className="max-w-4xl mx-auto bg-black rounded-xl shadow-2xl overflow-hidden border-4 border-white">
          <div className="aspect-video">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/sOka_itBf30?rel=0"
              title="LA121 AI CV Tool Tutorial"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-gray-700 mb-3">
            Enjoyed the video? We have more tips and tutorials on our channel.
          </p>
          <a
            href="https://youtube.com/@la121consultants?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Youtube className="mr-2 h-6 w-6" />
            Subscribe on YouTube
          </a>
        </div>
      </div>
    </div>
  );
};
