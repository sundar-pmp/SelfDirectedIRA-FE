import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { RegistrationClient } from '@/lib/api/registrationClient';
import { DASHBOARD_NAV } from '@/lib/dashboardNav';

export default function DashboardPage() {
  const [progress, setProgress] = useState<{ isComplete?: boolean; applicationId?: string; savedData?: Record<string, unknown> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = typeof window !== 'undefined' ? localStorage.getItem('session_id') : null;
    if (!sessionId) return;
    RegistrationClient.fetchProgress(sessionId)
      .then((data) => {
        setProgress({
          isComplete: data.isComplete ?? data.IsComplete,
          applicationId: (data.savedData?.applicationId ?? data.registrationData?.applicationId) as string | undefined,
          savedData: data.savedData ?? data.registrationData ?? {},
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="dashboard-overview">
          <p>Loading your application...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="dashboard-overview">
          <div className="alert alert-error">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  const isComplete = progress?.isComplete === true;
  const applicationId = progress?.applicationId;
  const editLinks = DASHBOARD_NAV.filter((item) => item.href !== '/dashboard');

  return (
    <DashboardLayout>
      <div className="dashboard-overview">
        <section className="dashboard-card dashboard-status">
          <h2>Application Status</h2>
          {isComplete ? (
            <>
              <p className="status-badge status-complete">Application submitted</p>
              {applicationId && (
                <p className="application-id">
                  <strong>Application ID:</strong> {applicationId}
                </p>
              )}
              <p>You can update your information below. Changes are saved to your application.</p>
            </>
          ) : (
            <p className="status-badge status-draft">Registration in progress</p>
          )}
        </section>

        <section className="dashboard-card">
          <h2>Edit your information</h2>
          <p className="dashboard-card-desc">Choose a section to view or update.</p>
          <ul className="dashboard-edit-links">
            {editLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="dashboard-edit-link">
                  <span className="edit-link-label">{item.label}</span>
                  {item.description && <span className="edit-link-desc">{item.description}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardLayout>
  );
}
