import { SKILL_ALIASES } from './skill-aliases.js';

export type SkillMatchResult = {
  jdSkill: string;
  matchedSkill: string;
  confidence: number;
  matchType: 'exact' | 'alias' | 'fuzzy' | 'token-substring';
};

// Maps umbrella/category terms from JD to the concrete skills/tokens
// that satisfy them in a resume. This bridges semantic gaps where a JD
// asks for a broad category (e.g. "AI/ML capabilities") and the resume
// lists specific technologies under that category (e.g. "RAG, LangChain").
const UMBRELLA_TERMS: Record<string, string[]> = {
  ai: [
    'ai',
    'ai/ml',
    'rag',
    'langchain',
    'langgraph',
    'openai',
    'genai',
    'generative ai',
    'machine learning',
    'nlp',
    'llm',
    'embedding',
    'vector search',
    'semantic search',
    'document intelligence',
    'prompt engineering',
  ],
  ml: [
    'ml',
    'ai/ml',
    'rag',
    'langchain',
    'langgraph',
    'openai',
    'genai',
    'scikit learn',
    'gradient boosting',
    'machine learning',
    'nlp',
    'llm',
    'pandas',
  ],
  backend: [
    'node',
    'nodejs',
    'express',
    'expressjs',
    'fastapi',
    'microservices',
    'rest api',
    'api',
    'server',
    'soap',
  ],
};

const GENERIC_SHARED_TOKENS = new Set([
  'action',
  'actions',
  'api',
  'apis',
  'automation',
  'capabilities',
  'capability',
  'cloud',
  'database',
  'databases',
  'engineering',
  'management',
  'pipeline',
  'pipelines',
  'search',
  'service',
  'services',
  'workflow',
  'workflows',
]);

export function normalizeSkill(skill: string): string {
  const key = skill
    .trim()
    .toLowerCase()
    .replace(/[.\s-/]+/g, ' ')
    .replace(/[()\]{}[]+/g, '')
    .trim();

  return SKILL_ALIASES[key] ?? skill.trim();
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .trim()
    .replace(/[()\]{}[]+/g, '')
    .split(/[\s-/]+/)
    .filter(Boolean);
}

function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const bigrams = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const bg = a.slice(i, i + 2);
    bigrams.set(bg, (bigrams.get(bg) ?? 0) + 1);
  }

  let intersectionSize = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bg = b.slice(i, i + 2);
    const count = bigrams.get(bg) ?? 0;
    if (count > 0) {
      bigrams.set(bg, count - 1);
      intersectionSize++;
    }
  }

  return (2 * intersectionSize) / (a.length + b.length - 2);
}

export function fuzzyConfidence(a: string, b: string): number {
  const normA = a
    .trim()
    .toLowerCase()
    .replace(/[.\s-/]+/g, ' ')
    .replace(/[()\]{}[]+/g, '')
    .trim();
  const normB = b
    .trim()
    .toLowerCase()
    .replace(/[.\s-/]+/g, ' ')
    .replace(/[()\]{}[]+/g, '')
    .trim();

  if (normA === normB) return 1;

  const aTokens = tokenize(normA);
  const bTokens = tokenize(normB);

  const shorter = aTokens.length <= bTokens.length ? aTokens : bTokens;
  const longer = aTokens.length <= bTokens.length ? bTokens : aTokens;

  if (shorter.every((t) => longer.includes(t))) {
    return 0.9;
  }

  // substring token matching: if any meaningful token (len >= 3) from either
  // side appears as a substring in a token from the other side
  for (const t1 of aTokens) {
    if (t1.length < 3) continue;
    for (const t2 of bTokens) {
      if (t2.length < 3) continue;
      if (t1.includes(t2) || t2.includes(t1)) {
        return 0.85;
      }
    }
  }

  return diceCoefficient(normA, normB);
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

export function matchSkill(
  jdSkill: string,
  resumeSkills: string[],
  threshold = 0.85,
): SkillMatchResult | null {
  let best: SkillMatchResult | null = null;

  const jdNormalized = normalizeSkill(jdSkill);

  for (const resumeSkill of resumeSkills) {
    const resumeNormalized = normalizeSkill(resumeSkill);

    if (jdNormalized === resumeNormalized) {
      const matchType =
        jdNormalized !== jdSkill || resumeNormalized !== resumeSkill ? 'alias' : 'exact';
      return {
        jdSkill,
        matchedSkill: resumeSkill,
        confidence: 1,
        matchType,
      };
    }
  }

  // Normalize resume items once for umbrella matching
  const jdTokens = tokenize(jdNormalized);
  const resumeNormalizedSet = new Set(resumeSkills.map(normalizeSkill));
  const resumeTokens = new Set<string>();
  for (const rn of resumeNormalizedSet) {
    for (const t of tokenize(rn)) {
      resumeTokens.add(t);
    }
  }

  // Umbrella-term fallback: if any JD token maps to an umbrella category,
  // check whether ANY resume token satisfies that category. This handles
  // cases like JD asking for "AI/ML capabilities" when the resume has
  // "RAG, LangChain, OpenAI".
  for (const jdToken of jdTokens) {
    const concreteSkills = UMBRELLA_TERMS[jdToken];
    if (!concreteSkills) continue;

    for (const resumeToken of resumeTokens) {
      for (const concrete of concreteSkills) {
        if (resumeToken.includes(concrete)) {
          return {
            jdSkill,
            matchedSkill:
              matchByUmbrella(resumeSkills, resumeNormalizedSet, concrete) ?? resumeSkills[0],
            confidence: 0.85,
            matchType: 'fuzzy',
          };
        }
      }
    }
  }

  for (const resumeSkill of resumeSkills) {
    const resumeNormalized = normalizeSkill(resumeSkill);
    const confidence = fuzzyConfidence(jdNormalized, resumeNormalized);

    if (
      confidence >= threshold &&
      isAcceptableFuzzyMatch(jdNormalized, resumeNormalized) &&
      (!best || confidence > best.confidence)
    ) {
      best = {
        jdSkill,
        matchedSkill: resumeSkill,
        confidence,
        matchType: 'fuzzy',
      };
    }
  }

  return best;
}

function isAcceptableFuzzyMatch(jdSkill: string, resumeSkill: string): boolean {
  const jdTokens = tokenize(jdSkill);
  const resumeTokens = tokenize(resumeSkill);

  if (jdTokens.length === 0 || resumeTokens.length === 0) {
    return false;
  }

  const resumeTokenSet = new Set(resumeTokens);
  const sharedTokens = jdTokens.filter((token) => resumeTokenSet.has(token));
  const resumeIsOnlySubset =
    resumeTokens.length < jdTokens.length &&
    resumeTokens.every((token) => jdTokens.includes(token));

  if (resumeIsOnlySubset) {
    return false;
  }

  if (sharedTokens.length > 0 && sharedTokens.every((token) => GENERIC_SHARED_TOKENS.has(token))) {
    return false;
  }

  const hasSubstringOverlap = jdTokens.some((jdToken) =>
    resumeTokens.some(
      (resumeToken) =>
        jdToken !== resumeToken && (jdToken.includes(resumeToken) || resumeToken.includes(jdToken)),
    ),
  );

  return !hasSubstringOverlap;
}

function matchByUmbrella(
  resumeSkills: string[],
  normalizedSet: Set<string>,
  concrete: string,
): string | null {
  for (const skill of resumeSkills) {
    const norm = normalizeSkill(skill).toLowerCase();
    if (norm.includes(concrete)) {
      return skill;
    }
  }
  return null;
}
