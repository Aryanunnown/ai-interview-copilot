import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import PsychologyAltOutlinedIcon from '@mui/icons-material/PsychologyAltOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import ScoreboardOutlinedIcon from '@mui/icons-material/ScoreboardOutlined';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

const topStats = [
  { title: 'Technical Score', value: '84%', helper: 'Architecture and depth', color: '#2563eb' },
  { title: 'Communication', value: '91%', helper: 'Clear, structured answers', color: '#0f766e' },
  { title: 'Confidence', value: '78%', helper: 'Stable delivery trend', color: '#7c3aed' },
  { title: 'ATS Match', value: '88%', helper: 'Resume to JD alignment', color: '#d97706' },
];

const metrics = [
  {
    title: 'Resume Match',
    value: '82%',
    helper: '+12% from last role',
    icon: <AssignmentTurnedInOutlinedIcon />,
    color: '#2563eb',
  },
  {
    title: 'Interviews Taken',
    value: '14',
    helper: '3 this month',
    icon: <BarChartRoundedIcon />,
    color: '#0f766e',
  },
  {
    title: 'Average Score',
    value: '7.8',
    helper: 'Strong communication',
    icon: <ScoreboardOutlinedIcon />,
    color: '#7c3aed',
  },
  {
    title: 'Weak Skills',
    value: '4',
    helper: 'System design, metrics',
    icon: <PsychologyAltOutlinedIcon />,
    color: '#d97706',
  },
];

const quickActions = [
  { label: 'Upload Resume', icon: <UploadFileOutlinedIcon /> },
  { label: 'Upload JD', icon: <WorkOutlineOutlinedIcon /> },
  { label: 'Start Interview', icon: <RocketLaunchOutlinedIcon /> },
  { label: 'View Analytics', icon: <InsightsOutlinedIcon /> },
];

const recentInterviews = [
  { role: 'Frontend Engineer', company: 'Stripe', score: '8.4', status: 'Completed' },
  { role: 'Full Stack Developer', company: 'Atlassian', score: '7.6', status: 'Review' },
  { role: 'React Engineer', company: 'Canva', score: '8.1', status: 'Completed' },
];

const skills = [
  { label: 'React', value: 86 },
  { label: 'System Design', value: 62 },
  { label: 'Behavioral', value: 78 },
  { label: 'Algorithms', value: 70 },
  { label: 'Communication', value: 88 },
];

export function DashboardPage() {
  return (
    <Stack spacing={3}>
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          color: '#ffffff',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.98), rgba(15, 118, 110, 0.94))',
          boxShadow: '0 24px 64px rgba(37, 99, 235, 0.24)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={3}
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          justifyContent="space-between"
        >
          <Stack spacing={1.25} sx={{ maxWidth: 740, position: 'relative', zIndex: 1 }}>
            <Chip
              label="Production dashboard preview"
              sx={{
                alignSelf: 'flex-start',
                bgcolor: 'rgba(255, 255, 255, 0.16)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.24)',
              }}
            />
            <Typography variant="h3">Interview readiness command center</Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.78)', maxWidth: 640 }}>
              Track preparation quality, interview progress, and skill gaps from one polished
              workspace.
            </Typography>
          </Stack>
          <Box
            sx={{
              width: { xs: '100%', sm: 300 },
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(12px)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TrendingUpRoundedIcon />
                <Typography variant="h6">Readiness trend</Typography>
              </Stack>
              <Box sx={{ height: 92, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                {[34, 48, 42, 66, 58, 72, 86].map((height, index) => (
                  <Box
                    key={height + index}
                    sx={{
                      flex: 1,
                      height: `${height}%`,
                      borderRadius: 1,
                      bgcolor: 'rgba(255, 255, 255, 0.82)',
                    }}
                  />
                ))}
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={2.5}>
        {topStats.map((stat) => (
          <Grid item xs={12} sm={6} lg={3} key={stat.title}>
            <Card
              sx={{
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 18px 48px rgba(15, 23, 42, 0.06)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                      sx={{
                        width: 10,
                        height: 40,
                        borderRadius: 999,
                        bgcolor: stat.color,
                      }}
                    />
                    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                      <Typography color="text.secondary" noWrap>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4">{stat.value}</Typography>
                    </Stack>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {stat.helper}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 18px 48px rgba(15, 23, 42, 0.05)',
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack spacing={0.25}>
              <Typography variant="h6">Quick actions</Typography>
              <Typography variant="body2" color="text.secondary">
                Fast entry points for the main prep workflow.
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outlined"
                  startIcon={action.icon}
                  sx={{
                    justifyContent: 'flex-start',
                    minWidth: { xs: '100%', sm: 150 },
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} lg={3} key={metric.title}>
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
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        color: '#ffffff',
                        bgcolor: metric.color,
                      }}
                    >
                      {metric.icon}
                    </Box>
                    <Chip label={metric.helper} size="small" variant="outlined" />
                  </Stack>
                  <Stack spacing={0.25}>
                    <Typography color="text.secondary">{metric.title}</Typography>
                    <Typography variant="h4">{metric.value}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Stack spacing={0.5}>
                  <Typography variant="h6">Recent Interviews</Typography>
                  <Typography color="text.secondary">Placeholder activity summary</Typography>
                </Stack>
                {recentInterviews.map((interview) => (
                  <Stack
                    key={`${interview.company}-${interview.role}`}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                    }}
                  >
                    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap>
                        {interview.role}
                      </Typography>
                      <Typography color="text.secondary" variant="body2" noWrap>
                        {interview.company}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={interview.status} size="small" />
                      <Typography fontWeight={800}>{interview.score}</Typography>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Stack spacing={0.5}>
                  <Typography variant="h6">Skill Radar</Typography>
                  <Typography color="text.secondary">Placeholder competency map</Typography>
                </Stack>
                <Box
                  sx={{
                    aspectRatio: '1 / 1',
                    maxHeight: 260,
                    mx: 'auto',
                    width: '100%',
                    borderRadius: '50%',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'grid',
                    placeItems: 'center',
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'radial-gradient(circle, rgba(125, 211, 252, 0.2), rgba(12, 23, 38, 0.1) 58%)'
                        : 'radial-gradient(circle, rgba(37, 99, 235, 0.12), rgba(255, 255, 255, 0.4) 58%)',
                  }}
                >
                  <Box
                    sx={{
                      width: '56%',
                      height: '56%',
                      clipPath: 'polygon(50% 0%, 92% 34%, 76% 90%, 22% 86%, 8% 32%)',
                      bgcolor: 'primary.main',
                      opacity: 0.72,
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Stack spacing={0.5}>
                  <Typography variant="h6">Progress Chart</Typography>
                  <Typography color="text.secondary">Placeholder skill progression</Typography>
                </Stack>
                {skills.map((skill) => (
                  <Stack key={skill.label} spacing={0.75}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" fontWeight={700}>
                        {skill.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {skill.value}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={skill.value}
                      sx={{
                        height: 8,
                        borderRadius: 999,
                        bgcolor: 'background.default',
                      }}
                    />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
