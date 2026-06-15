import { prisma } from '../../config/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { extractTextFromResumeFile, parseResumeText } from './resume.parser.js';
import { extractResumeProfileWithAi } from './services/resume-ai-extractor.service.js';
import { normalizeResumeProfile } from './services/resume-normalizer.js';
import type {
  ParsedEducation,
  ResumeListItem,
  ResumeIntelligenceProfile,
  ResumeUploadBody,
  ResumeUploadedFile,
  ResumeUploadResult,
} from './resume.types.js';

type UploadResumeInput = {
  userId: string;
  file: ResumeUploadedFile;
  body: ResumeUploadBody;
};

export async function uploadResume({
  userId,
  file,
  body,
}: UploadResumeInput): Promise<ResumeUploadResult> {
  const rawText = await extractTextFromResumeFile(file);

  if (!rawText) {
    throw new HttpError(400, 'Resume text could not be extracted');
  }

  const parsedProfile = await extractResumeProfile(rawText);

  const resume = await prisma.resume.create({
    data: {
      userId,
      title: body.title ?? file.originalname,
      fileName: file.originalname,
      fileUrl: null,
      rawText,
      summary: parsedProfile.candidateSummary,
      candidateSummary: parsedProfile.candidateSummary,
      parsedData: parsedProfile,
      parsedProfile,
      skills: parsedProfile.skills,
      experienceYears: parsedProfile.experienceYears,
      education: parsedProfile.education,
      certifications: parsedProfile.certifications,
      domain: parsedProfile.domain,
      strengths: parsedProfile.strengths,
      growthAreas: parsedProfile.growthAreas,
      recommendedRoles: parsedProfile.recommendedRoles,
      companies: parsedProfile.companies,
      roles: parsedProfile.roles,
    },
    select: {
      id: true,
      candidateSummary: true,
      skills: true,
      experienceYears: true,
      domain: true,
      strengths: true,
      growthAreas: true,
      recommendedRoles: true,
      education: true,
      certifications: true,
      companies: true,
      roles: true,
    },
  });

  return {
    resumeId: resume.id,
    candidateSummary: resume.candidateSummary ?? '',
    skills: resume.skills,
    experienceYears: resume.experienceYears ?? 0,
    domain: resume.domain ?? 'Unknown',
    strengths: readStringArray(resume.strengths),
    growthAreas: readStringArray(resume.growthAreas),
    recommendedRoles: readStringArray(resume.recommendedRoles),
    education: resume.education,
    certifications: resume.certifications,
    companies: readStringArray(resume.companies),
    roles: readStringArray(resume.roles),
    technologies: [],
    concepts: [],
    domains: [],
    aiCapabilities: [],
    cloudCapabilities: [],
  };
}

export async function listUserResumes(userId: string): Promise<ResumeListItem[]> {
  return prisma.resume.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      title: true,
      fileName: true,
      createdAt: true,
    },
  });
}

function formatEducationForStorage(education: ParsedEducation) {
  return [education.degree, education.college, education.year?.toString()]
    .filter(Boolean)
    .join(' | ');
}

async function extractResumeProfile(rawText: string): Promise<ResumeIntelligenceProfile> {
  try {
    return await extractResumeProfileWithAi(rawText);
  } catch {
    const parsedData = parseResumeText(rawText);

    return normalizeResumeProfile({
      candidateSummary: '',
      experienceYears: parsedData.experienceYears ?? 0,
      domain: parsedData.domain ?? 'Unknown',
      skills: parsedData.skills,
      strengths: [],
      growthAreas: [],
      recommendedRoles: [],
      education: parsedData.education.map(formatEducationForStorage),
      certifications: parsedData.certifications,
      companies: [],
      roles: [],
      technologies: [],
      concepts: [],
      domains: [],
      aiCapabilities: [],
      cloudCapabilities: [],
    });
  }
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}
