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
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useLocation } from 'react-router-dom';
import { getHistory } from '../api/transactions';
import Navbar from '../components/Navbar';

const TYPE_COLORS = {
  DEPOSIT: 'success',
  WITHDRAWAL: 'error',
  TRANSFER_DEBIT: 'warning',
  TRANSFER_CREDIT: 'info',
};

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'DEPOSIT', label: 'Deposit' },
  { value: 'WITHDRAWAL', label: 'Withdrawal' },
  { value: 'TRANSFER_DEBIT', label: 'Transfer Debit' },
  { value: 'TRANSFER_CREDIT', label: 'Transfer Credit' },
];

function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

export default function TransactionHistoryPage() {
  const location = useLocation();
  const [accountNumber, setAccountNumber] = useState(location.state?.accountNumber || '');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    setTransactions(null);
    setLoading(true);
    try {
      const { data } = await getHistory(accountNumber, type || null);
      setTransactions(data);
    } catch (err) {
      setError(err.response?.status === 404 ? 'Account not found.' : (err.response?.data?.error || 'Failed to load history.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" color="primary.main" gutterBottom>
          Transaction History
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                sx={{ flex: 1, minWidth: 200 }}
                disabled={loading}
                required
              />
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Transaction Type</InputLabel>
                <Select value={type} label="Transaction Type" onChange={(e) => setType(e.target.value)}>
                  {TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                </Select>
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
                disabled={loading || !accountNumber}
                sx={{ px: 3 }}
              >
                Search
              </Button>
            </Box>
          </CardContent>
        </Card>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {transactions !== null && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
            </Typography>
            {transactions.length === 0 ? (
              <Alert severity="info">No transactions found.</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Amount</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Reference</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.transactionId} hover>
                        <TableCell>{txn.transactionId}</TableCell>
                        <TableCell><Chip label={txn.transactionType.replace('_', ' ')} color={TYPE_COLORS[txn.transactionType] || 'default'} size="small" /></TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(txn.amount)}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{txn.transactionDate}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{txn.referenceNumber}</TableCell>
                        <TableCell>{txn.description || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
