import React from 'react';
import './PageHeader.css';

export default function PageHeader({ eyebrow, title, description }) {
  return (
    <header className="page-header">
      {eyebrow && <p className="page-header-eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p className="page-header-description">{description}</p>}
    </header>
  );
}
