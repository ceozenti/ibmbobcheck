import axiosClient from './axiosClient';

export function login(username, password) {
  return axiosClient.post('/api/auth/login', { username, password });
}
