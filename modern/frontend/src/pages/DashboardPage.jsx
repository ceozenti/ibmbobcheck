import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const ACTIONS = [
  {
    icon: <SearchIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
    title: 'Customer Search',
    description: 'Find a customer by ID or account number',
    path: '/customers',
  },
  {
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
    title: 'Account Details',
    description: 'Look up an account and view its status',
    path: '/accounts',
  },
  {
    icon: <AddCircleOutlineIcon sx={{ fontSize: 48, color: '#388e3c' }} />,
    title: 'Cash Deposit',
    description: 'Deposit cash into an account',
    path: '/deposit',
  },
  {
    icon: <RemoveCircleOutlineIcon sx={{ fontSize: 48, color: '#d32f2f' }} />,
    title: 'Cash Withdrawal',
    description: 'Withdraw cash from an account',
    path: '/withdrawal',
  },
  {
    icon: <SwapHorizIcon sx={{ fontSize: 48, color: '#7b1fa2' }} />,
    title: 'Fund Transfer',
    description: 'Transfer funds between two accounts',
    path: '/transfer',
  },
  {
    icon: <ReceiptLongIcon sx={{ fontSize: 48, color: '#f57c00' }} />,
    title: 'Transaction History',
    description: 'View transaction history for an account',
    path: '/history',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { employee } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" color="primary.main" gutterBottom>
            Welcome back, {employee?.employeeName?.split(' ')[0]}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            What would you like to do today?
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {ACTIONS.map((action) => (
            <Grid item xs={12} sm={6} md={4} key={action.title}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(action.path)}
                  sx={{ height: '100%', p: 1 }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    {action.icon}
                    <Typography variant="h6" sx={{ mt: 1.5, mb: 0.5 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
