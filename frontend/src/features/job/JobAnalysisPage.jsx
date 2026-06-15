import { Alert, Box, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JobAnalysisForm } from './JobAnalysisForm.jsx';
import { JobAnalysisResults } from './JobAnalysisResults.jsx';
import { analyzeJobDescription, fetchUserResumes } from './job.api';

function getErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Job description analysis failed.';
}

export function JobAnalysisPage() {
  const [searchParams] = useSearchParams();
  const initialResumeId = useMemo(() => searchParams.get('resumeId') || '', [searchParams]);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(initialResumeId);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [resumeError, setResumeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadResumes() {
      setResumeError('');
      setIsLoadingResumes(true);

      try {
        const loadedResumes = await fetchUserResumes();

        if (!isMounted) {
          return;
        }

        setResumes(loadedResumes);
        setSelectedResumeId((currentResumeId) => {
          if (loadedResumes.some((resume) => resume.id === currentResumeId)) {
            return currentResumeId;
          }

          if (initialResumeId && loadedResumes.some((resume) => resume.id === initialResumeId)) {
            return initialResumeId;
          }

          return loadedResumes[0]?.id || '';
        });
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setResumeError(getErrorMessage(loadError));
        setResumes([]);
        setSelectedResumeId('');
      } finally {
        if (isMounted) {
          setIsLoadingResumes(false);
        }
      }
    }

    loadResumes();

    return () => {
      isMounted = false;
    };
  }, [initialResumeId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);
    setHasAnalyzed(false);
    setIsLoading(true);

    try {
      const analysis = await analyzeJobDescription({
        resumeId: selectedResumeId,
        jobDescription: jobDescription.trim(),
      });
      setResult(analysis);
      setHasAnalyzed(true);
    } catch (analysisError) {
      setError(getErrorMessage(analysisError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          color: '#ffffff',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(15, 118, 110, 0.92))',
          boxShadow: '0 24px 60px rgba(37, 99, 235, 0.22)',
        }}
      >
        <Stack spacing={1} sx={{ maxWidth: 760 }}>
          <Typography variant="overline" sx={{ opacity: 0.78 }}>
            JD analysis
          </Typography>
          <Typography variant="h4">JD Upload</Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.78)' }}>
            Compare a job description against an uploaded resume profile.
          </Typography>
        </Stack>
      </Box>

      <JobAnalysisForm
        resumes={resumes}
        selectedResumeId={selectedResumeId}
        jobDescription={jobDescription}
        error={error}
        isLoading={isLoading}
        isLoadingResumes={isLoadingResumes}
        resumeError={resumeError}
        onResumeChange={setSelectedResumeId}
        onJobDescriptionChange={setJobDescription}
        onSubmit={handleSubmit}
      />

      {hasAnalyzed && result ? <Alert severity="success">Job description analyzed.</Alert> : null}

      <JobAnalysisResults result={result} />
    </Stack>
  );
}
