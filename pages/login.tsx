import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      console.log('Logging in to:', apiUrl);
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const serverMessage = typeof data?.message === 'string' ? data.message : '';
        if (response.status === 401 || response.status === 403) {
          setError('Incorrect user ID or password. Please enter the correct user ID and password.');
        } else {
          setError(serverMessage || `Login failed: ${response.status} ${response.statusText}`);
        }
        return;
      }

      const data = await response.json();
      console.log('Login response:', data);
      
      // Store session (sessionId is required, token is optional)
      if (data.sessionId) {
        localStorage.setItem('session_id', data.sessionId);
      }
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      localStorage.setItem('last_login_email', email);
      
      // If application already completed, go to dashboard; otherwise registration
      if (data.isRegistrationComplete) {
        router.push('/dashboard');
      } else {
        router.push('/registration');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Unable to log in right now. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <div className="login-container">
        <h1>Log In</h1>
        <p className="subtitle">Welcome back! Continue your registration or manage your account.</p>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <a href="/registration" className="link">
              Start Registration
            </a>
          </p>
          <p>
            <a href="/forgot-password" className="link">
              Forgot Password?
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .login-container {
          background: white;
          padding: 3rem;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          max-width: 450px;
          width: 100%;
        }

        h1 {
          margin: 0 0 0.5rem;
          font-size: 2rem;
          color: #1a202c;
        }

        .subtitle {
          margin: 0 0 2rem;
          color: #718096;
          font-size: 0.95rem;
        }

        .login-form {
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #2d3748;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 1rem;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn-block {
          width: 100%;
          padding: 0.875rem;
          font-size: 1rem;
          font-weight: 600;
        }

        .login-footer {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .login-footer p {
          margin: 0.5rem 0;
          color: #718096;
        }

        .link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .link:hover {
          text-decoration: underline;
        }

        .alert {
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
        }

        .alert-error {
          background: #fed7d7;
          color: #c53030;
          border: 1px solid #fc8181;
        }
      `}</style>
    </div>
  );
}
