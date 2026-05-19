import { Box, Toolbar } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../shared/components/Sidebar.jsx';
import { Topbar } from '../shared/components/Topbar.jsx';

const expandedDrawerWidth = 276;
const collapsedDrawerWidth = 84;

export function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const drawerWidth = isSidebarCollapsed ? collapsedDrawerWidth : expandedDrawerWidth;

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        backgroundImage: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, rgba(37, 99, 235, 0.14), rgba(7, 17, 31, 0) 360px)'
            : 'linear-gradient(180deg, rgba(37, 99, 235, 0.08), rgba(244, 247, 251, 0) 340px)',
      }}
    >
      <Topbar
        drawerWidth={drawerWidth}
        onMobileMenuOpen={() => setIsMobileSidebarOpen(true)}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      <Sidebar
        drawerWidth={drawerWidth}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
