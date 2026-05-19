import { Paper, Stack, Typography } from '@mui/material';

export function PagePlaceholder({ title, description }) {
  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h4">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>
      <Paper
        sx={{
          p: 4,
          minHeight: 280,
          border: '1px dashed',
          borderColor: 'divider',
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography color="text.secondary">Empty placeholder</Typography>
      </Paper>
    </Stack>
  );
}
