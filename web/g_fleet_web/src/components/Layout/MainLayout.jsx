import React from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';

export default function MainLayout({children}){
  return (
    <div>
      <Navbar />
      <div style={{display: 'flex'}}>
        <Sidebar />
        <main style={{padding: '20px', flex: 1}}>{children}</main>
      </div>
    </div>
  );
}
