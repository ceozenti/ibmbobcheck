import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAccount } from '../api/accounts';
import Navbar from '../components/Navbar';

const STATUS_COLORS = { ACTIVE: 'success', FROZEN: 'warning', CLOSED: 'error' };

export default function AccountDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [accountNumber, setAccountNumber] = useState(location.state?.accountNumber || '');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLookup(e) {
    e.preventDefault();
    setError('');
    setAccount(null);
    setLoading(true);
    try {
      const { data } = await getAccount(accountNumber);
      setAccount(data);
    } catch (err) {
      setError(err.response?.status === 404 ? 'Account not found.' : (err.response?.data?.error || 'Lookup failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h5" color="primary.main" gutterBottom>
          Account Details
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box component="form" onSubmit={handleLookup} sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                sx={{ flex: 1 }}
                disabled={loading}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
                disabled={loading || !accountNumber}
              >
                Lookup
              </Button>
            </Box>
          </CardContent>
        </Card>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {account && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Account Information</Typography>
                <Chip
                  label={account.status}
                  color={STATUS_COLORS[account.status] || 'default'}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                <Box><Typography variant="caption" color="text.secondary">Account Number</Typography><Typography sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{account.accountNumber}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Account Type</Typography><Typography>{account.accountType}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Balance</Typography><Typography variant="h6" color="primary.main">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(account.balance)}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Created Date</Typography><Typography>{account.createdDate}</Typography></Box>
              </Box>

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>Customer</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Box><Typography variant="caption" color="text.secondary">ID</Typography><Typography>{account.customer?.customerId}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Name</Typography><Typography>{account.customer?.customerName}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Email</Typography><Typography>{account.customer?.email || '—'}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Phone</Typography><Typography>{account.customer?.phone || '—'}</Typography></Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => navigate('/deposit', { state: { accountNumber: account.accountNumber } })}
                  disabled={account.status !== 'ACTIVE'}
                >
                  Deposit
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<RemoveCircleOutlineIcon />}
                  onClick={() => navigate('/withdrawal', { state: { accountNumber: account.accountNumber } })}
                  disabled={account.status !== 'ACTIVE'}
                >
                  Withdraw
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ReceiptLongIcon />}
                  onClick={() => navigate('/history', { state: { accountNumber: account.accountNumber } })}
                >
                  View History
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}
