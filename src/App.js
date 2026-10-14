import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import ActivityLogs from './pages/ActivityLogs';
import Alerts from './pages/Alerts';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import Login from './pages/Login';
import ManageFleets from './pages/ManageFleets';
import Staff from './pages/Staff';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Login />;

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="vehicles" element={<ManageFleets />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="staff" element={<Staff />} />
        <Route path="notifications" element={<Alerts />} />
        <Route path="logs" element={<ActivityLogs />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
