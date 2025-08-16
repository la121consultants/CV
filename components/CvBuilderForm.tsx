import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Briefcase, Building, MapPin, Calendar, BookOpen, School, GraduationCap, Lightbulb, Link as LinkIcon, Award, Users, Star, Languages, Book as BookIcon, FileText } from 'lucide-react';
import { TextAreaInput } from './TextAreaInput';
import { FileUpload } from './FileUpload';
import type { Experience, Education, Skills, Project, Certification, Award as AwardType, Leadership, Publication, Language } from '../types';

interface CvBuilderFormProps {
  onCvUpdate: (cvText: string) => void;
  onJdUpdate: (jdText: string) => void;
}

const initialExperience: Experience = { jobTitle: '', company: '', location: '', dates: '', responsibilities: [''] };
const initialEducation: Education = { degree: '', university: '', dates: '' };
const initialProject: Project = { name: '', description: '', technologies: [], link: '' };
const initialCertification: Certification = { name: '', issuer: '', date: '' };
const initialAward: AwardType = { name: '', awardedBy: '', date: '', summary: '' };
const initialLeadership: Leadership = { role: '', organization: '', dates: '', responsibilities: [''] };
const initialPublication: Publication = { title: '', authors: [], journal: '', date: '', link: '' };
const initialLanguage: Language = { language: '', proficiency: '' };


const Section: React.FC<{ title: string; children: React.ReactNode, icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="p-6 rounded-lg border border-gray-200 bg-gray-50/50">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">{icon}<span className="ml-2">{title}</span></h3>
        {children}
    </div>
);

const InputField: React.FC<{
  name: string;
  placeholder: string;
  value: string;
  icon: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ name, placeholder, value, icon, onChange }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-10 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition bg-white"
    />
  </div>
);

const formatCvDataToString = (
  summary: string,
  experiences: Experience[],
  educations: Education[],
  skills: Skills,
  projects: Project[],
  certifications: Certification[],
  awards: AwardType[],
  leadership: Leadership[],
  publications: Publication[],
  languages: Language[],
  references: string
): string => {
  let cvString = '';
  if (summary.trim()) cvString += `## Professional Summary\n${summary.trim()}\n\n`;
  if (experiences.some(e => e.jobTitle.trim())) {
    cvString += `## Work Experience\n`;
    experiences.forEach(exp => {
      if (exp.jobTitle.trim()) {
        cvString += `Job Title: ${exp.jobTitle}\nCompany: ${exp.company}\nLocation: ${exp.location}\nDates: ${exp.dates}\n`;
        if (exp.responsibilities.length > 0 && exp.responsibilities[0].trim() !== '') cvString += `Responsibilities:\n- ${exp.responsibilities.filter(Boolean).join('\n- ')}\n`;
        cvString += `\n`;
      }
    });
  }
  if (projects.some(p => p.name.trim())) {
      cvString += `## Projects\n`;
      projects.forEach(p => {
          if(p.name.trim()) cvString += `Name: ${p.name}\nDescription: ${p.description}\n` + (p.technologies && p.technologies.length > 0 ? `Technologies: ${p.technologies.join(', ')}\n` : '') + (p.link ? `Link: ${p.link}\n` : '') + '\n';
      })
  }
  if (educations.some(e => e.degree.trim())) {
    cvString += `## Education\n`;
    educations.forEach(edu => {
      if (edu.degree.trim()) cvString += `Degree: ${edu.degree}\nUniversity: ${edu.university}\nDates: ${edu.dates}\n\n`;
    });
  }
  if (Object.values(skills).some(s => s.length > 0 && s[0] !== '')) {
     cvString += `## Skills\n`;
     Object.entries(skills).forEach(([cat, list]) => { if (list.length > 0 && list[0] !== '') cvString += `${cat}: ${list.join(', ')}\n`; });
  }
  if (leadership.some(l => l.role.trim())) {
      cvString += `## Leadership & Extracurriculars\n`;
      leadership.forEach(l => {
          if (l.role.trim()) cvString += `Role: ${l.role}\nOrganization: ${l.organization}\nDates: ${l.dates}\nResponsibilities:\n- ${l.responsibilities.filter(Boolean).join('\n- ')}\n\n`;
      })
  }
  if (awards.some(a => a.name.trim())) {
      cvString += `## Awards & Achievements\n`;
      awards.forEach(a => { if(a.name.trim()) cvString += `${a.name}, ${a.awardedBy}, ${a.date}\n` + (a.summary ? `${a.summary}\n` : '') + '\n'; })
  }
  if (certifications.some(c => c.name.trim())) {
      cvString += `## Certifications\n`;
      certifications.forEach(c => { if(c.name.trim()) cvString += `${c.name}, ${c.issuer}, ${c.date}\n\n`; })
  }
  if (publications.some(p => p.title.trim())) {
      cvString += `## Publications\n`;
      publications.forEach(p => { if(p.title.trim()) cvString += `Title: ${p.title}\nAuthors: ${p.authors.join(', ')}\nJournal: ${p.journal}, ${p.date}\n` + (p.link ? `Link: ${p.link}\n` : '') + '\n'; })
  }
  if (languages.some(l => l.language.trim())) {
      cvString += `## Languages\n`;
      cvString += languages.map(l => `${l.language} (${l.proficiency})`).join(', ') + '\n\n';
  }
  if (references.trim()) cvString += `## References\n${references.trim()}\n`;
  return cvString.trim();
};

const DynamicListManager = ({ items, setItems, initialItem, renderItem, addItemText }) => (
    <>
        {items.map((item, index) => (
            <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-lg mb-4 relative bg-white shadow-sm">
                {items.length > 1 && (
                    <button onClick={() => setItems(items.filter((_, i) => i !== index))} className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors"><Trash2 size={18} /></button>
                )}
                {renderItem(item, index)}
            </div>
        ))}
        <button onClick={() => setItems([...items, initialItem])} className="flex items-center text-primary font-semibold hover:text-primary-hover transition-colors"><PlusCircle size={18} className="mr-2" /> {addItemText}</button>
    </>
);


export const CvBuilderForm: React.FC<CvBuilderFormProps> = ({ onCvUpdate, onJdUpdate }) => {
    const [summary, setSummary] = useState('');
    const [experiences, setExperiences] = useState<Experience[]>([initialExperience]);
    const [educations, setEducations] = useState<Education[]>([initialEducation]);
    const [projects, setProjects] = useState<Project[]>([initialProject]);
    const [certifications, setCertifications] = useState<Certification[]>([initialCertification]);
    const [awards, setAwards] = useState<AwardType[]>([initialAward]);
    const [leadership, setLeadership] = useState<Leadership[]>([initialLeadership]);
    const [publications, setPublications] = useState<Publication[]>([initialPublication]);
    const [languages, setLanguages] = useState<Language[]>([initialLanguage]);
    const [skills, setSkills] = useState<Skills>({ "Programming Languages": [], "Frameworks & Libraries": [], "Tools & Platforms": [], "Other Skills": [] });
    const [references, setReferences] = useState('References available upon request.');
    const [jobDesc, setJobDesc] = useState('');

    useEffect(() => {
        const cvString = formatCvDataToString(summary, experiences, educations, skills, projects, certifications, awards, leadership, publications, languages, references);
        onCvUpdate(cvString);
    }, [summary, experiences, educations, skills, projects, certifications, awards, leadership, publications, languages, references, onCvUpdate]);

    useEffect(() => { onJdUpdate(jobDesc); }, [jobDesc, onJdUpdate]);

    const handleListChange = (list, setList, index, field, value) => {
        const newList = [...list];
        if(field === 'responsibilities' || field === 'authors' || field === 'technologies') newList[index][field] = value.split(',').map(s => s.trim());
        else newList[index][field] = value;
        setList(newList);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-0">Step 2: Build Your CV from Scratch</h2>
            
            <Section title="Professional Summary" icon={<Briefcase size={20} />}>
                <TextAreaInput id="summary" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Write a brief summary about your professional background and goals." rows={4} />
            </Section>

            <Section title="Work Experience" icon={<Briefcase size={20} />}>
                <DynamicListManager items={experiences} setItems={setExperiences} initialItem={initialExperience} addItemText="Add Experience"
                    renderItem={(item, index) => (
                        <>
                            <div className="grid md:grid-cols-2 gap-3">
                                <InputField name="jobTitle" placeholder="Job Title" value={item.jobTitle} icon={<Briefcase size={18} className="text-gray-400"/>} onChange={e => handleListChange(experiences, setExperiences, index, 'jobTitle', e.target.value)} />
                                <InputField name="company" placeholder="Company" value={item.company} icon={<Building size={18} className="text-gray-400"/>} onChange={e => handleListChange(experiences, setExperiences, index, 'company', e.target.value)} />
                                <InputField name="location" placeholder="Location" value={item.location} icon={<MapPin size={18} className="text-gray-400"/>} onChange={e => handleListChange(experiences, setExperiences, index, 'location', e.target.value)} />
                                <InputField name="dates" placeholder="Dates" value={item.dates} icon={<Calendar size={18} className="text-gray-400"/>} onChange={e => handleListChange(experiences, setExperiences, index, 'dates', e.target.value)} />
                            </div>
                            <TextAreaInput id="responsibilities" value={item.responsibilities.join('\n')} onChange={e => handleListChange(experiences, setExperiences, index, 'responsibilities', e.target.value.split('\n'))} placeholder="Responsibilities (one per line)..." rows={4} />
                        </>
                    )} />
            </Section>

            <Section title="Projects" icon={<Lightbulb size={20} />}>
                 <DynamicListManager items={projects} setItems={setProjects} initialItem={initialProject} addItemText="Add Project"
                    renderItem={(item, index) => (
                        <>
                             <InputField name="name" placeholder="Project Name" value={item.name} icon={<Lightbulb size={18} className="text-gray-400"/>} onChange={e => handleListChange(projects, setProjects, index, 'name', e.target.value)} />
                             <TextAreaInput id="description" value={item.description} onChange={e => handleListChange(projects, setProjects, index, 'description', e.target.value)} placeholder="Project description..." rows={3} />
                             <InputField name="technologies" placeholder="Technologies (comma-separated)" value={item.technologies?.join(', ')} icon={<Lightbulb size={18} className="text-gray-400"/>} onChange={e => handleListChange(projects, setProjects, index, 'technologies', e.target.value)} />
                             <InputField name="link" placeholder="Project Link (optional)" value={item.link} icon={<LinkIcon size={18} className="text-gray-400"/>} onChange={e => handleListChange(projects, setProjects, index, 'link', e.target.value)} />
                        </>
                    )} />
            </Section>

            <Section title="Education" icon={<GraduationCap size={20} />}>
                <DynamicListManager items={educations} setItems={setEducations} initialItem={initialEducation} addItemText="Add Education"
                    renderItem={(item, index) => (
                        <>
                             <InputField name="degree" placeholder="Degree" value={item.degree} icon={<GraduationCap size={18} className="text-gray-400"/>} onChange={e => handleListChange(educations, setEducations, index, 'degree', e.target.value)} />
                             <InputField name="university" placeholder="University" value={item.university} icon={<School size={18} className="text-gray-400"/>} onChange={e => handleListChange(educations, setEducations, index, 'university', e.target.value)} />
                             <InputField name="dates" placeholder="Dates" value={item.dates} icon={<Calendar size={18} className="text-gray-400"/>} onChange={e => handleListChange(educations, setEducations, index, 'dates', e.target.value)} />
                        </>
                    )} />
            </Section>

            <Section title="Leadership & Extracurriculars" icon={<Users size={20} />}>
                <DynamicListManager items={leadership} setItems={setLeadership} initialItem={initialLeadership} addItemText="Add Role"
                    renderItem={(item, index) => (
                        <>
                             <InputField name="role" placeholder="Role/Title" value={item.role} icon={<Users size={18} className="text-gray-400"/>} onChange={e => handleListChange(leadership, setLeadership, index, 'role', e.target.value)} />
                             <InputField name="organization" placeholder="Organization" value={item.organization} icon={<Building size={18} className="text-gray-400"/>} onChange={e => handleListChange(leadership, setLeadership, index, 'organization', e.target.value)} />
                             <InputField name="dates" placeholder="Dates" value={item.dates} icon={<Calendar size={18} className="text-gray-400"/>} onChange={e => handleListChange(leadership, setLeadership, index, 'dates', e.target.value)} />
                             <TextAreaInput id="responsibilities" value={item.responsibilities.join('\n')} onChange={e => handleListChange(leadership, setLeadership, index, 'responsibilities', e.target.value.split('\n'))} placeholder="Responsibilities (one per line)..." rows={3} />
                        </>
                    )} />
            </Section>
            
            <div className="grid md:grid-cols-2 gap-6">
                <Section title="Awards" icon={<Award size={20} />}>
                    <DynamicListManager items={awards} setItems={setAwards} initialItem={initialAward} addItemText="Add Award"
                        renderItem={(item, index) => (
                             <InputField name="name" placeholder="Award Name, Awarder, Date" value={item.name} icon={<Award size={18} className="text-gray-400"/>} onChange={e => handleListChange(awards, setAwards, index, 'name', e.target.value)} />
                        )} />
                </Section>
                <Section title="Certifications" icon={<Star size={20} />}>
                    <DynamicListManager items={certifications} setItems={setCertifications} initialItem={initialCertification} addItemText="Add Certification"
                        renderItem={(item, index) => (
                             <InputField name="name" placeholder="Cert Name, Issuer, Date" value={item.name} icon={<Star size={18} className="text-gray-400"/>} onChange={e => handleListChange(certifications, setCertifications, index, 'name', e.target.value)} />
                        )} />
                </Section>
            </div>

             <Section title="Skills" icon={<Lightbulb size={20} />}>
                <div className="space-y-3">
                    {Object.keys(skills).map(category => (
                        <InputField key={category} name={category} placeholder={`${category} (comma-separated)`} value={skills[category as keyof Skills].join(', ')}
                            icon={<Lightbulb size={18} className="text-gray-400"/>}
                            onChange={e => setSkills(prev => ({...prev, [category]: e.target.value.split(',').map(s => s.trim())}))} />
                    ))}
                </div>
            </Section>
            
            <div className="grid md:grid-cols-2 gap-6">
                 <Section title="Languages" icon={<Languages size={20} />}>
                     <DynamicListManager items={languages} setItems={setLanguages} initialItem={initialLanguage} addItemText="Add Language"
                        renderItem={(item, index) => (
                             <InputField name="language" placeholder="Language (e.g., Spanish - Fluent)" value={item.language} icon={<Languages size={18} className="text-gray-400"/>} onChange={e => handleListChange(languages, setLanguages, index, 'language', e.target.value)} />
                        )} />
                </Section>
                 <Section title="References" icon={<FileText size={20} />}>
                    <TextAreaInput id="references" value={references} onChange={e => setReferences(e.target.value)} rows={3} />
                </Section>
            </div>
            
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Step 3: Add the Target Job Description</h2>
                 <FileUpload label="Upload Job Description File" onFileRead={setJobDesc} />
                 <TextAreaInput id="jd-scratch" value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="...or paste the job description text here" rows={10} />
            </div>
        </div>
    );
};
