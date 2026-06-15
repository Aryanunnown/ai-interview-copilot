import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { analyzeJobDescription } from './job.analyzer.js';
import { normalizeSkill, fuzzyConfidence, matchSkill } from './services/skill-normalizer.js';

const emptyResumeExtras = {
  technologies: [] as string[],
  concepts: [] as string[],
  domains: [] as string[],
  aiCapabilities: [] as string[],
  cloudCapabilities: [] as string[],
};

const emptyJobExtras = {
  aiRequirements: [] as string[],
  cloudRequirements: [] as string[],
};

describe('job skill normalization', () => {
  it('normalizes aliases, punctuation, and singular/plural variants', () => {
    assert.equal(normalizeSkill('JavaScript'), 'JavaScript');
    assert.equal(normalizeSkill('Javascript'), 'JavaScript');
    assert.equal(normalizeSkill('js'), 'JavaScript');
    assert.equal(normalizeSkill('JS'), 'JavaScript');
    assert.equal(normalizeSkill('NodeJS'), 'Node.js');
    assert.equal(normalizeSkill('node js'), 'Node.js');
    assert.equal(normalizeSkill('ReactJS'), 'React');
    assert.equal(normalizeSkill('react js'), 'React');
    assert.equal(normalizeSkill('Postgres'), 'PostgreSQL');
    assert.equal(normalizeSkill('postgresql'), 'PostgreSQL');
    assert.equal(normalizeSkill('mongo'), 'MongoDB');
    assert.equal(normalizeSkill('MongoDB'), 'MongoDB');
  });

  it('matches resume skills against JD skills after normalization', () => {
    const technologies = [
      'JavaScript',
      'REST APIs',
      'CI/CD pipelines',
      'Git',
      'Postgres',
      'Kubernetes',
      'AWS',
    ];
    const result = analyzeJobDescription(
      {
        jobTitle: 'Full Stack Developer',
        jobSummary: '',
        requiredSkills: [
          'JavaScript',
          'REST API',
          'CI/CD',
          'Git',
          'PostgreSQL',
          'Kubernetes',
          'AWS',
        ],
        preferredSkills: [],
        requiredExperience: 3,
        domains: ['Full Stack'],
        responsibilities: [],
        keywords: [],
        ...emptyJobExtras,
      },
      {
        skills: technologies,
        experienceYears: 3,
        domain: 'Full Stack',
        strengths: [],
        ...emptyResumeExtras,
        technologies,
        domains: ['Full Stack'],
      },
      null,
    );

    assert.deepEqual(
      new Set(result.matchedSkills),
      new Set(['JavaScript', 'PostgreSQL', 'AWS', 'Kubernetes', 'REST API', 'CI/CD', 'Git']),
    );
    assert.deepEqual(result.missingSkills, []);
    assert.equal(result.matchPercentage, 83);
  });

  it('detects missing skills correctly', () => {
    const result = analyzeJobDescription(
      {
        jobTitle: 'AI Engineer',
        jobSummary: '',
        requiredSkills: ['Python', 'LangChain', 'RAG', 'AWS', 'Docker'],
        preferredSkills: ['GraphQL'],
        requiredExperience: 0,
        domains: ['AI/ML'],
        responsibilities: [],
        keywords: [],
        ...emptyJobExtras,
      },
      {
        skills: ['Python', 'Django', 'PostgreSQL'],
        experienceYears: 2,
        domain: 'Backend',
        strengths: [],
        ...emptyResumeExtras,
      },
      null,
    );

    assert.deepEqual(result.matchedSkills, ['Python']);
    assert.deepEqual(result.missingSkills, ['LangChain', 'RAG', 'AWS', 'Docker']);
    assert.ok(result.matchPercentage < 100);
    assert.ok(result.criticalGaps.length > 0);
    assert.ok(result.interviewFocusAreas.length > 0);
  });

  it('matches AWS skill alias variants correctly', () => {
    const result = analyzeJobDescription(
      {
        jobTitle: 'Backend Developer',
        jobSummary: '',
        requiredSkills: ['AWS'],
        preferredSkills: [],
        requiredExperience: 0,
        domains: ['Backend'],
        responsibilities: [],
        keywords: [],
        ...emptyJobExtras,
      },
      {
        skills: ['AWS Services'],
        experienceYears: 2,
        domain: 'Backend',
        strengths: [],
        ...emptyResumeExtras,
      },
      null,
    );

    assert.deepEqual(result.matchedSkills, ['AWS']);
    assert.deepEqual(result.missingSkills, []);
  });

  it('matches equivalent skill variants in analyzeJobDescription', () => {
    const technologies = ['NodeJS', 'Postgres', 'Mongo', 'REST APIs', 'JS'];
    const result = analyzeJobDescription(
      {
        jobTitle: 'Full Stack Developer',
        jobSummary: '',
        requiredSkills: ['Node.js', 'PostgreSQL', 'MongoDB', 'REST API', 'JavaScript'],
        preferredSkills: [],
        requiredExperience: 0,
        domains: ['Full Stack'],
        responsibilities: [],
        keywords: [],
        ...emptyJobExtras,
      },
      {
        skills: technologies,
        experienceYears: 0,
        domain: 'Full Stack',
        strengths: [],
        ...emptyResumeExtras,
        technologies,
      },
      null,
    );

    assert.deepEqual(
      new Set(result.matchedSkills),
      new Set(['Node.js', 'PostgreSQL', 'MongoDB', 'REST API', 'JavaScript']),
    );
    assert.deepEqual(result.missingSkills, []);
  });

  it('returns categoryScores with all categories', () => {
    const technologies = ['NodeJS', 'Postgres', 'Mongo', 'REST APIs', 'JS'];
    const result = analyzeJobDescription(
      {
        jobTitle: 'Full Stack Developer',
        jobSummary: '',
        requiredSkills: ['Node.js', 'PostgreSQL'],
        preferredSkills: [],
        requiredExperience: 0,
        domains: ['Full Stack'],
        responsibilities: ['Build APIs'],
        keywords: [],
        ...emptyJobExtras,
        aiRequirements: ['LLM', 'RAG'],
        cloudRequirements: ['AWS'],
      },
      {
        skills: technologies,
        experienceYears: 0,
        domain: 'Full Stack',
        strengths: [],
        ...emptyResumeExtras,
        technologies,
      },
      null,
    );

    assert.ok(typeof result.categoryScores.skills === 'number');
    assert.ok(typeof result.categoryScores.technologies === 'number');
    assert.ok(typeof result.categoryScores.aiCapabilities === 'number');
    assert.ok(typeof result.categoryScores.cloudCapabilities === 'number');
    assert.ok(typeof result.categoryScores.responsibilities === 'number');
    assert.ok(typeof result.categoryScores.domains === 'number');
  });

  it('fuzzyConfidence returns 1 for exact matches', () => {
    assert.equal(fuzzyConfidence('AWS', 'AWS'), 1);
    assert.equal(fuzzyConfidence('Python', 'Python'), 1);
  });

  it('fuzzyConfidence returns 0.9 for token containment', () => {
    assert.equal(fuzzyConfidence('AWS', 'AWS Services'), 0.9);
    assert.equal(fuzzyConfidence('AWS Services', 'AWS'), 0.9);
    assert.equal(fuzzyConfidence('AWS Lambda', 'AWS'), 0.9);
  });

  it('fuzzyConfidence returns < 0.85 for unrelated skills', () => {
    assert.ok(fuzzyConfidence('Docker', 'Django') < 0.85);
    assert.ok(fuzzyConfidence('React', 'Redis') < 0.85);
  });

  it('matchSkill returns exact match for identical skills', () => {
    const result = matchSkill('Python', ['Python', 'Django']);
    assert.notEqual(result, null);
    assert.equal(result!.matchType, 'exact');
    assert.equal(result!.confidence, 1);
  });

  it('matchSkill returns alias match for variant skills', () => {
    const result = matchSkill('PostgreSQL', ['Postgres']);
    assert.notEqual(result, null);
    assert.equal(result!.matchType, 'alias');
    assert.equal(result!.confidence, 1);
  });

  it('matchSkill returns fuzzy match for token-contained skills', () => {
    const result = matchSkill('AWS', ['AWS Services']);
    assert.notEqual(result, null);
    assert.equal(result!.confidence, 1);

    const fuzzy = matchSkill('AWS Lambda', ['AWS']);
    assert.notEqual(fuzzy, null);
    assert.equal(fuzzy!.matchType, 'fuzzy');
    assert.equal(fuzzy!.confidence, 0.9);
  });

  it('matchSkill returns null for no match', () => {
    const result = matchSkill('Kubernetes', ['Python', 'Django']);
    assert.equal(result, null);
  });

  it('fuzzyConfidence returns 0.85 for substring token overlap', () => {
    assert.equal(fuzzyConfidence('Backend Services', 'Microservices'), 0.85);
    assert.equal(fuzzyConfidence('Microservices', 'Backend Services'), 0.85);
    assert.equal(fuzzyConfidence('Backend Services', 'Backend Engineering'), 0.85);
  });

  it('matchSkill matches phrasal JD skills via substring token overlap', () => {
    const result = matchSkill('Backend Services', ['Microservices', 'Node.js', 'REST APIs']);
    assert.notEqual(result, null, 'Backend Services should match Microservices via substring');
    assert.equal(result!.confidence, 0.85);

    const result2 = matchSkill('AI/ML capabilities', ['AI/ML']);
    assert.notEqual(result2, null, 'AI/ML capabilities should match AI/ML via token containment');
    assert.equal(result2!.confidence, 0.9);
  });

  it('matchSkill matches umbrella terms like AI/ML capabilities against concrete resume skills', () => {
    const resumeItems = ['RAG', 'LangChain', 'OpenAI GPT-4', 'Node.js', 'Express.js'];
    const result = matchSkill('AI/ML capabilities', resumeItems);
    assert.notEqual(result, null, 'AI/ML capabilities should match RAG via umbrella term mapping');
    assert.equal(result!.matchedSkill, 'RAG');

    const result2 = matchSkill('Backend Services', ['Node.js', 'Microservices', 'REST APIs']);
    assert.notEqual(
      result2,
      null,
      'Backend Services should match Node.js via umbrella term mapping',
    );

    const result3 = matchSkill('RBAC', ['Role-Based Access Control (RBAC)']);
    assert.notEqual(
      result3,
      null,
      'RBAC should match Role-Based Access Control via alias + token containment',
    );
    assert.ok(result3!.confidence >= 0.85);
  });
});
