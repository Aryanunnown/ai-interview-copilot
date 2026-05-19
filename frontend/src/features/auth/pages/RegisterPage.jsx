import { Button, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../app/store/useAuthStore.js';

export function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = (event) => {
    event.preventDefault();
    login();
    navigate('/dashboard');
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit}>
      <Typography variant="h5">Register</Typography>
      <TextField label="Name" disabled fullWidth />
      <TextField label="Email" type="email" disabled fullWidth />
      <TextField label="Password" type="password" disabled fullWidth />
      <Button type="submit" variant="contained" fullWidth>
        Continue
      </Button>
      <Button component={RouterLink} to="/login" fullWidth>
        Back to login
      </Button>
    </Stack>
  );
}
