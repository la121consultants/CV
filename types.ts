export interface Experience {
  jobTitle: string;
  company: string;
  location: string;
  dates: string;
  responsibilities: string[];
}

export interface Education {
  degree: string;
  university: string;
  dates: string;
}

export interface Skills {
  [key: string]: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[];
  link?: string;
}

export interface Certification {
  name:string;
  issuer: string;
  date: string;
}

export interface Award {
    name: string;
    awardedBy: string;
    date: string;
    summary?: string;
}

export interface Leadership {
    role: string;
    organization: string;
    dates: string;
    responsibilities: string[];
}

export interface Publication {
    title: string;
    authors: string[];
    journal: string;
    date: string;
    link?: string;
}

export interface Language {
    language: string;
    proficiency: string;
}

export interface CvData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skills;
  projects?: Project[];
  certifications?: Certification[];
  awards?: Award[];
  leadership?: Leadership[];
  publications?: Publication[];
  languages?: Language[];
  references: string;
}

export interface LoggedInUser {
  email: string;
  role: 'superadmin' | 'pro' | 'onetime';
  createdAt: string;
  // Optional properties for different user roles
  expiresAt?: string;
  usageCount?: number;
}

export interface FeedbackEntry {
  rating: number;
  isHelpful: 'Yes' | 'No' | '';
  wouldRecommend: 'Yes' | 'No' | '';
  comments: string;
  timestamp: string;
}
