import type { JobAnalysisRequest, JobAnalysisResponse, ResumeListItem } from './job.types';

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const jobAnalyzePath = '/job/analyze';
const resumeListPath = '/resume/me';

function getAuthToken() {
  const token =
    window.localStorage.getItem('token') ||
    window.localStorage.getItem('authToken') ||
    window.localStorage.getItem('accessToken');

  return token?.replace(/^Bearer\s+/i, '').trim() || null;
}

export async function analyzeJobDescription(
  request: JobAnalysisRequest,
): Promise<JobAnalysisResponse> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Please log in again before analyzing a job description.');
  }

  const response = await window.fetch(`${apiBaseUrl}${jobAnalyzePath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Job description analysis failed.');
  }

  return payload?.data ?? payload;
}

export async function fetchUserResumes(): Promise<ResumeListItem[]> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Please log in again before loading resumes.');
  }

  const response = await window.fetch(`${apiBaseUrl}${resumeListPath}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Unable to load resumes.');
  }

  return payload?.data ?? payload ?? [];
}
