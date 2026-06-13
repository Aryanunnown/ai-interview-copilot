import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const resumeUploadPath = '/resume/upload';
const acceptedResumeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function getAuthToken() {
  const token =
    window.localStorage.getItem('token') ||
    window.localStorage.getItem('authToken') ||
    window.localStorage.getItem('accessToken');

  return token?.replace(/^Bearer\s+/i, '').trim() || null;
}

function getErrorMessage(error, fallback) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function ResumeUploadPage() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [toast, setToast] = useState(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const closeToast = () => {
    setToast(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!acceptedResumeTypes.includes(file.type)) {
      setSelectedFile(null);
      setParsedResult(null);
      setToast({ severity: 'error', message: 'Select a PDF or DOCX resume.' });
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
    setParsedResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      openFilePicker();
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setToast({
        severity: 'error',
        message: 'Please log in again before uploading a resume.',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new window.FormData();
      formData.append('file', selectedFile);

      const response = await window.fetch(`${apiBaseUrl}${resumeUploadPath}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Resume upload failed.');
      }

      const result = payload?.data ?? payload;
      setParsedResult(result);
      setToast({ severity: 'success', message: 'Resume uploaded successfully.' });
    } catch (error) {
      setToast({ severity: 'error', message: getErrorMessage(error, 'Resume upload failed.') });
    } finally {
      setIsUploading(false);
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
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >
          <Stack spacing={1} sx={{ maxWidth: 720 }}>
            <Typography variant="overline" sx={{ opacity: 0.78 }}>
              Resume ingestion
            </Typography>
            <Typography variant="h4">Upload Resume</Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.78)' }}>
              Parse resume skills, experience, and domain from a source file.
            </Typography>
          </Stack>
          <Button
            variant="contained"
            startIcon={
              isUploading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <CloudUploadOutlinedIcon />
              )
            }
            onClick={handleUpload}
            disabled={isUploading}
            sx={{
              minWidth: 170,
              bgcolor: '#ffffff',
              color: '#17315f',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
            }}
          >
            {selectedFile ? 'Upload Resume' : 'Select Resume'}
          </Button>
        </Stack>
      </Box>

      <Card
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 18px 48px rgba(15, 23, 42, 0.06)',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2.5}>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
            />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'primary.main',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(125, 211, 252, 0.12)'
                        : 'rgba(37, 99, 235, 0.08)',
                    flexShrink: 0,
                  }}
                >
                  <InsertDriveFileOutlinedIcon />
                </Box>
                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                  <Typography variant="h6" noWrap>
                    {selectedFile?.name || 'No file selected'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PDF or DOCX
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<DescriptionOutlinedIcon />}
                  onClick={openFilePicker}
                  disabled={isUploading}
                >
                  Choose File
                </Button>
                <Button
                  variant="contained"
                  startIcon={
                    isUploading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <CloudUploadOutlinedIcon />
                    )
                  }
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile}
                >
                  Upload Resume
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {parsedResult ? (
        <Card
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 18px 48px rgba(15, 23, 42, 0.06)',
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="h6">Parsed Result</Typography>
                <Typography variant="body2" color="text.secondary">
                  Resume ID: {parsedResult.resumeId}
                </Typography>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Chip label={`Domain: ${parsedResult.domain || 'Unknown'}`} color="primary" />
                <Chip
                  label={`Experience: ${parsedResult.experienceYears ?? 'Unknown'} years`}
                  color="secondary"
                  variant="outlined"
                />
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {(parsedResult.skills || []).map((skill) => (
                  <Chip key={skill} label={skill} variant="outlined" />
                ))}
                {(parsedResult.skills || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No skills detected.
                  </Typography>
                ) : null}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={closeToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? (
          <Alert onClose={closeToast} severity={toast.severity} variant="filled">
            {toast.message}
          </Alert>
        ) : null}
      </Snackbar>
    </Stack>
  );
}
