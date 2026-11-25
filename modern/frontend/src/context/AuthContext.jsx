import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [employee, setEmployee] = useState(() => {
    const stored = localStorage.getItem('employee');
    return stored ? JSON.parse(stored) : null;
  });

  function login(tokenValue, employeeData) {
    setToken(tokenValue);
    setEmployee(employeeData);
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('employee', JSON.stringify(employeeData));
  }

  function logout() {
    setToken(null);
    setEmployee(null);
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
  }

  return (
    <AuthContext.Provider value={{ token, employee, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
