import type { JobProfile } from '../job.types.js';

const skillPatterns: { name: string; patterns: RegExp[] }[] = [
  { name: 'React', patterns: [/\bReact(?:\.js|JS)?\b/i] },
  { name: 'Node.js', patterns: [/\bNode(?:\.js|JS)?\b/i] },
  { name: 'TypeScript', patterns: [/\bTypeScript\b/i, /\bTS\b/] },
  { name: 'JavaScript', patterns: [/\bJavaScript\b/i, /\bJS\b/] },
  { name: 'Express', patterns: [/\bExpress(?:\.js|JS)?\b/i] },
  { name: 'NestJS', patterns: [/\bNestJS\b/i, /\bNest\.js\b/i] },
  { name: 'MongoDB', patterns: [/\bMongoDB\b/i, /\bMongo\b/i] },
  { name: 'PostgreSQL', patterns: [/\bPostgreSQL\b/i, /\bPostgres\b/i] },
  { name: 'MySQL', patterns: [/\bMySQL\b/i] },
  { name: 'Redis', patterns: [/\bRedis\b/i] },
  { name: 'AWS', patterns: [/\bAWS\b/i, /\bAmazon Web Services\b/i] },
  { name: 'Azure', patterns: [/\bAzure\b/i] },
  { name: 'GCP', patterns: [/\bGCP\b/i, /\bGoogle Cloud\b/i] },
  { name: 'Docker', patterns: [/\bDocker\b/i] },
  { name: 'Kubernetes', patterns: [/\bKubernetes\b/i, /\bK8s\b/i] },
  { name: 'Python', patterns: [/\bPython\b/i] },
  { name: 'Django', patterns: [/\bDjango\b/i] },
  { name: 'FastAPI', patterns: [/\bFastAPI\b/i] },
  { name: 'Java', patterns: [/\bJava\b/i] },
  { name: 'Spring Boot', patterns: [/\bSpring Boot\b/i] },
  { name: 'GraphQL', patterns: [/\bGraphQL\b/i] },
  { name: 'REST API', patterns: [/\bREST(?:ful)?\s+API(?:s)?\b/i, /\bREST\b/] },
  { name: 'LangChain', patterns: [/\bLangChain\b/i] },
  { name: 'LangGraph', patterns: [/\bLangGraph\b/i] },
  { name: 'RAG', patterns: [/\bRAG\b/i, /\bRetrieval[-\s]+Augmented Generation\b/i] },
  { name: 'LLM APIs', patterns: [/\bLLM(?:s)?\s+API(?:s)?\b/i, /\bOpenAI\s+API(?:s)?\b/i] },
  { name: 'Prompt Workflows', patterns: [/\bprompt\s+workflows?\b/i] },
  { name: 'Prompt Engineering', patterns: [/\bprompt\s+engineering\b/i] },
  { name: 'Embeddings', patterns: [/\bembeddings?\b/i] },
  { name: 'Document Intelligence', patterns: [/\bdocument\s+intelligence\b/i] },
  { name: 'Semantic Search', patterns: [/\bsemantic\s+search\b/i] },
  { name: 'Vector Search', patterns: [/\bvector\s+search\b/i] },
  { name: 'OpenAI', patterns: [/\bOpenAI\b/i] },
  { name: 'AWS Bedrock', patterns: [/\bAWS\s+Bedrock\b/i, /\bBedrock\b/i] },
  { name: 'SageMaker', patterns: [/\bSageMaker\b/i] },
  { name: 'Hugging Face', patterns: [/\bHugging\s+Face\b/i] },
  { name: 'Firebase', patterns: [/\bFirebase\b/i] },
  { name: 'Socket.IO', patterns: [/\bSocket\.?IO\b/i, /\bSocketIO\b/i] },
  { name: 'CI/CD', patterns: [/\bCI\/CD\b/i, /\bContinuous Integration\b/i] },
  { name: 'EC2', patterns: [/\bEC2\b/i] },
  { name: 'S3', patterns: [/\bS3\b/i] },
  { name: 'Lambda', patterns: [/\bLambda\b/i] },
  { name: 'RDS', patterns: [/\bRDS\b/i] },
  { name: 'API Gateway', patterns: [/\bAPI\s+Gateway\b/i] },
  { name: 'IAM', patterns: [/\bIAM\b/i] },
  { name: 'CloudWatch', patterns: [/\bCloudWatch\b/i] },
  { name: 'ECS', patterns: [/\bECS\b/i] },
  { name: 'EKS', patterns: [/\bEKS\b/i] },
  { name: 'AWS CodePipeline', patterns: [/\bAWS\s+CodePipeline\b/i, /\bCodePipeline\b/i] },
  { name: 'Jenkins', patterns: [/\bJenkins\b/i] },
  { name: 'GitHub Actions', patterns: [/\bGitHub\s+Actions\b/i] },
  { name: 'Git', patterns: [/\bGit\b/i, /\bGitHub\b/i, /\bGitLab\b/i] },
  { name: 'HTML5', patterns: [/\bHTML5?\b/i] },
  { name: 'CSS3', patterns: [/\bCSS3?\b/i] },
  { name: 'Material UI', patterns: [/\bMaterial\s+UI\b/i, /\bMUI\b/] },
  { name: 'Redux', patterns: [/\bRedux\b/i] },
  { name: 'WebSockets', patterns: [/\bWebSockets?\b/i] },
  { name: 'Microservices', patterns: [/\bMicroservices?\b/i] },
  { name: 'Linux', patterns: [/\bLinux\b/i] },
  { name: 'RBAC', patterns: [/\bRBAC\b/i, /\bRole[-\s]?Based Access Control\b/i] },
  { name: 'Secrets Management', patterns: [/\bsecrets?\s+management\b/i] },
  { name: 'Encryption', patterns: [/\bencryption\b/i] },
  { name: 'Audit Trails', patterns: [/\baudit\s+trails?\b/i] },
  { name: 'Observability', patterns: [/\bobservability\b/i] },
  { name: 'pgvector', patterns: [/\bpgvector\b/i] },
  { name: 'OpenSearch', patterns: [/\bOpenSearch\b/i] },
  { name: 'FAISS', patterns: [/\bFAISS\b/i] },
];

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
]);

const keywordStopWords = new Set([
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
]);

function extractKeywords(text: string, limit = 20): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !keywordStopWords.has(w));

  const freq = new Map<string, number>();

  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

export function parseJobDescriptionDeterministic(text: string): JobProfile {
  const requiredSkills = skillPatterns
    .filter((s) => s.patterns.some((p) => p.test(text)))
    .map((s) => s.name);

  const directExperiencePattern =
    /\b(\d{1,2}(?:\.\d)?)\s*\+?\s*(?:years?|yrs?)\b(?:\s+(?:of\s+)?(?:professional\s+)?experience)?/gi;
  const rangeExperiencePattern =
    /\b(\d{1,2}(?:\.\d)?)\s*(?:[-\u2010-\u2015]|to)\s*(\d{1,2}(?:\.\d)?)\s*(?:years?|yrs?)\b/gi;

  const directMatches = Array.from(text.matchAll(directExperiencePattern)).map((m) => Number(m[1]));
  const rangeMatches = Array.from(text.matchAll(rangeExperiencePattern)).map((m) => Number(m[1]));

  const candidates = [...directMatches, ...rangeMatches].filter(
    (v) => Number.isFinite(v) && v >= 0 && v <= 50,
  );

  const requiredExperience = candidates.length > 0 ? Math.min(...candidates) : 0;

  return {
    jobTitle: '',
    jobSummary: '',
    requiredSkills,
    preferredSkills: [],
    requiredExperience,
    domains: [],
    responsibilities: [],
    keywords: extractKeywords(text),
    aiRequirements: requiredSkills.filter((skill) => aiSkillNames.has(skill)),
    cloudRequirements: requiredSkills.filter((skill) => cloudSkillNames.has(skill)),
  };
}
