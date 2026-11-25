import { Box, Container, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TransactionForm from '../components/TransactionForm';
import { withdrawal } from '../api/transactions';

export default function WithdrawalPage() {
  const location = useLocation();
  const initialAccountNumber = location.state?.accountNumber || '';

  async function handleWithdrawal(formData) {
    const { data } = await withdrawal(formData);
    return data;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h5" color="primary.main" gutterBottom>
          Cash Withdrawal
        </Typography>
        <TransactionForm
          title="Withdraw Funds"
          submitLabel="Withdraw"
          submitColor="error"
          onSubmit={handleWithdrawal}
          initialAccountNumber={initialAccountNumber}
        />
      </Container>
    </Box>
  );
}
