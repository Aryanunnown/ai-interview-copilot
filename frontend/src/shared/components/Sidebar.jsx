import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon /> },
  { label: 'Resume Upload', path: '/resume-upload', icon: <UploadFileOutlinedIcon /> },
  { label: 'JD Upload', path: '/jd-upload', icon: <ArticleOutlinedIcon /> },
  { label: 'Interview Room', path: '/interview-room', icon: <MeetingRoomOutlinedIcon /> },
  { label: 'Analytics', path: '/analytics', icon: <AnalyticsOutlinedIcon /> },
  { label: 'History', path: '/history', icon: <HistoryOutlinedIcon /> },
];

const readinessItems = ['Resume loaded', 'JD uploaded', 'Interview mode', 'AI readiness'];

function SidebarContent({ isCollapsed, onToggleCollapse, onNavigate }) {
  return (
    <>
      <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, px: isCollapsed ? 1.5 : 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ width: '100%' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #2563eb, #0f766e)',
              boxShadow: '0 12px 28px rgba(37, 99, 235, 0.3)',
            }}
          >
            <DescriptionOutlinedIcon />
          </Box>
          {!isCollapsed && (
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="h6" noWrap>
                Copilot
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Interview command center
              </Typography>
            </Box>
          )}
          <Tooltip title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <IconButton
              onClick={onToggleCollapse}
              size="small"
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                transition: 'transform 180ms ease, background-color 180ms ease, color 180ms ease',
                '&:hover': {
                  transform: isCollapsed ? 'translateX(2px) rotate(180deg)' : 'translateX(-2px)',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                },
                '& svg': {
                  transition: 'transform 180ms ease',
                },
                '&:active svg': {
                  transform: 'scale(0.86)',
                },
              }}
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.25, py: 2 }}>
        {navItems.map((item) => (
          <Tooltip key={item.path} title={isCollapsed ? item.label : ''} placement="right">
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={onNavigate}
              sx={{
                position: 'relative',
                minHeight: 48,
                borderRadius: 2,
                mb: 0.75,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                color: 'text.secondary',
                overflow: 'hidden',
                transition: 'background-color 160ms ease, color 160ms ease, transform 160ms ease',
                '&:hover': {
                  transform: 'translateX(3px)',
                  bgcolor: 'action.hover',
                },
                '&.active': {
                  color: 'primary.main',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(125, 211, 252, 0.12)'
                      : 'rgba(37, 99, 235, 0.1)',
                  '&::before': {
                    transform: 'scaleY(1)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 10,
                  bottom: 10,
                  width: 3,
                  borderRadius: 4,
                  bgcolor: 'primary.main',
                  transform: 'scaleY(0)',
                  transformOrigin: 'center',
                  transition: 'transform 160ms ease',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: isCollapsed ? 0 : 40,
                  color: 'inherit',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary={item.label} />}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
      {!isCollapsed && (
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.default',
            }}
          >
            <Stack spacing={1.25}>
              {readinessItems.map((item) => (
                <Stack key={item} direction="row" spacing={1} alignItems="center">
                  <CheckCircleRoundedIcon color="primary" sx={{ fontSize: 18 }} />
                  <Typography variant="body2" fontWeight={700}>
                    {item}
                  </Typography>
                </Stack>
              ))}
              <Chip
                label="Workspace ready"
                color="primary"
                size="small"
                sx={{ alignSelf: 'flex-start', mt: 0.5 }}
              />
              <Typography variant="body2" color="text.secondary">
                Configure resume and job context before entering the interview room.
              </Typography>
            </Stack>
          </Box>
        </Box>
      )}
    </>
  );
}

export function Sidebar({
  drawerWidth,
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
  onToggleCollapse,
}) {
  const paperSx = {
    boxSizing: 'border-box',
    borderRight: '1px solid',
    borderColor: 'divider',
    bgcolor: (theme) =>
      theme.palette.mode === 'dark' ? 'rgba(12, 23, 38, 0.96)' : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(18px)',
    transition: 'width 180ms ease',
  };

  return (
    <>
      <Drawer
        variant="temporary"
        open={isMobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            ...paperSx,
            width: 292,
          },
        }}
      >
        <SidebarContent
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
          onNavigate={onCloseMobile}
        />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          transition: 'width 180ms ease',
          '& .MuiDrawer-paper': {
            ...paperSx,
            width: drawerWidth,
            display: 'flex',
          },
        }}
      >
        <SidebarContent isCollapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />
      </Drawer>
    </>
  );
}
