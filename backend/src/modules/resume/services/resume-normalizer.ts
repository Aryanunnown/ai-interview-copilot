import type { ResumeIntelligenceProfile } from '../resume.types.js';

const skillNameAliases: Record<string, string> = {
  nodejs: 'Node.js',
  'node js': 'Node.js',
  'node.js': 'Node.js',
  reactjs: 'React',
  'react js': 'React',
  'react.js': 'React',
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  mongodb: 'MongoDB',
  mongo: 'MongoDB',
  expressjs: 'Express',
  'express js': 'Express',
  'express.js': 'Express',
  aws: 'AWS',
  'amazon web services': 'AWS',
  'amazon web services (aws)': 'AWS',
  'aws (amazon web services)': 'AWS',
  cicd: 'CI/CD',
  'ci/cd': 'CI/CD',
  'ci cd': 'CI/CD',
  'ci/cd pipeline': 'CI/CD',
  'ci/cd pipelines': 'CI/CD',
  'ci cd pipeline': 'CI/CD',
  'ci cd pipelines': 'CI/CD',
  'continuous integration': 'CI/CD',
  'continuous integration and continuous deployment': 'CI/CD',
  'continuous integration/continuous deployment': 'CI/CD',
  rag: 'RAG',
  'retrieval augmented generation': 'RAG',
  'retrieval augmented generation (rag)': 'RAG',
  'rag (retrieval augmented generation)': 'RAG',
  'rest api': 'REST API',
  'rest apis': 'REST API',
  'restful api': 'REST API',
  'restful apis': 'REST API',
};

export function normalizeResumeProfile(
  profile: ResumeIntelligenceProfile,
): ResumeIntelligenceProfile {
  return {
    ...profile,
    candidateSummary: profile.candidateSummary.trim(),
    domain: profile.domain.trim() || 'Unknown',
    experienceYears: normalizeExperienceYears(profile.experienceYears),
    skills: normalizeSkills(profile.skills),
    strengths: normalizeStringList(profile.strengths),
    growthAreas: normalizeStringList(profile.growthAreas),
    recommendedRoles: normalizeStringList(profile.recommendedRoles),
    education: normalizeStringList(profile.education),
    certifications: normalizeStringList(profile.certifications),
    companies: normalizeStringList(profile.companies),
    roles: normalizeStringList(profile.roles),
    technologies: normalizeStringList(profile.technologies),
    concepts: normalizeStringList(profile.concepts),
    domains: normalizeStringList(profile.domains),
    aiCapabilities: normalizeStringList(profile.aiCapabilities),
    cloudCapabilities: normalizeStringList(profile.cloudCapabilities),
  };
}

function normalizeSkills(skills: string[]) {
  return normalizeStringList(skills.map(normalizeSkillName));
}

function normalizeSkillName(skill: string) {
  const normalizedKey = skill
    .trim()
    .toLowerCase()
    .replace(/[.\s-/]+/g, ' ');

  return skillNameAliases[normalizedKey] ?? skill.trim();
}

function normalizeStringList(values: string[]) {
  const uniqueValues = new Map<string, string>();

  for (const value of values) {
    const normalizedValue = value.trim().replace(/\s+/g, ' ');

    if (!normalizedValue) {
      continue;
    }

    uniqueValues.set(normalizedValue.toLowerCase(), normalizedValue);
  }

  return Array.from(uniqueValues.values()).sort((left, right) =>
    left.localeCompare(right, undefined, { sensitivity: 'base' }),
  );
}

function normalizeExperienceYears(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.round(value * 10) / 10;
}
