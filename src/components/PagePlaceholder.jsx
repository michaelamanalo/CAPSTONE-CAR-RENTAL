import React from 'react';
import './PagePlaceholder.css';

export default function PagePlaceholder({ eyebrow, title, description, children }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        {eyebrow && <p className="placeholder-eyebrow">{eyebrow}</p>}
        <h2 className="placeholder-title">{title}</h2>
        <p className="placeholder-description">{description}</p>
        {children}
      </div>
    </div>
  );
}
