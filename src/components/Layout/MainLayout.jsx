import React from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import './MainLayout.css';

export default function MainLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
