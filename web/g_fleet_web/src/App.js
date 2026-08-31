import React from 'react';
import './App.css';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';

function App(){
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
}

export default App;
