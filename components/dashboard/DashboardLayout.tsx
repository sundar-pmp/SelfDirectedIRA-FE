'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DASHBOARD_NAV } from '@/lib/dashboardNav';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = router.pathname;
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const sid = typeof window !== 'undefined' ? localStorage.getItem('session_id') : null;
    setSessionId(sid);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!sessionId) {
      router.replace('/session-expired');
      return;
    }
  }, [mounted, sessionId, router]);

  const handleLogout = () => {
    localStorage.removeItem('session_id');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('registration_session');
    router.push('/login');
  };

  if (!mounted || !sessionId) {
    return (
      <div className="dashboard-loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <Link href="/dashboard" className="dashboard-logo">
            IRA Dashboard
          </Link>
        </div>
        <nav className="dashboard-nav">
          {DASHBOARD_NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`dashboard-nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="dashboard-nav-label">{item.label}</span>
                {item.description && (
                  <span className="dashboard-nav-desc">{item.description}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Account & Application</h1>
          <button type="button" onClick={handleLogout} className="btn btn-outline dashboard-logout">
            Log out
          </button>
        </header>
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}
