import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import PsychologyAltOutlinedIcon from '@mui/icons-material/PsychologyAltOutlined';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

function StatCard({ label, value, helper }) {
  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 14px 36px rgba(15, 23, 42, 0.05)',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={0.75}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h4">{value}</Typography>
          {helper ? (
            <Typography variant="caption" color="text.secondary">
              {helper}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function SkillSection({ title, icon, skills, color }) {
  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 14px 36px rgba(15, 23, 42, 0.05)',
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            {icon}
            <Typography variant="h6">{title}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {skills.length > 0 ? (
              skills.map((skill) => (
                <Chip key={skill} label={skill} color={color} variant="filled" />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                None detected.
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ListSection({ title, icon, items }) {
  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 14px 36px rgba(15, 23, 42, 0.05)',
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            {icon}
            <Typography variant="h6">{title}</Typography>
          </Stack>
          {items.length > 0 ? (
            <Stack spacing={1}>
              {items.map((item) => (
                <Box
                  key={item}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                  }}
                >
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              None identified.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function JobAnalysisResults({ result }) {
  if (!result) {
    return null;
  }

  const totalRequired = (result.matchedSkills?.length ?? 0) + (result.missingSkills?.length ?? 0);

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Match Percentage" value={`${result.matchPercentage}%`} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="TF-IDF Similarity"
            value={`${result.tfidfScore ?? 0}%`}
            helper="Semantic text match"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Matched Skills" value={result.matchedSkills?.length ?? 0} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label="Missing Skills" value={result.missingSkills?.length ?? 0} />
        </Grid>
      </Grid>

      <Card
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 14px 36px rgba(15, 23, 42, 0.05)',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Typography variant="h6">Match Progress</Typography>
              <Typography variant="body2" color="text.secondary">
                {result.matchedSkills?.length ?? 0} of {totalRequired} skills
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(Math.max(result.matchPercentage, 0), 100)}
              color={result.matchPercentage >= 70 ? 'success' : 'warning'}
              sx={{ height: 10, borderRadius: 999 }}
            />
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SkillSection
            title="Matched Skills"
            icon={<CheckCircleOutlineOutlinedIcon color="success" />}
            skills={result.matchedSkills ?? []}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SkillSection
            title="Missing Skills"
            icon={<HighlightOffOutlinedIcon color="error" />}
            skills={result.missingSkills ?? []}
            color="error"
          />
        </Grid>
      </Grid>

      {result.strengths?.length > 0 ? (
        <ListSection
          title="Strengths"
          icon={<TrendingUpRoundedIcon color="success" />}
          items={result.strengths}
        />
      ) : null}

      {result.criticalGaps?.length > 0 ? (
        <ListSection
          title="Critical Gaps"
          icon={<WarningAmberOutlinedIcon color="error" />}
          items={result.criticalGaps}
        />
      ) : null}

      {result.interviewFocusAreas?.length > 0 ? (
        <Card
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 14px 36px rgba(15, 23, 42, 0.05)',
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PsychologyAltOutlinedIcon color="primary" />
                <Typography variant="h6">Interview Focus Areas</Typography>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {result.interviewFocusAreas.map((area) => (
                  <Chip key={area} label={area} color="primary" variant="outlined" />
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      <Card
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 14px 36px rgba(15, 23, 42, 0.05)',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <LightbulbOutlinedIcon color="primary" />
              <Typography variant="h6">Recommendations</Typography>
            </Stack>
            {result.recommendations?.length > 0 ? (
              <Stack spacing={1}>
                {result.recommendations.map((recommendation) => (
                  <Box
                    key={recommendation}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Typography variant="body2">{recommendation}</Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recommendations returned.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
