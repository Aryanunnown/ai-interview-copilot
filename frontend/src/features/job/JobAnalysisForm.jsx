import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

const maxJobDescriptionLength = 12000;

export function JobAnalysisForm({
  resumes,
  selectedResumeId,
  jobDescription,
  error,
  isLoading,
  isLoadingResumes,
  resumeError,
  onResumeChange,
  onJobDescriptionChange,
  onSubmit,
}) {
  const characterCount = jobDescription.length;
  const isOverLimit = characterCount > maxJobDescriptionLength;
  const hasResumes = resumes.length > 0;
  const isDisabled =
    isLoading ||
    isLoadingResumes ||
    isOverLimit ||
    !hasResumes ||
    !selectedResumeId ||
    !jobDescription.trim();

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 18px 48px rgba(15, 23, 42, 0.06)',
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack component="form" spacing={2.5} onSubmit={onSubmit}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {resumeError ? <Alert severity="error">{resumeError}</Alert> : null}
          {!isLoadingResumes && !resumeError && !hasResumes ? (
            <Alert severity="info">Upload a resume first</Alert>
          ) : null}

          <FormControl fullWidth required disabled={isLoading || isLoadingResumes || !hasResumes}>
            <InputLabel id="resume-selector-label">Resume</InputLabel>
            <Select
              labelId="resume-selector-label"
              label="Resume"
              value={selectedResumeId}
              onChange={(event) => onResumeChange(event.target.value)}
              renderValue={(value) => {
                const resume = resumes.find((item) => item.id === value);

                if (!resume) {
                  return 'Select resume';
                }

                return resume.title || resume.fileName || 'Untitled resume';
              }}
            >
              {resumes.map((resume) => (
                <MenuItem key={resume.id} value={resume.id}>
                  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} noWrap>
                      {resume.title || 'Untitled resume'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {resume.fileName || 'No file name'} - Uploaded{' '}
                      {formatUploadDate(resume.createdAt)}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack spacing={1}>
            <TextField
              label="Job Description"
              value={jobDescription}
              onChange={(event) => onJobDescriptionChange(event.target.value)}
              disabled={isLoading}
              required
              fullWidth
              multiline
              minRows={12}
              inputProps={{ maxLength: maxJobDescriptionLength + 1000 }}
              error={isOverLimit}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                color: isOverLimit ? 'error.main' : 'text.secondary',
              }}
            >
              <Typography variant="caption">
                {characterCount.toLocaleString()} / {maxJobDescriptionLength.toLocaleString()}
              </Typography>
            </Box>
          </Stack>

          <Button
            type="submit"
            variant="contained"
            startIcon={
              isLoading ? <CircularProgress size={18} color="inherit" /> : <AnalyticsOutlinedIcon />
            }
            disabled={isDisabled}
            sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, minWidth: 160 }}
          >
            {isLoading ? 'Analyzing' : 'Analyze'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function formatUploadDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
