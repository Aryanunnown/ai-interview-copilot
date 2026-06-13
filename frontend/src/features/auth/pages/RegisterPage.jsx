import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import { Alert, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../app/store/useAuthStore.js';

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

async function submitRegister(account) {
  const response = await window.fetch(`${apiBaseUrl}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(account),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Registration failed.');
  }

  return payload?.data;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await submitRegister({
        name: form.name.trim() || undefined,
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      login({ token: result.token, user: result.user });
      navigate('/dashboard', { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
      <Stack spacing={0.5}>
        <Typography variant="h5">Register</Typography>
        <Typography variant="body2" color="text.secondary">
          Create an account to upload resumes and prep interviews.
        </Typography>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <TextField
        label="Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        autoComplete="name"
        fullWidth
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        autoComplete="email"
        required
        fullWidth
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        autoComplete="new-password"
        required
        inputProps={{ minLength: 8, maxLength: 128 }}
        helperText="Use at least 8 characters."
        fullWidth
      />
      <Button
        type="submit"
        variant="contained"
        startIcon={
          isSubmitting ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <PersonAddAltOutlinedIcon />
          )
        }
        disabled={isSubmitting}
        fullWidth
      >
        {isSubmitting ? 'Creating account' : 'Create account'}
      </Button>
      <Button component={RouterLink} to="/login" disabled={isSubmitting} fullWidth>
        Back to login
      </Button>
    </Stack>
  );
}
