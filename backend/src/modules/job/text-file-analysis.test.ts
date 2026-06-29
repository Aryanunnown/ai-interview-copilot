import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { URL } from 'node:url';
import { analyzeJobDescription } from './job.analyzer.js';
import type { ResumeSkillProfile } from './job.types.js';
import { parseJobDescriptionDeterministic } from './services/job-fallback-parser.service.js';
import { parseResumeText } from '../resume/resume.parser.js';

const aiSkillNames = new Set([
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

const cloudSkillNames = new Set([
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

function readBackendTextFile(fileName: string) {
  return readFileSync(new URL(`../../../${fileName}`, import.meta.url), 'utf8');
}

function buildResumeProfile(resumeText: string): ResumeSkillProfile {
  const parsedResume = parseResumeText(resumeText);

  return {
    skills: parsedResume.skills,
    experienceYears: parsedResume.experienceYears,
    domain: parsedResume.domain,
    strengths: [],
    technologies: parsedResume.skills,
    concepts: [],
    domains: [],
    aiCapabilities: parsedResume.skills.filter((skill) => aiSkillNames.has(skill)),
    cloudCapabilities: parsedResume.skills.filter((skill) => cloudSkillNames.has(skill)),
  };
}

describe('JD.txt and resume.txt analysis', () => {
  it('extracts granular AI and AWS requirements and reports missing skills correctly', () => {
    const jobProfile = parseJobDescriptionDeterministic(readBackendTextFile('JD.txt'));
    const resumeProfile = buildResumeProfile(readBackendTextFile('resume.txt'));
    const result = analyzeJobDescription(jobProfile, resumeProfile, null);

    for (const skill of [
      'LLM APIs',
      'Prompt Workflows',
      'Embeddings',
      'Document Intelligence',
      'Semantic Search',
      'EC2',
      'S3',
      'Lambda',
      'RDS',
      'API Gateway',
      'IAM',
      'CloudWatch',
      'ECS',
      'EKS',
    ]) {
      assert.ok(jobProfile.requiredSkills.includes(skill), `${skill} should be extracted from JD`);
    }

    for (const skill of ['LLM APIs', 'Vector Search', 'OpenAI', 'LangChain', 'RAG']) {
      assert.ok(result.matchedSkills.includes(skill), `${skill} should be matched from resume`);
      assert.ok(!result.missingSkills.includes(skill), `${skill} should not be missing`);
    }

    for (const skill of [
      'Prompt Workflows',
      'Embeddings',
      'Document Intelligence',
      'Semantic Search',
      'AWS Bedrock',
      'SageMaker',
      'Hugging Face',
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
    ]) {
      assert.ok(result.missingSkills.includes(skill), `${skill} should be missing`);
    }
  });
});
