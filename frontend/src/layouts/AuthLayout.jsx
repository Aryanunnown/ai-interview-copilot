import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 6,
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="xs">
        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography variant="h4">AI Interview Copilot</Typography>
            <Typography color="text.secondary">Frontend foundation</Typography>
          </Stack>
          <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Outlet />
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
