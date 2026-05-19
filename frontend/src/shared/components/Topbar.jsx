import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ModeNightOutlinedIcon from '@mui/icons-material/ModeNightOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../app/store/useAuthStore.js';
import { useThemeModeStore } from '../../app/store/useThemeModeStore.js';

export function Topbar({ drawerWidth, onMobileMenuOpen, isSidebarCollapsed }) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const mode = useThemeModeStore((state) => state.mode);
  const toggleMode = useThemeModeStore((state) => state.toggleMode);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(18px)',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(7, 17, 31, 0.78)' : 'rgba(255, 255, 255, 0.72)',
        transition: 'width 180ms ease, margin-left 180ms ease',
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: { xs: 64, md: 72 } }}>
        <IconButton
          color="inherit"
          onClick={onMobileMenuOpen}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          aria-label="Open navigation"
        >
          <MenuRoundedIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            {isSidebarCollapsed ? 'Compact workspace' : 'AI interview workspace'}
          </Typography>
          <Typography variant="h6" noWrap>
            AI Interview Copilot
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            <IconButton onClick={toggleMode} color="inherit" aria-label="Toggle theme mode">
              {mode === 'light' ? <ModeNightOutlinedIcon /> : <WbSunnyOutlinedIcon />}
            </IconButton>
          </Tooltip>
          <Button
            startIcon={<LogoutOutlinedIcon />}
            onClick={handleLogout}
            variant="outlined"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Logout
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
