import natural from 'natural';

const { TfIdf } = natural;

export type TfidfResult = {
  tfidfScore: number;
};

const stopWords = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'as',
  'is',
  'was',
  'are',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'shall',
  'can',
  'need',
  'must',
  'about',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'between',
  'out',
  'off',
  'over',
  'under',
  'again',
  'further',
  'then',
  'once',
  'here',
  'there',
  'when',
  'where',
  'why',
  'how',
  'all',
  'each',
  'every',
  'both',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'nor',
  'not',
  'only',
  'own',
  'same',
  'so',
  'than',
  'too',
  'very',
  'just',
  'because',
  'also',
  'if',
  'then',
  'else',
  'this',
  'that',
  'these',
  'those',
  'its',
  'it',
  'we',
  'they',
  'he',
  'she',
  'our',
  'their',
  'his',
  'her',
  'you',
  'your',
  'our',
  'what',
  'which',
  'who',
  'whom',
  'up',
  'down',
  'any',
  'new',
  'old',
  'good',
  'bad',
  'high',
  'low',
  'big',
  'small',
  'large',
  'little',
  'etc',
]);

function tokenize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w))
    .join(' ');
}

function buildCombinedText(
  skills: string[],
  domain: string | null,
  strengths: string[],
  technologies: string[],
  concepts: string[],
  domains: string[],
  aiCapabilities: string[],
  cloudCapabilities: string[],
): string {
  const parts: string[] = [];

  if (skills.length > 0) {
    parts.push(skills.join(' '));
  }

  if (domain) {
    parts.push(domain);
  }

  if (strengths.length > 0) {
    parts.push(strengths.join(' '));
  }

  if (technologies.length > 0) {
    parts.push(technologies.join(' '));
  }

  if (concepts.length > 0) {
    parts.push(concepts.join(' '));
  }

  if (domains.length > 0) {
    parts.push(domains.join(' '));
  }

  if (aiCapabilities.length > 0) {
    parts.push(aiCapabilities.join(' '));
  }

  if (cloudCapabilities.length > 0) {
    parts.push(cloudCapabilities.join(' '));
  }

  return parts.join(' ');
}

function buildJobText(jobProfile: {
  jobTitle: string;
  jobSummary: string;
  requiredSkills: string[];
  preferredSkills: string[];
  domains: string[];
  responsibilities: string[];
  keywords: string[];
  aiRequirements: string[];
  cloudRequirements: string[];
}): string {
  const parts: string[] = [];

  if (jobProfile.jobTitle) {
    parts.push(jobProfile.jobTitle);
  }

  if (jobProfile.jobSummary) {
    parts.push(jobProfile.jobSummary);
  }

  if (jobProfile.requiredSkills.length > 0) {
    parts.push(jobProfile.requiredSkills.join(' '));
  }

  if (jobProfile.preferredSkills.length > 0) {
    parts.push(jobProfile.preferredSkills.join(' '));
  }

  if (jobProfile.domains.length > 0) {
    parts.push(jobProfile.domains.join(' '));
  }

  if (jobProfile.responsibilities.length > 0) {
    parts.push(jobProfile.responsibilities.join(' '));
  }

  if (jobProfile.keywords.length > 0) {
    parts.push(jobProfile.keywords.join(' '));
  }

  if (jobProfile.aiRequirements.length > 0) {
    parts.push(jobProfile.aiRequirements.join(' '));
  }

  if (jobProfile.cloudRequirements.length > 0) {
    parts.push(jobProfile.cloudRequirements.join(' '));
  }

  return parts.join(' ');
}

export function computeTfidfSimilarity(
  resumeProfile: {
    skills: string[];
    domain: string | null;
    strengths: string[];
    technologies: string[];
    concepts: string[];
    domains: string[];
    aiCapabilities: string[];
    cloudCapabilities: string[];
  },
  jobProfile: {
    jobTitle: string;
    jobSummary: string;
    requiredSkills: string[];
    preferredSkills: string[];
    domains: string[];
    responsibilities: string[];
    keywords: string[];
    aiRequirements: string[];
    cloudRequirements: string[];
  },
): TfidfResult {
  const resumeText = tokenize(
    buildCombinedText(
      resumeProfile.skills,
      resumeProfile.domain,
      resumeProfile.strengths,
      resumeProfile.technologies,
      resumeProfile.concepts,
      resumeProfile.domains,
      resumeProfile.aiCapabilities,
      resumeProfile.cloudCapabilities,
    ),
  );

  const jobText = tokenize(buildJobText(jobProfile));

  if (!resumeText || !jobText) {
    return { tfidfScore: 0 };
  }

  const tfidf = new TfIdf();

  tfidf.addDocument(resumeText);
  tfidf.addDocument(jobText);

  const terms0 = tfidf.listTerms(0);
  const terms1 = tfidf.listTerms(1);

  const allTerms = new Set<string>();

  for (const term of terms0) {
    allTerms.add(term.term);
  }

  for (const term of terms1) {
    allTerms.add(term.term);
  }

  const termToScore0 = new Map<string, number>();
  const termToScore1 = new Map<string, number>();

  for (const term of terms0) {
    termToScore0.set(term.term, term.tfidf);
  }

  for (const term of terms1) {
    termToScore1.set(term.term, term.tfidf);
  }

  let dotProduct = 0;
  let magnitude0 = 0;
  let magnitude1 = 0;

  for (const term of allTerms) {
    const score0 = termToScore0.get(term) ?? 0;
    const score1 = termToScore1.get(term) ?? 0;

    dotProduct += score0 * score1;
    magnitude0 += score0 * score0;
    magnitude1 += score1 * score1;
  }

  const mag0 = Math.sqrt(magnitude0);
  const mag1 = Math.sqrt(magnitude1);

  if (mag0 === 0 || mag1 === 0) {
    return { tfidfScore: 0 };
  }

  const cosineSimilarity = dotProduct / (mag0 * mag1);

  const tfidfScore = Math.round(cosineSimilarity * 100);

  return { tfidfScore: Math.max(0, Math.min(100, tfidfScore)) };
}
