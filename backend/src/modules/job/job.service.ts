import { prisma } from '../../config/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { analyzeJobDescription, runSemanticMatch } from './job.analyzer.js';
import { extractJobWithAi } from './services/job-ai-extractor.service.js';
import { parseJobDescriptionDeterministic } from './services/job-fallback-parser.service.js';
import { computeTfidfSimilarity } from './services/similarity.service.js';
import { parseResumeText } from '../resume/resume.parser.js';
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
      rawText: true,
    },
  });

  if (!resume) {
    throw new HttpError(404, 'Resume not found');
  }

  const profileFromDb = resume.parsedProfile as Record<string, unknown> | null;
  const parsedResumeFromText = resume.rawText ? parseResumeText(resume.rawText) : null;
  const resumeSkills = uniqueStrings([
    ...(resume.skills ?? []),
    ...(parsedResumeFromText?.skills ?? []),
  ]);
  const parsedProfileTechnologies = readStringArray(profileFromDb?.technologies);
  const deterministicTechnologies = parsedResumeFromText?.skills ?? [];
  const technologies = uniqueStrings([...parsedProfileTechnologies, ...deterministicTechnologies]);

  const resumeProfile: ResumeSkillProfile = {
    skills: resumeSkills,
    experienceYears: resume.experienceYears ?? parsedResumeFromText?.experienceYears ?? null,
    domain: resume.domain ?? parsedResumeFromText?.domain ?? null,
    strengths: (resume.strengths as string[]) || [],
    technologies,
    concepts: readStringArray(profileFromDb?.concepts),
    domains: readStringArray(profileFromDb?.domains),
    aiCapabilities: uniqueStrings([
      ...readStringArray(profileFromDb?.aiCapabilities),
      ...technologies.filter((skill) => aiCapabilitySkillNames.has(skill)),
    ]),
    cloudCapabilities: uniqueStrings([
      ...readStringArray(profileFromDb?.cloudCapabilities),
      ...technologies.filter((skill) => cloudCapabilitySkillNames.has(skill)),
    ]),
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
  const deterministicProfile = parseJobDescriptionDeterministic(rawText);

  try {
    const result = await extractJobWithAi(rawText);
    return {
      profile: mergeJobProfiles(result.profile, deterministicProfile),
      source: result.source,
    };
  } catch {
    return {
      profile: deterministicProfile,
      source: 'fallback',
    };
  }
}

function mergeJobProfiles(primary: JobProfile, fallback: JobProfile): JobProfile {
  return {
    jobTitle: primary.jobTitle || fallback.jobTitle,
    jobSummary: primary.jobSummary || fallback.jobSummary,
    requiredSkills: uniqueStrings([...primary.requiredSkills, ...fallback.requiredSkills]),
    preferredSkills: uniqueStrings([...primary.preferredSkills, ...fallback.preferredSkills]),
    requiredExperience: primary.requiredExperience || fallback.requiredExperience,
    domains: uniqueStrings([...primary.domains, ...fallback.domains]),
    responsibilities: uniqueStrings([...primary.responsibilities, ...fallback.responsibilities]),
    keywords: uniqueStrings([...primary.keywords, ...fallback.keywords]),
    aiRequirements: uniqueStrings([...primary.aiRequirements, ...fallback.aiRequirements]),
    cloudRequirements: uniqueStrings([...primary.cloudRequirements, ...fallback.cloudRequirements]),
  };
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

function uniqueStrings(values: string[]): string[] {
  const uniqueValues = new Map<string, string>();

  for (const value of values) {
    const normalizedValue = value.trim().replace(/\s+/g, ' ');

    if (!normalizedValue) {
      continue;
    }

    uniqueValues.set(normalizedValue.toLowerCase(), normalizedValue);
  }

  return Array.from(uniqueValues.values());
}

const aiCapabilitySkillNames = new Set([
  'LLM APIs',
  'Prompt Workflows',
  'Prompt Engineering',
  'Embeddings',
  'Document Intelligence',
  'Semantic Search',
  'Vector Search',
  'RAG',
  'LangChain',
  'LangGraph',
  'OpenAI',
  'AWS Bedrock',
  'SageMaker',
  'Hugging Face',
  'Python',
  'Pinecone',
]);

const cloudCapabilitySkillNames = new Set([
  'AWS',
  'EC2',
  'S3',
  'Lambda',
  'RDS',
  'API Gateway',
  'IAM',
  'CloudWatch',
  'ECS',
  'EKS',
  'AWS CodePipeline',
  'Docker',
  'Kubernetes',
  'CI/CD',
  'Git',
]);
