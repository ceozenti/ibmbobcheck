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
import { useNavigate } from 'react-router-dom';
import { getCustomerById, getCustomerByAccountNumber } from '../api/customers';
import Navbar from '../components/Navbar';

const STATUS_COLOR = { ACTIVE: 'success', FROZEN: 'warning', CLOSED: 'error' };

export default function CustomerSearchPage() {
  const [searchType, setSearchType] = useState('customerId');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState(null);
  const navigate = useNavigate();

  async function handleSearch(e) {
    e.preventDefault();
    setError('');
    setCustomer(null);
    setLoading(true);
    try {
      let res;
      if (searchType === 'customerId') {
        res = await getCustomerById(query);
      } else {
        res = await getCustomerByAccountNumber(query);
      }
      setCustomer(res.data);
    } catch (err) {
      const status = err.response?.status;
      setError(status === 404 ? 'No results found.' : (err.response?.data?.error || 'Search failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" color="primary.main" gutterBottom>
          Customer Search
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Search By</InputLabel>
                <Select
                  value={searchType}
                  label="Search By"
                  onChange={(e) => { setSearchType(e.target.value); setQuery(''); setCustomer(null); setError(''); }}
                >
                  <MenuItem value="customerId">Customer ID</MenuItem>
                  <MenuItem value="accountNumber">Account Number</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={searchType === 'customerId' ? 'Customer ID' : 'Account Number'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ flex: 1, minWidth: 200 }}
                disabled={loading}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
                disabled={loading || !query}
                sx={{ px: 3 }}
              >
                Search
              </Button>
            </Box>
          </CardContent>
        </Card>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {customer && (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Customer Details</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <Box><Typography variant="caption" color="text.secondary">Customer ID</Typography><Typography>{customer.customerId}</Typography></Box>
                  <Box><Typography variant="caption" color="text.secondary">Name</Typography><Typography>{customer.customerName}</Typography></Box>
                  <Box><Typography variant="caption" color="text.secondary">Email</Typography><Typography>{customer.email || '—'}</Typography></Box>
                  <Box><Typography variant="caption" color="text.secondary">Phone</Typography><Typography>{customer.phone || '—'}</Typography></Box>
                  <Box sx={{ gridColumn: '1 / -1' }}><Typography variant="caption" color="text.secondary">Address</Typography><Typography>{customer.address || '—'}</Typography></Box>
                </Box>
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom>Accounts</Typography>
            {customer.accounts?.length === 0 ? (
              <Alert severity="info">No accounts found.</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Account Number</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customer.accounts.map((acct) => (
                      <TableRow
                        key={acct.accountNumber}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/accounts/${acct.accountNumber}`)}
                      >
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{acct.accountNumber}</TableCell>
                        <TableCell>{acct.accountType}</TableCell>
                        <TableCell><Chip label={acct.status} color={STATUS_COLOR[acct.status] || 'default'} size="small" /></TableCell>
                        <TableCell align="right">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(acct.balance)}</TableCell>
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
