import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../app/store/useAuthStore.js';

export function Topbar({ drawerWidth }) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

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
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6" noWrap>
            AI Interview Copilot
          </Typography>
        </Box>
        <Button startIcon={<LogoutOutlinedIcon />} onClick={handleLogout} variant="outlined">
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
