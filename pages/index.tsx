import React from 'react';

export default function HomePage() {
  return (
    <div className="page home-page">
      <div className="hero">
        <h1>Self-Directed IRA Management</h1>
        <p>Take control of your retirement with flexible investment options.</p>

        <div className="cta-buttons">
          <a href="/registration" className="btn btn-primary btn-lg">
            Start Registration
          </a>
          <a href="/login" className="btn btn-secondary btn-lg">
            Already have an account? Log In
          </a>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>Multiple IRA Types</h3>
          <p>Traditional, Roth, SEP, SIMPLE, and Inherited IRAs all in one place.</p>
        </div>
        <div className="feature-card">
          <h3>Alternative Assets</h3>
          <p>Invest in real estate, precious metals, crypto, and more.</p>
        </div>
        <div className="feature-card">
          <h3>Full Compliance</h3>
          <p>IRS and KYC/AML compliant. Your data is secured and encrypted.</p>
        </div>
      </div>
    </div>
  );
}
