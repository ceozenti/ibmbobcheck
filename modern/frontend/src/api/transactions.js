import axiosClient from './axiosClient';

export function deposit(data) {
  return axiosClient.post('/api/transactions/deposit', data);
}

export function withdrawal(data) {
  return axiosClient.post('/api/transactions/withdrawal', data);
}

export function transfer(data) {
  return axiosClient.post('/api/transactions/transfer', data);
}

export function getHistory(accountNumber, type) {
  const params = type ? { type } : {};
  return axiosClient.get(`/api/transactions/history/${accountNumber}`, { params });
}
