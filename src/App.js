import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ManageFleets from './pages/ManageFleets';
import Staff from './pages/Staff';
import Alerts from './pages/Alerts';
import ActivityLogs from './pages/ActivityLogs';
import Bookings from './pages/Bookings';
import RouteHistory from './pages/RouteHistory';
import Geofences from './pages/Geofences';
import Reports from './pages/Reports';
import DevTools from './pages/DevTools';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/fleets" element={<ManageFleets />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/notifications" element={<Alerts />} />
              <Route path="/activity-logs" element={<ActivityLogs />} />

              {/* Not yet in the sidebar (no matching screen in the Figma prototype yet) */}
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/routes" element={<RouteHistory />} />
              <Route path="/geofences" element={<Geofences />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/dev-tools" element={<DevTools />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
