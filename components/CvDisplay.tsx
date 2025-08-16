import React, { forwardRef } from 'react';
import type { CvData } from '../types';
import { Mail, Phone, Linkedin, Github, Globe, MapPin, Calendar, Link as LinkIcon, Award, Briefcase, Book, Users, Star, Languages, FileText } from 'lucide-react';

export type LayoutType = 'classic' | 'modern' | 'compact';

interface CvDisplayProps {
  cvData: CvData;
  layout: LayoutType;
}

interface LayoutComponentProps {
    cvData: CvData;
}

// Reusable components for different layouts
const ContactItem: React.FC<{ icon: React.ReactNode; text?: string; link?: string, className?: string }> = ({ icon, text, link, className = "text-sm text-gray-600" }) => {
  if (!text && !link) return null;
  const content = link ? <a href={link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{text || link}</a> : <span>{text}</span>;
  return (
    <div className={`flex items-center ${className}`}>
        {icon}
        {content}
    </div>
  );
};

const CvSection: React.FC<{ title: string; children: React.ReactNode, className?: string, titleClassName?: string }> = ({ title, children, className = "mb-6", titleClassName="text-xl font-bold text-primary border-b-2 border-primary-light pb-2 mb-4" }) => (
    <div className={className}>
        <h2 className={titleClassName}>{title}</h2>
        {children}
    </div>
);

// --- Layout Implementations ---

// 1. Classic Layout (Original)
const ClassicLayout: React.FC<LayoutComponentProps> = ({ cvData }) => (
    <div className="p-8">
        <header className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900">{cvData.fullName}</h1>
            <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-2 mt-3">
                <ContactItem icon={<Mail className="w-4 h-4 mr-2"/>} text={cvData.email} link={`mailto:${cvData.email}`} />
                <ContactItem icon={<Phone className="w-4 h-4 mr-2"/>} text={cvData.phone} link={`tel:${cvData.phone}`} />
                {cvData.linkedin && <ContactItem icon={<Linkedin className="w-4 h-4 mr-2"/>} text={cvData.linkedin} link={cvData.linkedin} />}
                {cvData.github && <ContactItem icon={<Github className="w-4 h-4 mr-2"/>} text={cvData.github} link={cvData.github} />}
                {cvData.website && <ContactItem icon={<Globe className="w-4 h-4 mr-2"/>} text={cvData.website} link={cvData.website} />}
            </div>
        </header>

        <CvSection title="Professional Summary">
            <p className="text-gray-700 leading-relaxed">{cvData.summary}</p>
        </CvSection>

        <CvSection title="Work Experience">
            {cvData.experience.map((exp, index) => (
                <div key={index} className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-800">{exp.jobTitle}</h3>
                    <div className="flex justify-between items-baseline text-md font-medium text-gray-600">
                        <span>{exp.company}</span>
                        <div className="flex items-center text-sm"> <MapPin className="w-3.5 h-3.5 mr-1.5"/> <span>{exp.location}</span> </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2"> <Calendar className="w-3.5 h-3.5 mr-1.5"/><span>{exp.dates}</span> </div>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 pl-2">
                        {exp.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                    </ul>
                </div>
            ))}
        </CvSection>
        
        {cvData.projects && cvData.projects.length > 0 && (
          <CvSection title="Projects">
            {cvData.projects.map((proj, index) => (
              <div key={index} className="mb-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">{proj.name}</h3>
                    {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center"><LinkIcon className="w-3.5 h-3.5 mr-1"/> View Project</a>}
                </div>
                {proj.technologies && <p className="text-sm font-medium text-gray-500 mb-1">{proj.technologies.join(' · ')}</p>}
                <p className="text-gray-700 leading-relaxed">{proj.description}</p>
              </div>
            ))}
          </CvSection>
        )}

        <CvSection title="Skills">
            <div className="space-y-2">
                {Object.entries(cvData.skills).map(([category, skills]) => (
                    skills.length > 0 && (
                        <div key={category}>
                            <h4 className="font-semibold text-md text-gray-700">{category}:</h4>
                            <p className="text-gray-600">{skills.join(', ')}</p>
                        </div>
                    )
                ))}
            </div>
        </CvSection>

        <CvSection title="Education">
            {cvData.education.map((edu, index) => (
                <div key={index} className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
                    <p className="font-medium text-gray-600">{edu.university}</p>
                    <p className="text-sm text-gray-500">{edu.dates}</p>
                </div>
            ))}
        </CvSection>

        {cvData.leadership && cvData.leadership.length > 0 && (
            <CvSection title="Leadership & Extracurriculars">
                {cvData.leadership.map((lead, index) => (
                    <div key={index} className="mb-5">
                        <h3 className="text-lg font-semibold text-gray-800">{lead.role}</h3>
                        <p className="text-md font-medium text-gray-600">{lead.organization}</p>
                        <p className="text-sm text-gray-500 mb-2">{lead.dates}</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 pl-2">
                            {lead.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                        </ul>
                    </div>
                ))}
            </CvSection>
        )}

        {cvData.awards && cvData.awards.length > 0 && (
            <CvSection title="Awards & Achievements">
                {cvData.awards.map((award, index) => (
                    <div key={index} className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">{award.name}</h3>
                        <p className="text-md font-medium text-gray-600">{award.awardedBy} - {award.date}</p>
                        {award.summary && <p className="text-gray-700 mt-1">{award.summary}</p>}
                    </div>
                ))}
            </CvSection>
        )}

        {cvData.certifications && cvData.certifications.length > 0 && (
            <CvSection title="Certifications">
                 {cvData.certifications.map((cert, index) => (
                    <div key={index} className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">{cert.name}</h3>
                        <p className="font-medium text-gray-600">{cert.issuer} - {cert.date}</p>
                    </div>
                ))}
            </CvSection>
        )}
        
        {cvData.publications && cvData.publications.length > 0 && (
            <CvSection title="Publications">
                {cvData.publications.map((pub, index) => (
                    <div key={index} className="mb-4">
                         <h3 className="text-lg font-semibold text-gray-800 flex items-center">{pub.title} {pub.link && <a href={pub.link} target="_blank" rel="noopener noreferrer"><LinkIcon className="w-4 h-4 ml-2 text-primary"/></a>}</h3>
                         <p className="text-md font-medium text-gray-600">{pub.journal} - {pub.date}</p>
                         <p className="text-sm text-gray-500">Authors: {pub.authors.join(', ')}</p>
                    </div>
                ))}
            </CvSection>
        )}
        
        {cvData.languages && cvData.languages.length > 0 && (
            <CvSection title="Languages">
                <p className="text-gray-700">
                    {cvData.languages.map(lang => `${lang.language} (${lang.proficiency})`).join(' · ')}
                </p>
            </CvSection>
        )}

        <CvSection title="References">
            <p className="text-gray-700 italic">{cvData.references}</p>
        </CvSection>
    </div>
);

// 2. Modern Layout (Two-Column)
const ModernLayout: React.FC<LayoutComponentProps> = ({ cvData }) => (
    <div className="flex min-h-full">
        <aside className="w-1/3 bg-gray-100 p-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{cvData.fullName}</h1>
            <div className="space-y-3 mb-8">
                <ContactItem icon={<Mail className="w-4 h-4 mr-2"/>} text={cvData.email} link={`mailto:${cvData.email}`} />
                <ContactItem icon={<Phone className="w-4 h-4 mr-2"/>} text={cvData.phone} link={`tel:${cvData.phone}`} />
                {cvData.linkedin && <ContactItem icon={<Linkedin className="w-4 h-4 mr-2"/>} text="LinkedIn" link={cvData.linkedin} />}
                {cvData.github && <ContactItem icon={<Github className="w-4 h-4 mr-2"/>} text="GitHub" link={cvData.github} />}
                {cvData.website && <ContactItem icon={<Globe className="w-4 h-4 mr-2"/>} text="Website" link={cvData.website} />}
            </div>
            
             <CvSection title="Skills" className="mb-6" titleClassName="text-lg font-bold text-primary border-b-2 border-primary-light pb-1 mb-3">
                <div className="space-y-3">
                    {Object.entries(cvData.skills).map(([category, skills]) => (
                        skills.length > 0 && (
                            <div key={category} className="text-sm">
                                <h4 className="font-semibold text-gray-700">{category}</h4>
                                <p className="text-gray-600 leading-snug">{skills.join(', ')}</p>
                            </div>
                        )
                    ))}
                </div>
            </CvSection>

            <CvSection title="Education" className="mb-6" titleClassName="text-lg font-bold text-primary border-b-2 border-primary-light pb-1 mb-3">
                {cvData.education.map((edu, index) => (
                    <div key={index} className="mb-3 text-sm">
                        <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                        <p className="text-gray-600">{edu.university}</p>
                        <p className="text-xs text-gray-500">{edu.dates}</p>
                    </div>
                ))}
            </CvSection>
            
            {cvData.certifications && cvData.certifications.length > 0 && (
                 <CvSection title="Certifications" className="mb-6" titleClassName="text-lg font-bold text-primary border-b-2 border-primary-light pb-1 mb-3">
                    {cvData.certifications.map((cert, index) => (
                        <div key={index} className="mb-3 text-sm">
                            <h3 className="font-semibold text-gray-800">{cert.name}</h3>
                            <p className="text-gray-600">{cert.issuer}</p>
                            <p className="text-xs text-gray-500">{cert.date}</p>
                        </div>
                    ))}
                </CvSection>
            )}

            {cvData.languages && cvData.languages.length > 0 && (
                 <CvSection title="Languages" className="mb-6" titleClassName="text-lg font-bold text-primary border-b-2 border-primary-light pb-1 mb-3">
                     <div className="space-y-1 text-sm">
                        {cvData.languages.map((lang, index) => (
                            <div key={index} className="flex justify-between">
                                <span className="text-gray-700">{lang.language}</span>
                                <span className="text-gray-500 font-medium">{lang.proficiency}</span>
                            </div>
                        ))}
                     </div>
                </CvSection>
            )}
        </aside>

        <main className="w-2/3 p-8">
             <CvSection title="Professional Summary" className="mb-6" titleClassName="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                <p className="text-gray-700 leading-relaxed text-sm">{cvData.summary}</p>
            </CvSection>
            
            <CvSection title="Work Experience" className="mb-6" titleClassName="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                {cvData.experience.map((exp, index) => (
                    <div key={index} className="mb-5">
                        <h3 className="text-lg font-semibold text-gray-800">{exp.jobTitle}</h3>
                        <div className="flex justify-between items-baseline text-md font-medium text-gray-600">
                            <span>{exp.company}</span>
                            <div className="flex items-center text-sm"> <MapPin className="w-3.5 h-3.5 mr-1.5"/> <span>{exp.location}</span> </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-2"> <Calendar className="w-3.5 h-3.5 mr-1.5"/><span>{exp.dates}</span> </div>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 pl-2 text-sm">
                            {exp.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                        </ul>
                    </div>
                ))}
            </CvSection>

            {cvData.projects && cvData.projects.length > 0 && (
                <CvSection title="Projects" className="mb-6" titleClassName="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                    {cvData.projects.map((proj, index) => (
                        <div key={index} className="mb-5 text-sm">
                             <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">{proj.name}</h3>
                                {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center"><LinkIcon className="w-3.5 h-3.5 mr-1"/> View</a>}
                            </div>
                             {proj.technologies && <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{proj.technologies.join(' · ')}</p>}
                             <p className="text-gray-700 leading-relaxed">{proj.description}</p>
                        </div>
                    ))}
                </CvSection>
            )}

            {cvData.leadership && cvData.leadership.length > 0 && (
                 <CvSection title="Leadership" className="mb-6" titleClassName="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                    {cvData.leadership.map((lead, index) => (
                        <div key={index} className="mb-5">
                            <h3 className="text-lg font-semibold text-gray-800">{lead.role}</h3>
                             <p className="text-md font-medium text-gray-600">{lead.organization} <span className="text-sm text-gray-500">| {lead.dates}</span></p>
                            <ul className="list-disc list-inside space-y-1 text-gray-700 pl-2 text-sm mt-1">
                                {lead.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                            </ul>
                        </div>
                    ))}
                </CvSection>
            )}

            {cvData.awards && cvData.awards.length > 0 && (
                <CvSection title="Awards" className="mb-6" titleClassName="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                    {cvData.awards.map((award, index) => (
                        <div key={index} className="mb-4 text-sm">
                             <h3 className="text-md font-semibold text-gray-800">{award.name}</h3>
                             <p className="text-gray-600">{award.awardedBy} - {award.date}</p>
                             {award.summary && <p className="text-gray-700 mt-1">{award.summary}</p>}
                        </div>
                    ))}
                </CvSection>
            )}

            <CvSection title="References" className="mb-6" titleClassName="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                <p className="text-gray-700 italic text-sm">{cvData.references}</p>
            </CvSection>
        </main>
    </div>
);

// 3. Compact Layout (Space-saving)
const CompactLayout: React.FC<LayoutComponentProps> = ({ cvData }) => (
    <div className="p-6 text-sm">
        <header className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{cvData.fullName}</h1>
            <div className="flex justify-center items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">
                <ContactItem icon={<Mail className="w-3.5 h-3.5 mr-1.5"/>} text={cvData.email} link={`mailto:${cvData.email}`} className="text-gray-600"/>
                <ContactItem icon={<Phone className="w-3.5 h-3.5 mr-1.5"/>} text={cvData.phone} link={`tel:${cvData.phone}`} className="text-gray-600"/>
                {cvData.linkedin && <ContactItem icon={<Linkedin className="w-3.5 h-3.5 mr-1.5"/>} text="LinkedIn" link={cvData.linkedin} className="text-gray-600"/>}
                {cvData.github && <ContactItem icon={<Github className="w-3.5 h-3.5 mr-1.5"/>} text="GitHub" link={cvData.github} className="text-gray-600"/>}
                {cvData.website && <ContactItem icon={<Globe className="w-3.5 h-3.5 mr-1.5"/>} text="Website" link={cvData.website} className="text-gray-600"/>}
            </div>
        </header>

        <div className="flex gap-x-6">
            <main className="w-[65%]">
                <CvSection title="Professional Summary" className="mb-4" titleClassName="text-lg font-bold text-primary border-b-2 border-primary-light pb-1 mb-2">
                    <p className="text-gray-700 leading-normal">{cvData.summary}</p>
                </CvSection>
                <CvSection title="Work Experience" className="mb-4" titleClassName="text-lg font-bold text-primary border-b-2 border-primary-light pb-1 mb-2">
                    {cvData.experience.map((exp, index) => (
                        <div key={index} className="mb-4">
                            <h3 className="text-md font-semibold text-gray-800">{exp.jobTitle}</h3>
                            <p className="font-medium text-gray-600">{exp.company}</p>
                            <div className="flex justify-between items-baseline text-xs text-gray-500 mb-1">
                                <span><MapPin className="w-3 h-3 mr-1 inline"/>{exp.location}</span>
                                <span><Calendar className="w-3 h-3 mr-1 inline"/>{exp.dates}</span>
                            </div>
                            <ul className="list-disc list-inside space-y-0.5 text-gray-700 pl-2">
                                {exp.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                            </ul>
                        </div>
                    ))}
                </CvSection>
                {cvData.projects && cvData.projects.length > 0 && (
                    <CvSection title="Projects" className="mb-4" titleClassName="text-lg font-bold text-primary border-b-2 border-primary-light pb-1 mb-2">
                        {cvData.projects.map((proj, index) => (
                            <div key={index} className="mb-4">
                                 <h3 className="text-md font-semibold text-gray-800">{proj.name}</h3>
                                 {proj.technologies && <p className="text-xs font-semibold text-gray-500 mb-1">{proj.technologies.join(' · ')}</p>}
                                 <p className="text-gray-700 leading-normal">{proj.description}</p>
                            </div>
                        ))}
                    </CvSection>
                )}
            </main>
            <aside className="w-[35%]">
                 <CvSection title="Skills" className="mb-4" titleClassName="text-lg font-bold text-primary border-b-2 border-primary-light pb-1 mb-2">
                    <div className="space-y-2">
                        {Object.entries(cvData.skills).map(([category, skills]) => (
                            skills.length > 0 && (
                                <div key={category}>
                                    <h4 className="font-semibold text-gray-700 text-xs uppercase tracking-wider">{category}</h4>
                                    <p className="text-gray-600 leading-snug">{skills.join(', ')}</p>
                                </div>
                            )
                        ))}
                    </div>
                </CvSection>
                <CvSection title="Education" className="mb-4" titleClassName="text-lg font-bold text-primary border-b-2 border-primary-light pb-1 mb-2">
                    {cvData.education.map((edu, index) => (
                        <div key={index} className="mb-2">
                            <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                            <p className="text-gray-600">{edu.university}</p>
                            <p className="text-xs text-gray-500">{edu.dates}</p>
                        </div>
                    ))}
                </CvSection>
                {cvData.awards && cvData.awards.length > 0 && (
                     <CvSection title="Awards" className="mb-4" titleClassName="text-lg font-bold text-primary border-b-2 border-primary-light pb-1 mb-2">
                        {cvData.awards.map((award, index) => (
                            <div key={index} className="mb-2">
                                <h3 className="font-semibold text-gray-800">{award.name}</h3>
                                <p className="text-gray-600 text-xs">{award.awardedBy} - {award.date}</p>
                            </div>
                        ))}
                    </CvSection>
                )}
                <CvSection title="References" className="mb-4" titleClassName="text-lg font-bold text-primary border-b-2 border-primary-light pb-1 mb-2">
                    <p className="text-gray-700 italic">{cvData.references}</p>
                </CvSection>
            </aside>
        </div>
    </div>
);


export const CvDisplay = forwardRef<HTMLDivElement, CvDisplayProps>(({ cvData, layout }, ref) => {
    const renderLayout = () => {
        switch (layout) {
            case 'modern':
                return <ModernLayout cvData={cvData} />;
            case 'compact':
                return <CompactLayout cvData={cvData} />;
            case 'classic':
            default:
                return <ClassicLayout cvData={cvData} />;
        }
    };
    
    return (
        <div ref={ref} className="bg-white font-sans text-gray-800 printable-area shadow-lg border border-gray-200">
           {renderLayout()}
        </div>
    );
});
