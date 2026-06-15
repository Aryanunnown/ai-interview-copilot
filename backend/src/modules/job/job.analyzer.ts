import Groq from 'groq-sdk';
import { env } from '../../config/env.js';
import type {
  CategoryScores,
  JobProfile,
  ResumeSkillProfile,
  SemanticMatchResult,
} from './job.types.js';
import { matchSkill } from './services/skill-normalizer.js';

const skillWeights: Record<string, number> = {
  React: 1.0,
  'Node.js': 1.0,
  TypeScript: 0.9,
  Python: 0.9,
  AWS: 0.8,
  Docker: 0.8,
  Kubernetes: 0.8,
  PostgreSQL: 0.7,
  MongoDB: 0.7,
  LangChain: 1.0,
  LangGraph: 1.0,
  RAG: 1.0,
};

type AnalyzerResult = {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  criticalGaps: string[];
  recommendations: string[];
  interviewFocusAreas: string[];
  categoryScores: CategoryScores;
};

export function analyzeJobDescription(
  jobProfile: JobProfile,
  resume: ResumeSkillProfile,
  _semanticResult: SemanticMatchResult | null,
): AnalyzerResult {
  const skillsScore = calculateCategoryScore(jobProfile.requiredSkills, resume.skills);
  const technologiesScore = calculateCategoryScore(
    [...jobProfile.requiredSkills, ...jobProfile.preferredSkills],
    resume.technologies,
  );
  const aiCapabilitiesScore = calculateCategoryScore(
    jobProfile.aiRequirements,
    resume.aiCapabilities,
  );
  const cloudCapabilitiesScore = calculateCategoryScore(
    jobProfile.cloudRequirements,
    resume.cloudCapabilities,
  );
  const responsibilitiesScore = calculateCategoryScore(jobProfile.responsibilities, [
    ...resume.concepts,
    ...resume.technologies,
    ...resume.skills,
  ]);
  const domainsScore = calculateCategoryScore(jobProfile.domains, resume.domains);

  const categoryScores: CategoryScores = {
    skills: skillsScore,
    technologies: technologiesScore,
    aiCapabilities: aiCapabilitiesScore,
    cloudCapabilities: cloudCapabilitiesScore,
    responsibilities: responsibilitiesScore,
    domains: domainsScore,
  };

  const skillsWeight = 0.4;
  const technologiesWeight = 0.2;
  const aiCapabilitiesWeight = 0.15;
  const cloudCapabilitiesWeight = 0.1;
  const responsibilitiesWeight = 0.1;
  const domainsWeight = 0.05;

  const matchPercentage = Math.round(
    (skillsScore * skillsWeight +
      technologiesScore * technologiesWeight +
      aiCapabilitiesScore * aiCapabilitiesWeight +
      cloudCapabilitiesScore * cloudCapabilitiesWeight +
      responsibilitiesScore * responsibilitiesWeight +
      domainsScore * domainsWeight) *
      100,
  );

  const allResumeItems = [
    ...resume.skills,
    ...resume.technologies,
    ...resume.concepts,
    ...resume.aiCapabilities,
    ...resume.cloudCapabilities,
    ...resume.domains,
  ];

  const matchedSkills = jobProfile.requiredSkills.filter((s) => matchSkill(s, allResumeItems));
  const missingSkills = jobProfile.requiredSkills.filter((s) => !matchSkill(s, allResumeItems));

  const strengths = buildStrengths(matchedSkills, resume.strengths, categoryScores);
  const criticalGaps = buildCriticalGaps(
    missingSkills,
    jobProfile.requiredExperience,
    resume.experienceYears,
    categoryScores,
  );
  const recommendations = buildRecommendations(missingSkills, criticalGaps, categoryScores);
  const interviewFocusAreas = buildInterviewFocusAreas(
    missingSkills,
    jobProfile.domains,
    jobProfile.keywords,
  );

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    strengths,
    criticalGaps,
    recommendations,
    interviewFocusAreas,
    categoryScores,
  };
}

function calculateCategoryScore(jdItems: string[], resumeItems: string[]): number {
  if (jdItems.length === 0) return 0.5;

  if (resumeItems.length === 0) return 0;

  const matched = jdItems.filter((item) => matchSkill(item, resumeItems));

  return matched.length / jdItems.length;
}

export function extractRequiredSkills(jobProfile: JobProfile): string[] {
  return jobProfile.requiredSkills;
}

function buildStrengths(
  matchedSkills: string[],
  strengths: string[],
  categoryScores: CategoryScores,
): string[] {
  const result: string[] = [];

  for (const skill of matchedSkills) {
    const weight = skillWeights[skill] ?? 0.7;
    if (weight >= 0.9) {
      result.push(`Strong match on core skill: ${skill}`);
    } else if (weight >= 0.7) {
      result.push(`Good match on important skill: ${skill}`);
    }
  }

  if (categoryScores.aiCapabilities >= 0.7) {
    result.push('Strong alignment in AI capabilities');
  }
  if (categoryScores.cloudCapabilities >= 0.7) {
    result.push('Strong alignment in cloud capabilities');
  }
  if (categoryScores.technologies >= 0.7) {
    result.push('Strong technology stack alignment');
  }

  if (strengths.length > 0) {
    result.push(...strengths.slice(0, 3).map((s) => `Candidate strength: ${s}`));
  }

  return result;
}

function buildCriticalGaps(
  missingSkills: string[],
  requiredExperience: number,
  actualExperience: number | null,
  categoryScores: CategoryScores,
): string[] {
  const gaps: string[] = [];

  const weightedMissing = missingSkills
    .map((skill) => ({ skill, weight: skillWeights[skill] ?? 0.7 }))
    .sort((a, b) => b.weight - a.weight);

  for (const { skill, weight } of weightedMissing) {
    if (weight >= 0.9) {
      gaps.push(`Missing core skill: ${skill}`);
    } else if (gaps.length < 3) {
      gaps.push(`Missing: ${skill}`);
    }
  }

  if (categoryScores.aiCapabilities < 0.3 && gaps.length < 4) {
    gaps.push('Limited AI experience');
  }
  if (categoryScores.cloudCapabilities < 0.3 && gaps.length < 4) {
    gaps.push('Limited cloud platform experience');
  }

  if (requiredExperience > 0 && (actualExperience ?? 0) < requiredExperience) {
    gaps.push(
      `Experience gap: needs ${requiredExperience}+ years, has ${actualExperience ?? 0} years`,
    );
  }

  return gaps;
}

function buildRecommendations(
  missingSkills: string[],
  criticalGaps: string[],
  categoryScores: CategoryScores,
): string[] {
  const recommendations: string[] = [];

  if (missingSkills.length > 0) {
    recommendations.push(
      `Address missing skills: ${missingSkills.slice(0, 5).join(', ')}${missingSkills.length > 5 ? ` and ${missingSkills.length - 5} more` : ''}`,
    );
  }

  if (categoryScores.aiCapabilities < 0.5 && categoryScores.aiCapabilities > 0) {
    recommendations.push('Highlight AI-related projects and experience more prominently');
  }
  if (categoryScores.cloudCapabilities < 0.5 && categoryScores.cloudCapabilities > 0) {
    recommendations.push('Emphasize cloud platform experience in interview responses');
  }

  for (const gap of criticalGaps) {
    if (gap.startsWith('Experience gap')) {
      recommendations.push(
        'Highlight equivalent project experience or relevant coursework to offset the experience gap',
      );
    }
    if (gap.startsWith('Missing core skill')) {
      const skill = gap.replace('Missing core skill: ', '');
      recommendations.push(
        `Study ${skill} fundamentals and prepare to discuss relevant experience`,
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue building on existing strengths for interview preparation');
  }

  return recommendations;
}

function buildInterviewFocusAreas(
  missingSkills: string[],
  domains: string[],
  keywords: string[],
): string[] {
  const areas: string[] = [];

  const weightedMissing = missingSkills
    .map((skill) => ({ skill, weight: skillWeights[skill] ?? 0.7 }))
    .sort((a, b) => b.weight - a.weight);

  for (const { skill } of weightedMissing.slice(0, 3)) {
    areas.push(skill);
  }

  for (const domain of domains) {
    if (!areas.includes(domain)) {
      areas.push(domain);
    }
  }

  for (const keyword of keywords.slice(0, 2)) {
    const capitalized = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    if (!areas.includes(keyword) && !areas.includes(capitalized)) {
      areas.push(capitalized);
    }
  }

  return areas.slice(0, 5);
}

export async function runSemanticMatch(
  jobProfile: JobProfile,
  resume: ResumeSkillProfile,
): Promise<SemanticMatchResult> {
  if (!env.groqApiKey) {
    return calculateDeterministicSemanticResult(resume);
  }

  try {
    const client = new Groq({ apiKey: env.groqApiKey });

    const completion = await client.chat.completions.create({
      model: env.groqModel || 'llama-3.1-8b-instant',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: buildSemanticPrompt(jobProfile, resume),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return calculateDeterministicSemanticResult(resume);
    }

    const parsed = JSON.parse(content) as { semanticScore: number; reasoning: string };

    return {
      semanticScore: normalizeSemanticScore(parsed.semanticScore),
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
    };
  } catch {
    return calculateDeterministicSemanticResult(resume);
  }
}

function buildSemanticPrompt(jobProfile: JobProfile, resume: ResumeSkillProfile): string {
  return [
    'Compare candidate profile against job profile.',
    'Return JSON only.',
    'No markdown.',
    'No explanations.',
    'No extra text.',
    '',
    'Return this exact JSON shape:',
    '{',
    '  "semanticScore": 0,',
    '  "reasoning": ""',
    '}',
    '',
    'semanticScore must be a number between 0 and 1.',
    'Consider:',
    '- Skill relevance and depth',
    '- Domain alignment',
    '- Experience appropriateness',
    '- Overall candidate fit',
    '',
    'Candidate Skills:',
    JSON.stringify(resume.skills),
    '',
    'Candidate Technologies:',
    JSON.stringify(resume.technologies),
    '',
    'Candidate AI Capabilities:',
    JSON.stringify(resume.aiCapabilities),
    '',
    'Candidate Cloud Capabilities:',
    JSON.stringify(resume.cloudCapabilities),
    '',
    'Candidate Domains:',
    JSON.stringify(resume.domains),
    '',
    'Candidate Domain:',
    resume.domain || 'Unknown',
    '',
    'Job Required Skills:',
    JSON.stringify(jobProfile.requiredSkills),
    '',
    'Job Preferred Skills:',
    JSON.stringify(jobProfile.preferredSkills),
    '',
    'Job Domains:',
    JSON.stringify(jobProfile.domains),
    '',
    'Job Responsibilities:',
    JSON.stringify(jobProfile.responsibilities),
    '',
    'Job AI Requirements:',
    JSON.stringify(jobProfile.aiRequirements),
    '',
    'Job Cloud Requirements:',
    JSON.stringify(jobProfile.cloudRequirements),
  ].join('\n');
}

function calculateDeterministicSemanticResult(resume: ResumeSkillProfile): SemanticMatchResult {
  const allItems = [
    ...resume.skills,
    ...resume.technologies,
    ...resume.concepts,
    ...resume.domains,
    ...resume.aiCapabilities,
    ...resume.cloudCapabilities,
  ];
  const uniqueCount = new Set(allItems.map((s) => s.toLowerCase())).size;
  const skillDiversity = uniqueCount > 10 ? 0.8 : uniqueCount > 4 ? 0.6 : 0.4;
  const hasStrengths = (resume.strengths?.length ?? 0) > 0 ? 0.1 : 0;

  return {
    semanticScore: Math.min(skillDiversity + hasStrengths, 1),
    reasoning: 'Deterministic estimate based on profile breadth.',
  };
}

function normalizeSemanticScore(score: number): number {
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    return 0.5;
  }
  return Math.max(0, Math.min(1, score));
}
