// client/src/components/AuthLayout.jsx
import React from "react";

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="page">
      <div className="auth-card">
        {eyebrow && <p className="auth-eyebrow">{eyebrow}</p>}
        {title && <h1 className="auth-title">{title}</h1>}
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
