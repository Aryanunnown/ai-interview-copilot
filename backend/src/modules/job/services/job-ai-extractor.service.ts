import Groq from 'groq-sdk';
import { env } from '../../../config/env.js';
import { HttpError } from '../../../utils/httpError.js';
import type { JobProfile } from '../job.types.js';
import { buildJobExtractionPrompt } from './job-extraction.prompt.js';
import { normalizeSkills } from './skill-normalizer.js';

const defaultGroqModel = 'llama-3.1-8b-instant';

type RawJobProfile = {
  jobTitle: string;
  jobSummary: string;
  requiredSkills: string[];
  preferredSkills: string[];
  requiredExperience: number;
  domains: string[];
  responsibilities: string[];
  keywords: string[];
  aiRequirements: string[];
  cloudRequirements: string[];
};

export async function extractJobWithAi(rawText: string): Promise<{
  profile: JobProfile;
  source: 'groq';
}> {
  if (!env.groqApiKey) {
    throw new HttpError(503, 'GROQ_API_KEY is not configured');
  }

  const client = new Groq({
    apiKey: env.groqApiKey,
  });

  const completion = await client.chat.completions.create({
    model: env.groqModel || defaultGroqModel,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: buildJobExtractionPrompt(rawText),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new HttpError(502, 'Groq returned an empty job extraction response');
  }

  const parsed = parseExtraction(content);

  return {
    profile: {
      jobTitle: parsed.jobTitle,
      jobSummary: parsed.jobSummary,
      requiredSkills: normalizeSkills(parsed.requiredSkills),
      preferredSkills: normalizeSkills(parsed.preferredSkills),
      requiredExperience: normalizeNumber(parsed.requiredExperience),
      domains: normalizeStringArray(parsed.domains),
      responsibilities: normalizeStringArray(parsed.responsibilities),
      keywords: normalizeStringArray(parsed.keywords),
      aiRequirements: normalizeStringArray(parsed.aiRequirements),
      cloudRequirements: normalizeStringArray(parsed.cloudRequirements),
    },
    source: 'groq',
  };
}

function parseExtraction(content: string): RawJobProfile {
  try {
    const parsed = JSON.parse(content) as Partial<RawJobProfile>;

    return {
      jobTitle: normalizeString(parsed.jobTitle),
      jobSummary: normalizeString(parsed.jobSummary),
      requiredSkills: normalizeStringArray(parsed.requiredSkills),
      preferredSkills: normalizeStringArray(parsed.preferredSkills),
      requiredExperience: normalizeNumber(parsed.requiredExperience),
      domains: normalizeStringArray(parsed.domains),
      responsibilities: normalizeStringArray(parsed.responsibilities),
      keywords: normalizeStringArray(parsed.keywords),
      aiRequirements: normalizeStringArray(parsed.aiRequirements),
      cloudRequirements: normalizeStringArray(parsed.cloudRequirements),
    };
  } catch {
    throw new HttpError(502, 'Groq returned invalid job extraction JSON');
  }
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value);

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return 0;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}
