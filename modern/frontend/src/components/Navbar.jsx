import {
  AppBar,
  Box,
  Button,
  Toolbar,
  Typography,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { employee, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar>
        <AccountBalanceIcon sx={{ mr: 1.5 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.5 }}>
          Legacy Bank — Modern
        </Typography>
        {employee && (
          <Typography variant="body2" sx={{ mr: 2, opacity: 0.9 }}>
            👤 {employee.employeeName}
          </Typography>
        )}
        <Button
          color="inherit"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          variant="outlined"
          size="small"
          sx={{ borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white' } }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
