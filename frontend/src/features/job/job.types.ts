export type JobAnalysisRequest = {
  resumeId: string;
  jobDescription: string;
};

export type ResumeListItem = {
  id: string;
  title: string | null;
  fileName: string | null;
  createdAt: string;
};

export type JobAnalysisResponse = {
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
};
