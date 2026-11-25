import axiosClient from './axiosClient';

export function getCustomerById(customerId) {
  return axiosClient.get(`/api/customers/${customerId}`);
}

export function getCustomerByAccountNumber(accountNumber) {
  return axiosClient.get('/api/customers', { params: { accountNumber } });
}
