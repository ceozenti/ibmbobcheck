import { Box, Container, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TransactionForm from '../components/TransactionForm';
import { deposit } from '../api/transactions';

export default function DepositPage() {
  const location = useLocation();
  const initialAccountNumber = location.state?.accountNumber || '';

  async function handleDeposit(formData) {
    const { data } = await deposit(formData);
    return data;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h5" color="primary.main" gutterBottom>
          Cash Deposit
        </Typography>
        <TransactionForm
          title="Deposit Funds"
          submitLabel="Deposit"
          submitColor="success"
          onSubmit={handleDeposit}
          initialAccountNumber={initialAccountNumber}
        />
      </Container>
    </Box>
  );
}
