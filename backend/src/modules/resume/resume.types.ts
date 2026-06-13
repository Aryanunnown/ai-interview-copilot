import type { Buffer } from 'node:buffer';

export const supportedResumeMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export type SupportedResumeMimeType = (typeof supportedResumeMimeTypes)[number];

export type ResumeUploadBody = {
  title?: string;
};

export type ResumeUploadedFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

export type ParsedEducation = {
  degree: string | null;
  college: string | null;
  year: number | null;
};

export type ResumeDomain =
  | 'Frontend'
  | 'Backend'
  | 'Full Stack'
  | 'AI Engineer'
  | 'ML Engineer'
  | 'DevOps'
  | 'Data Engineer';

export type ParsedResumeData = {
  skills: string[];
  experienceYears: number | null;
  education: ParsedEducation[];
  certifications: string[];
  domain: ResumeDomain | null;
};

export type ResumeUploadResult = {
  resumeId: string;
  skills: string[];
  experienceYears: number | null;
  domain: string | null;
};
