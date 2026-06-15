export type JobAnalyzeInput = {
  userId: string;
  resumeId: string;
  jobDescription: string;
};

export type JobProfile = {
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

export type ResumeSkillProfile = {
  skills: string[];
  experienceYears: number | null;
  domain: string | null;
  strengths: string[];
  technologies: string[];
  concepts: string[];
  domains: string[];
  aiCapabilities: string[];
  cloudCapabilities: string[];
};

export type SemanticMatchResult = {
  semanticScore: number;
  reasoning: string;
};

export type CategoryScores = {
  skills: number;
  technologies: number;
  aiCapabilities: number;
  cloudCapabilities: number;
  responsibilities: number;
  domains: number;
};

export type JobAnalysisResult = {
  jobTitle: string;
  matchPercentage: number;
  tfidfScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  criticalGaps: string[];
  recommendations: string[];
  interviewFocusAreas: string[];
  analysisSource: string;
  categoryScores: CategoryScores;
};

export type SkillDefinition = {
  name: string;
  patterns: RegExp[];
};
