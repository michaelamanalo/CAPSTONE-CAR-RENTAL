import React from 'react';
import sgtLogo from '../../assets/brand/sgt-logo-transparent-web.png';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-mark">
        <img className="navbar-mark-glyph" src={sgtLogo} alt="SGT Car Rentals logo" />
        <span className="navbar-brand-name">SGT Car Rentals</span>
      </div>
      <button type="button" className="navbar-logout" onClick={logout}>
        Log out
      </button>
    </header>
  );
}
