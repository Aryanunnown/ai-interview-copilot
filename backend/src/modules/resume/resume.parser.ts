import type { Buffer } from 'node:buffer';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { HttpError } from '../../utils/httpError.js';
import type {
  ParsedEducation,
  ParsedResumeData,
  ResumeDomain,
  ResumeUploadedFile,
} from './resume.types.js';

type ResumeFileInput = Pick<ResumeUploadedFile, 'buffer' | 'mimetype'>;

type SkillDefinition = {
  name: string;
  patterns: RegExp[];
};

const skillDefinitions: SkillDefinition[] = [
  { name: 'React', patterns: [/\bReact(?:\.js|JS)?\b/i] },
  { name: 'Node', patterns: [/\bNode(?:\.js|JS)?\b/i] },
  { name: 'TypeScript', patterns: [/\bTypeScript\b/i, /\bTS\b/] },
  { name: 'JavaScript', patterns: [/\bJavaScript\b/i, /\bJS\b/] },
  { name: 'Python', patterns: [/\bPython\b/i] },
  { name: 'PostgreSQL', patterns: [/\bPostgreSQL\b/i, /\bPostgres\b/i] },
  { name: 'MongoDB', patterns: [/\bMongoDB\b/i, /\bMongo\b/i] },
  { name: 'AWS', patterns: [/\bAWS\b/i, /\bAmazon Web Services\b/i] },
  { name: 'Docker', patterns: [/\bDocker\b/i] },
  { name: 'Kubernetes', patterns: [/\bKubernetes\b/i, /\bK8s\b/i] },
  { name: 'Git', patterns: [/\bGit\b/i, /\bGitHub\b/i, /\bGitLab\b/i] },
  { name: 'CI/CD', patterns: [/\bCI\/CD\b/i, /\bContinuous Integration\b/i] },
  { name: 'REST API', patterns: [/\bREST(?:ful)?\s+API(?:s)?\b/i, /\bREST\b/] },
  { name: 'Express', patterns: [/\bExpress(?:\.js|JS)?\b/i] },
  { name: 'FastAPI', patterns: [/\bFastAPI\b/i] },
  { name: 'LangChain', patterns: [/\bLangChain\b/i] },
  { name: 'LangGraph', patterns: [/\bLangGraph\b/i] },
  { name: 'RAG', patterns: [/\bRAG\b/i, /\bRetrieval[-\s]+Augmented Generation\b/i] },
  {
    name: 'LLM APIs',
    patterns: [/\bLLM(?:s)?\s+API(?:s)?\b/i, /\bOpenAI\s+(?:GPT[-\s]?\d+|API(?:s)?)\b/i],
  },
  { name: 'Prompt Workflows', patterns: [/\bprompt\s+workflows?\b/i] },
  { name: 'Prompt Engineering', patterns: [/\bprompt\s+engineering\b/i] },
  { name: 'Embeddings', patterns: [/\bembeddings?\b/i] },
  { name: 'Document Intelligence', patterns: [/\bdocument\s+intelligence\b/i] },
  { name: 'Semantic Search', patterns: [/\bsemantic\s+search\b/i] },
  { name: 'Vector Search', patterns: [/\bvector\s+search\b/i, /\bvector\s+database\b/i] },
  { name: 'OpenAI', patterns: [/\bOpenAI\b/i] },
  { name: 'AWS Bedrock', patterns: [/\bAWS\s+Bedrock\b/i, /\bBedrock\b/i] },
  { name: 'SageMaker', patterns: [/\bSageMaker\b/i] },
  { name: 'Hugging Face', patterns: [/\bHugging\s+Face\b/i] },
  { name: 'Firebase', patterns: [/\bFirebase\b/i] },
  { name: 'Redis', patterns: [/\bRedis\b/i] },
  { name: 'Socket.IO', patterns: [/\bSocket\.?IO\b/i, /\bSocketIO\b/i] },
  { name: 'MySQL', patterns: [/\bMySQL\b/i] },
  { name: 'GraphQL', patterns: [/\bGraphQL\b/i] },
  { name: 'Pinecone', patterns: [/\bPinecone\b/i] },
  { name: 'pgvector', patterns: [/\bpgvector\b/i] },
  { name: 'OpenSearch', patterns: [/\bOpenSearch\b/i] },
  { name: 'FAISS', patterns: [/\bFAISS\b/i] },
  { name: 'Java', patterns: [/\bJava\b/i] },
  { name: 'Spring Boot', patterns: [/\bSpring Boot\b/i] },
  { name: 'NestJS', patterns: [/\bNestJS\b/i, /\bNest\.js\b/i] },
  { name: 'Azure', patterns: [/\bAzure\b/i] },
  { name: 'GCP', patterns: [/\bGCP\b/i, /\bGoogle Cloud\b/i] },
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
];

const domainSignals: Record<ResumeDomain, string[]> = {
  Frontend: ['React', 'TypeScript'],
  Backend: ['Node', 'MongoDB', 'PostgreSQL', 'Redis', 'Socket.IO', 'Firebase'],
  'Full Stack': ['React', 'Node', 'TypeScript', 'MongoDB', 'PostgreSQL'],
  'AI Engineer': ['LangChain', 'LangGraph', 'RAG', 'OpenAI'],
  'ML Engineer': ['Python'],
  DevOps: ['AWS', 'Docker', 'Kubernetes'],
  'Data Engineer': ['Python', 'PostgreSQL', 'MongoDB', 'Redis', 'AWS'],
};

const degreePattern =
  /\b(?:B\.?\s?Tech|M\.?\s?Tech|B\.?\s?E\.?|M\.?\s?E\.?|B\.?\s?Sc|M\.?\s?Sc|BCA|MCA|MBA|Ph\.?\s?D|Bachelor(?:'s)?(?:\s+of\s+[A-Za-z\s]+)?|Master(?:'s)?(?:\s+of\s+[A-Za-z\s]+)?|Doctorate|Diploma)\b/i;

const educationHeaderPattern = /\b(education|academic|qualification|university|college)\b/i;

const certificationPattern =
  /\b(Certified|Certification|Certificate|AWS Certified|Azure Certified|Google Cloud Certified|PMP|CSM|CKA|CKAD|CISSP|CompTIA|Oracle Certified)\b/i;

export function cleanResumeText(text: string) {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractPdfText(buffer: Buffer) {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractTextFromResumeFile(file: ResumeFileInput) {
  try {
    if (file.mimetype === 'application/pdf') {
      return cleanResumeText(await extractPdfText(file.buffer));
    }

    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return cleanResumeText(await extractDocxText(file.buffer));
    }
  } catch {
    throw new HttpError(400, 'Unable to extract text from resume file');
  }

  throw new HttpError(400, 'Only PDF and DOCX resume uploads are supported');
}

export function parseResumeText(rawText: string): ParsedResumeData {
  const skills = extractSkills(rawText);
  const experienceYears = extractExperienceYears(rawText);
  const education = extractEducation(rawText);
  const certifications = extractCertifications(rawText);
  const domain = inferDomain(skills);

  return {
    skills,
    experienceYears,
    education,
    certifications,
    domain,
  };
}

function extractSkills(text: string) {
  return skillDefinitions
    .filter((skill) => skill.patterns.some((pattern) => pattern.test(text)))
    .map((skill) => skill.name);
}

function extractExperienceYears(text: string) {
  const experiencePattern =
    /\b(\d{1,2}(?:\.\d)?)\s*\+?\s*(?:years?|yrs?)\b(?:\s+(?:of\s+)?experience)?/gi;
  const matches = Array.from(text.matchAll(experiencePattern))
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value) && value >= 0 && value <= 50);

  if (matches.length === 0) {
    return null;
  }

  return Math.max(...matches);
}

function extractEducation(text: string) {
  const lines = text
    .split('\n')
    .map((line) => line.trim().replace(/\s+/g, ' '))
    .filter(Boolean);

  const results: ParsedEducation[] = [];
  const seen = new Set<string>();

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const nearbyLines = [line, lines[index + 1], lines[index + 2]].filter(Boolean);
    const candidate = nearbyLines.join(' | ');

    if (!degreePattern.test(candidate) && !educationHeaderPattern.test(line)) {
      continue;
    }

    const education = parseEducationCandidate(candidate);
    const hasEducationSignal = education.degree || education.college || education.year;

    if (!hasEducationSignal) {
      continue;
    }

    const key = [education.degree, education.college, education.year].join(':').toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    results.push(education);

    if (results.length >= 5) {
      break;
    }
  }

  return results;
}

function extractCertifications(text: string) {
  return uniqueLinesMatching(text, certificationPattern, 12);
}

function uniqueLinesMatching(text: string, pattern: RegExp, limit: number) {
  const seen = new Set<string>();
  const results: string[] = [];

  for (const line of text.split('\n')) {
    const normalizedLine = line.trim().replace(/\s+/g, ' ');

    if (!normalizedLine || normalizedLine.length > 220 || !pattern.test(normalizedLine)) {
      continue;
    }

    const key = normalizedLine.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    results.push(normalizedLine);

    if (results.length >= limit) {
      break;
    }
  }

  return results;
}

function parseEducationCandidate(candidate: string): ParsedEducation {
  const degree = candidate.match(degreePattern)?.[0] ?? null;
  const year = extractEducationYear(candidate);
  const college = extractCollege(candidate, degree);

  return {
    degree: degree ? normalizeDegree(degree) : null,
    college,
    year,
  };
}

function extractEducationYear(candidate: string) {
  const yearMatches = Array.from(candidate.matchAll(/\b(19[5-9]\d|20[0-4]\d)\b/g))
    .map((match) => Number(match[1]))
    .filter((year) => year >= 1950 && year <= 2049);

  if (yearMatches.length === 0) {
    return null;
  }

  return Math.max(...yearMatches);
}

function extractCollege(candidate: string, degree: string | null) {
  const segments = candidate
    .split('|')
    .map((segment) => segment.trim())
    .filter(Boolean);

  const collegeSegment =
    segments.find((segment) => /\b(university|college|institute|school)\b/i.test(segment)) ??
    segments.find((segment) => degree && !segment.toLowerCase().includes(degree.toLowerCase()));

  if (!collegeSegment) {
    return null;
  }

  return (
    collegeSegment
      .replace(degreePattern, '')
      .replace(/\b(education|academic|qualification)s?\b/gi, '')
      .replace(/\b(19[5-9]\d|20[0-4]\d)\b/g, '')
      .replace(/[-,:|()[\]]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160) || null
  );
}

function normalizeDegree(degree: string) {
  return degree.replace(/\s+/g, ' ').replace(/\.+/g, '.').trim();
}

function inferDomain(skills: string[]): ResumeDomain | null {
  const skillSet = new Set(skills);

  if (skillSet.has('React') && skillSet.has('Node')) {
    return 'Full Stack';
  }

  if (
    skillSet.has('LangChain') ||
    skillSet.has('LangGraph') ||
    skillSet.has('RAG') ||
    skillSet.has('OpenAI')
  ) {
    return 'AI Engineer';
  }

  let bestDomain: ResumeDomain | null = null;
  let bestScore = 0;

  for (const [domain, signals] of Object.entries(domainSignals)) {
    const score = signals.filter((signal) => skillSet.has(signal)).length;

    if (score > bestScore) {
      bestDomain = domain as ResumeDomain;
      bestScore = score;
    }
  }

  return bestDomain;
}
