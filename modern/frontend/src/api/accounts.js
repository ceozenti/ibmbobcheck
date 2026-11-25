import axiosClient from './axiosClient';

export function getAccount(accountNumber) {
  return axiosClient.get(`/api/accounts/${accountNumber}`);
}
