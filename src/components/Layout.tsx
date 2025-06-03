import { ReactNode } from 'react';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  AccessTime as OvertimeIcon,
  BeachAccess as LeaveIcon,
  School as TrainingIcon,
  Gavel as CourtIcon,
  People as AccountsIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Print as PrintIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

interface LayoutProps {
  children: ReactNode;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}

const Layout = ({ children, darkMode, setDarkMode }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Schedule', icon: <EventIcon />, path: '/schedule' },
    { text: 'Overtime', icon: <OvertimeIcon />, path: '/overtime' },
    { text: 'Leave', icon: <LeaveIcon />, path: '/leave' },
    { text: 'Training', icon: <TrainingIcon />, path: '/training' },
    { text: 'Court', icon: <CourtIcon />, path: '/court' },
    { text: 'Accounts', icon: <AccountsIcon />, path: '/accounts' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            CNUPD Scheduler
          </Typography>
          <IconButton color="inherit" onClick={() => window.print()}>
            <PrintIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigator.share({ title: 'CNUPD Scheduler', url: window.location.href })}>
            <ShareIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
        {/* Notification Bar */}
        <Box sx={{ bgcolor: 'warning.main', p: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="warning.contrastText">
            You have 2 new notifications
          </Typography>
        </Box>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 