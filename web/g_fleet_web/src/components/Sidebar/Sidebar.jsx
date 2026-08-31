import React from 'react';

export default function Sidebar() {
  return (
    <aside style={{width: '200px', padding: '10px', background: '#f4f4f4'}}>
      <ul style={{listStyle: 'none', padding: 0}}>
        <li>Dashboard</li>
        <li>Vehicles</li>
        <li>Drivers</li>
      </ul>
    </aside>
  );
}
