import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import './MainLayout.css';

export default function MainLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className={'app-shell' + (sidebarExpanded ? ' app-shell--sidebar-expanded' : '')}>
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded((value) => !value)} />
      <div className="main-content">
        <Navbar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
