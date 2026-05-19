import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';

const placeholderCards = [
  {
    title: 'Workspace setup',
    description: 'Future controls and status summaries will live here.',
    icon: <TuneOutlinedIcon />,
  },
  {
    title: 'Copilot context',
    description: 'Prepared resume, job, and interview context surfaces.',
    icon: <AutoAwesomeOutlinedIcon />,
  },
  {
    title: 'Performance view',
    description: 'A focused operating area for this workflow.',
    icon: <InsightsOutlinedIcon />,
  },
];

export function PagePlaceholder({ title, description }) {
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
              AI SaaS workspace
            </Typography>
            <Typography variant="h4">{title}</Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.78)' }}>{description}</Typography>
          </Stack>
          <Button
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              bgcolor: '#ffffff',
              color: '#17315f',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
            }}
          >
            Placeholder action
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2.5}>
        {placeholderCards.map((card) => (
          <Grid item xs={12} md={4} key={card.title}>
            <Card
              sx={{
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 18px 48px rgba(15, 23, 42, 0.06)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      display: 'grid',
                      placeItems: 'center',
                      color: 'primary.main',
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(125, 211, 252, 0.12)'
                          : 'rgba(37, 99, 235, 0.08)',
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Stack spacing={0.75}>
                    <Typography variant="h6">{card.title}</Typography>
                    <Typography color="text.secondary">{card.description}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
