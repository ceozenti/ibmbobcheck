import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';

function validateAmount(value) {
  const num = parseFloat(value);
  if (!value || isNaN(num) || num <= 0) return 'Amount must be greater than 0';
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return 'Amount must have at most 2 decimal places';
  if (num > 10000000) return 'Amount must not exceed 10,000,000';
  return '';
}

export default function TransactionForm({ title, submitLabel, submitColor = 'primary', onSubmit, initialAccountNumber = '' }) {
  const [accountNumber, setAccountNumber] = useState(initialAccountNumber);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const amtErr = validateAmount(amount);
    if (amtErr) { setAmountError(amtErr); return; }
    setAmountError('');
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await onSubmit({ accountNumber, amount: parseFloat(amount), description });
      setResult(data);
      setAmount('');
      setDescription('');
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) setError('Account not found.');
      else if (status === 422) setError(err.response?.data?.error || 'Business rule violation.');
      else if (status === 400) {
        const fe = err.response?.data?.fieldErrors;
        setError(fe ? Object.values(fe).join(', ') : (err.response?.data?.error || 'Validation error.'));
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>

        {result && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Transaction Successful!</Typography>
            <Typography variant="body2">Reference: <strong>{result.reference}</strong></Typography>
            <Typography variant="body2">New Balance: <strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(result.newBalance)}</strong></Typography>
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Account Number"
            fullWidth
            margin="normal"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            disabled={loading}
            required
          />
          <TextField
            label="Amount"
            fullWidth
            margin="normal"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setAmountError(''); }}
            disabled={loading}
            error={!!amountError}
            helperText={amountError}
            required
            inputProps={{ inputMode: 'decimal' }}
          />
          <TextField
            label="Description (optional)"
            fullWidth
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            color={submitColor}
            fullWidth
            size="large"
            sx={{ mt: 2 }}
            disabled={loading || !accountNumber || !amount}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : submitLabel}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
