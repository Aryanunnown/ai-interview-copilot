import Groq from 'groq-sdk';
import { env } from '../../../config/env.js';
import { HttpError } from '../../../utils/httpError.js';
import type { ResumeIntelligenceProfile } from '../resume.types.js';
import { buildResumeExtractionPrompt } from './resume-extraction.prompt.js';
import { normalizeResumeProfile } from './resume-normalizer.js';

const defaultGroqModel = 'llama-3.1-8b-instant';

export async function extractResumeProfileWithAi(
  rawResumeText: string,
): Promise<ResumeIntelligenceProfile> {
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
        content: buildResumeExtractionPrompt(rawResumeText),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new HttpError(502, 'Groq returned an empty resume extraction response');
  }

  return normalizeResumeProfile(parseResumeExtraction(content));
}

function parseResumeExtraction(content: string): ResumeIntelligenceProfile {
  try {
    const parsed = JSON.parse(content) as Partial<ResumeIntelligenceProfile>;

    return {
      candidateSummary: normalizeString(parsed.candidateSummary),
      experienceYears: normalizeNumber(parsed.experienceYears),
      domain: normalizeString(parsed.domain),
      skills: normalizeStringArray(parsed.skills),
      strengths: normalizeStringArray(parsed.strengths),
      growthAreas: normalizeStringArray(parsed.growthAreas),
      recommendedRoles: normalizeStringArray(parsed.recommendedRoles),
      education: normalizeStringArray(parsed.education),
      certifications: normalizeStringArray(parsed.certifications),
      companies: normalizeStringArray(parsed.companies),
      roles: normalizeStringArray(parsed.roles),
      technologies: normalizeStringArray(parsed.technologies),
      concepts: normalizeStringArray(parsed.concepts),
      domains: normalizeStringArray(parsed.domains),
      aiCapabilities: normalizeStringArray(parsed.aiCapabilities),
      cloudCapabilities: normalizeStringArray(parsed.cloudCapabilities),
    };
  } catch {
    throw new HttpError(502, 'Groq returned invalid resume extraction JSON');
  }
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function normalizeNumber(value: unknown) {
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

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}
