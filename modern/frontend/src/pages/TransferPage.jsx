import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Navbar from '../components/Navbar';
import { transfer } from '../api/transactions';

function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

export default function TransferPage() {
  const [sourceAccount, setSourceAccount] = useState('');
  const [destinationAccount, setDestinationAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (sourceAccount === destinationAccount) {
      setError('Source and destination accounts must be different.');
      return;
    }

    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) { setError('Amount must be greater than 0.'); return; }
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) { setError('Amount must have at most 2 decimal places.'); return; }
    if (num > 10000000) { setError('Amount must not exceed 10,000,000.'); return; }

    setLoading(true);
    try {
      const { data } = await transfer({ sourceAccount, destinationAccount, amount: num, description });
      setResult(data);
      setAmount('');
      setDescription('');
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) setError('One or both accounts not found.');
      else if (status === 422) setError(err.response?.data?.error || 'Business rule violation.');
      else setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h5" color="primary.main" gutterBottom>
          Fund Transfer
        </Typography>

        {result && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Transfer Successful!</Typography>
            <Typography variant="body2">Reference: <strong>{result.reference}</strong></Typography>
            <Typography variant="body2">Source New Balance: <strong>{formatCurrency(result.sourceNewBalance)}</strong></Typography>
            <Typography variant="body2">Destination New Balance: <strong>{formatCurrency(result.destinationNewBalance)}</strong></Typography>
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField label="Source Account" fullWidth margin="normal" value={sourceAccount} onChange={(e) => setSourceAccount(e.target.value)} disabled={loading} required />
              <TextField label="Destination Account" fullWidth margin="normal" value={destinationAccount} onChange={(e) => setDestinationAccount(e.target.value)} disabled={loading} required />
              <TextField label="Amount" fullWidth margin="normal" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={loading} required inputProps={{ inputMode: 'decimal' }} />
              <TextField label="Description (optional)" fullWidth margin="normal" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                sx={{ mt: 2 }}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SwapHorizIcon />}
                disabled={loading || !sourceAccount || !destinationAccount || !amount}
              >
                Transfer
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
