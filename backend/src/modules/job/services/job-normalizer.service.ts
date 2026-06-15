const skillAliases: Record<string, string> = {
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

export function normalizeSkill(skill: string): string {
  const key = skill
    .trim()
    .toLowerCase()
    .replace(/[.\s-/]+/g, ' ');

  return skillAliases[key] ?? skill.trim();
}

export function normalizeSkills(skills: string[]): string[] {
  const seen = new Map<string, string>();

  for (const skill of skills) {
    const normalized = normalizeSkill(skill);
    const key = normalized.toLowerCase();

    if (!key) {
      continue;
    }

    seen.set(key, normalized);
  }

  return Array.from(seen.values()).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  );
}
