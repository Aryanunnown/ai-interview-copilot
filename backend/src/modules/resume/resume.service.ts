import { prisma } from '../../config/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { extractTextFromResumeFile, parseResumeText } from './resume.parser.js';
import type {
  ParsedEducation,
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

  const parsedData = parseResumeText(rawText);

  const resume = await prisma.resume.create({
    data: {
      userId,
      title: body.title ?? file.originalname,
      fileName: file.originalname,
      fileUrl: null,
      rawText,
      parsedData,
      skills: parsedData.skills,
      experienceYears: parsedData.experienceYears,
      education: parsedData.education.map(formatEducationForStorage),
      certifications: parsedData.certifications,
      domain: parsedData.domain,
    },
    select: {
      id: true,
      skills: true,
      experienceYears: true,
      domain: true,
    },
  });

  return {
    resumeId: resume.id,
    skills: resume.skills,
    experienceYears: resume.experienceYears,
    domain: resume.domain,
  };
}

function formatEducationForStorage(education: ParsedEducation) {
  return [education.degree, education.college, education.year?.toString()]
    .filter(Boolean)
    .join(' | ');
}
