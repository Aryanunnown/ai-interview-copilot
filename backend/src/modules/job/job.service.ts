import { prisma } from '../../config/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { analyzeJobDescription, runSemanticMatch } from './job.analyzer.js';
import { extractJobWithAi } from './services/job-ai-extractor.service.js';
import { parseJobDescriptionDeterministic } from './services/job-fallback-parser.service.js';
import { computeTfidfSimilarity } from './services/similarity.service.js';
import type {
  JobAnalysisResult,
  JobAnalyzeInput,
  JobProfile,
  ResumeSkillProfile,
} from './job.types.js';

export async function analyzeJob(input: JobAnalyzeInput): Promise<JobAnalysisResult> {
  const resume = await prisma.resume.findFirst({
    where: {
      id: input.resumeId,
      userId: input.userId,
    },
    select: {
      skills: true,
      experienceYears: true,
      domain: true,
      strengths: true,
      parsedProfile: true,
    },
  });

  if (!resume) {
    throw new HttpError(404, 'Resume not found');
  }

  const profileFromDb = resume.parsedProfile as Record<string, unknown> | null;

  const resumeProfile: ResumeSkillProfile = {
    skills: resume.skills,
    experienceYears: resume.experienceYears,
    domain: resume.domain,
    strengths: (resume.strengths as string[]) || [],
    technologies: readStringArray(profileFromDb?.technologies),
    concepts: readStringArray(profileFromDb?.concepts),
    domains: readStringArray(profileFromDb?.domains),
    aiCapabilities: readStringArray(profileFromDb?.aiCapabilities),
    cloudCapabilities: readStringArray(profileFromDb?.cloudCapabilities),
  };

  const { profile, source } = await extractJobProfile(input.jobDescription);

  const semanticResult = await runSemanticMatch(profile, resumeProfile);

  const matchResult = analyzeJobDescription(profile, resumeProfile, semanticResult);

  const tfidfResult = computeTfidfSimilarity(
    {
      skills: resume.skills,
      domain: resume.domain,
      strengths: (resume.strengths as string[]) || [],
      technologies: readStringArray(profileFromDb?.technologies),
      concepts: readStringArray(profileFromDb?.concepts),
      domains: readStringArray(profileFromDb?.domains),
      aiCapabilities: readStringArray(profileFromDb?.aiCapabilities),
      cloudCapabilities: readStringArray(profileFromDb?.cloudCapabilities),
    },
    profile,
  );

  await prisma.jobDescription.create({
    data: {
      userId: input.userId,
      title: profile.jobTitle || 'JD Analysis',
      description: input.jobDescription,
      jobTitle: profile.jobTitle || null,
      jobSummary: profile.jobSummary || null,
      requiredSkills: profile.requiredSkills as any,
      preferredSkills: profile.preferredSkills as any,
      requiredExperience: profile.requiredExperience > 0 ? profile.requiredExperience : null,
      domains: profile.domains as any,
      responsibilities: profile.responsibilities as any,
      keywords: profile.keywords as any,
      parsedProfile: profile as any,
      analysisSource: source,
    },
  });

  return {
    jobTitle: profile.jobTitle || 'Untitled Position',
    matchPercentage: matchResult.matchPercentage,
    tfidfScore: tfidfResult.tfidfScore,
    matchedSkills: matchResult.matchedSkills,
    missingSkills: matchResult.missingSkills,
    strengths: matchResult.strengths,
    criticalGaps: matchResult.criticalGaps,
    recommendations: matchResult.recommendations,
    interviewFocusAreas: matchResult.interviewFocusAreas,
    analysisSource: source,
    categoryScores: matchResult.categoryScores,
  };
}

async function extractJobProfile(rawText: string): Promise<{
  profile: JobProfile;
  source: 'groq' | 'fallback';
}> {
  try {
    const result = await extractJobWithAi(rawText);
    return result;
  } catch {
    const fallbackProfile = parseJobDescriptionDeterministic(rawText);
    return {
      profile: fallbackProfile,
      source: 'fallback',
    };
  }
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}
