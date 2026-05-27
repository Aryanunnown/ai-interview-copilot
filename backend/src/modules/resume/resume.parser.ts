import type { Buffer } from 'node:buffer';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { HttpError } from '../../utils/httpError.js';
import type { ParsedResumeData, ResumeUploadedFile } from './resume.types.js';

type ResumeFileInput = Pick<ResumeUploadedFile, 'buffer' | 'mimetype'>;

const skillKeywords = [
  'JavaScript',
  'TypeScript',
  'Node.js',
  'Express',
  'React',
  'Next.js',
  'Vue',
  'Angular',
  'HTML',
  'CSS',
  'Tailwind CSS',
  'Python',
  'Django',
  'Flask',
  'FastAPI',
  'Java',
  'Spring Boot',
  'C#',
  '.NET',
  'Go',
  'Rust',
  'PHP',
  'Laravel',
  'Ruby',
  'Rails',
  'SQL',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Prisma',
  'GraphQL',
  'REST',
  'AWS',
  'Azure',
  'GCP',
  'Docker',
  'Kubernetes',
  'Terraform',
  'CI/CD',
  'Git',
  'Linux',
  'Machine Learning',
  'Data Science',
  'TensorFlow',
  'PyTorch',
  'Pandas',
  'NumPy',
  'Power BI',
  'Tableau',
  'Figma',
  'Product Management',
  'Agile',
  'Scrum',
];

const domainSignals: Record<string, string[]> = {
  'Frontend Engineering': ['React', 'Next.js', 'Vue', 'Angular', 'HTML', 'CSS', 'Tailwind CSS'],
  'Backend Engineering': [
    'Node.js',
    'Express',
    'Django',
    'Flask',
    'FastAPI',
    'Spring Boot',
    'Prisma',
    'REST',
  ],
  'Data Science': ['Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy'],
  DevOps: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
  'Product Design': ['Figma'],
  'Product Management': ['Product Management', 'Agile', 'Scrum'],
};

const degreePattern =
  /\b(Bachelor|Master|B\.?Tech|M\.?Tech|B\.?E\.?|M\.?E\.?|B\.?Sc|M\.?Sc|BCA|MCA|MBA|Ph\.?D|Doctorate|Diploma)\b/i;

const certificationPattern =
  /\b(Certified|Certification|Certificate|AWS Certified|Azure Certified|Google Cloud Certified|PMP|CSM|CKA|CKAD|CISSP|CompTIA|Oracle Certified)\b/i;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
  return skillKeywords.filter((skill) => {
    const normalizedSkill = escapeRegExp(skill).replace(/\\ /g, '\\s+');
    const pattern = new RegExp(`(^|[^a-z0-9+#.])${normalizedSkill}([^a-z0-9+#.]|$)`, 'i');
    return pattern.test(text);
  });
}

function extractExperienceYears(text: string) {
  const matches = Array.from(
    text.matchAll(/\b(\d{1,2}(?:\.\d)?)\+?\s*(?:years?|yrs?)\b(?:\s+of\s+experience)?/gi),
  )
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value) && value >= 0 && value <= 50);

  if (matches.length === 0) {
    return null;
  }

  return Math.max(...matches);
}

function extractEducation(text: string) {
  return uniqueLinesMatching(text, degreePattern, 12);
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

function inferDomain(skills: string[]) {
  let bestDomain: string | null = null;
  let bestScore = 0;

  for (const [domain, signals] of Object.entries(domainSignals)) {
    const score = signals.filter((signal) => skills.includes(signal)).length;

    if (score > bestScore) {
      bestDomain = domain;
      bestScore = score;
    }
  }

  return bestDomain;
}
