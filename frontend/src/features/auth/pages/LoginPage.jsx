import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import { Alert, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../app/store/useAuthStore.js';

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

async function submitLogin(credentials) {
  const response = await window.fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Login failed.');
  }

  return payload?.data;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await submitLogin({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      login({ token: result.token, user: result.user });
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
      <Stack spacing={0.5}>
        <Typography variant="h5">Login</Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to continue your interview workspace.
        </Typography>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

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
        autoComplete="current-password"
        required
        fullWidth
      />
      <Button
        type="submit"
        variant="contained"
        startIcon={
          isSubmitting ? <CircularProgress size={18} color="inherit" /> : <LoginOutlinedIcon />
        }
        disabled={isSubmitting}
        fullWidth
      >
        {isSubmitting ? 'Signing in' : 'Continue'}
      </Button>
      <Button component={RouterLink} to="/register" disabled={isSubmitting} fullWidth>
        Create account
      </Button>
    </Stack>
  );
}
