import { useState, useEffect } from 'react';
import { 
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar
} from '@mui/material';
import { LogOut } from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('inicio');

  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard') setActiveMenu('inicio');
    else if (path === '/perfil') setActiveMenu('perfil');
    else if (path === '/malla') setActiveMenu('malla');
    else if (path === '/proyecciones') setActiveMenu('proyecciones');
  }, [location]);

  const handleNavigation = (menu: string, route: string) => {
    setActiveMenu(menu);
    navigate(route);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        sx={{
          width: 224,
          backgroundColor: '#4A7BA7',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          zIndex: 1200
        }}
      >
        <Box sx={{ height: '100px' }} />

        <Box sx={{ px: 3, pt: 2 }}>
          <Box
            onClick={() => handleNavigation('inicio', '/dashboard')}
            sx={{
              py: 1.5,
              cursor: 'pointer',
              backgroundColor: activeMenu === 'inicio' ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: activeMenu === 'inicio' ? '4px solid #FF8A5B' : '4px solid transparent',
              ml: -3,
              pl: 3,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
              Inicio
            </Typography>
          </Box>

          <Box
            onClick={() => handleNavigation('perfil', '/perfil')}
            sx={{
              py: 1.5,
              cursor: 'pointer',
              backgroundColor: activeMenu === 'perfil' ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: activeMenu === 'perfil' ? '4px solid #FF8A5B' : '4px solid transparent',
              ml: -3,
              pl: 3,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
              Perfil
            </Typography>
          </Box>

          <Box
            onClick={() => handleNavigation('malla', '/malla')}
            sx={{
              py: 1.5,
              cursor: 'pointer',
              backgroundColor: activeMenu === 'malla' ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: activeMenu === 'malla' ? '4px solid #FF8A5B' : '4px solid transparent',
              ml: -3,
              pl: 3,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
              Mi malla
            </Typography>
          </Box>

          <Box
            onClick={() => handleNavigation('proyecciones', '/proyecciones')}
            sx={{
              py: 1.5,
              cursor: 'pointer',
              backgroundColor: activeMenu === 'proyecciones' ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: activeMenu === 'proyecciones' ? '4px solid #FF8A5B' : '4px solid transparent',
              ml: -3,
              pl: 3,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
              Mis proyecciones
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            startIcon={<LogOut size={18} />}
            onClick={() => navigate('/login')}
            sx={{
              backgroundColor: '#FF8A5B',
              color: 'white',
              textTransform: 'none',
              py: 1.2,
              borderRadius: 2,
              fontSize: '0.9rem',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#FF7043',
              },
            }}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          marginLeft: '224px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}
      >
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            background: 'linear-gradient(135deg, #5B99C2 0%, #7AB8E8 100%)',
            height: 100
          }}
        >
          <Toolbar sx={{ height: '100%' }}>
          </Toolbar>
        </AppBar>

        <Box 
          sx={{ 
            flexGrow: 1,
            backgroundColor: '#F5F5F5'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}