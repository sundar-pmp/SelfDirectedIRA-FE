import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Step10SecurityConfirm } from '@/components/registration/Step10SecurityConfirm';
import { RegistrationClient } from '@/lib/api/registrationClient';
import type { SecuritySetupData, RegistrationResponse } from '@/types/registration';

export default function DashboardSecurityPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [data, setData] = useState<Partial<SecuritySetupData>>({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const sid = typeof window !== 'undefined' ? localStorage.getItem('session_id') : null;
    setSessionId(sid);
    if (!sid) return;
    RegistrationClient.fetchProgress(sid)
      .then((progress) => {
        const raw = progress.savedData ?? progress.registrationData ?? progress;
        setData((raw.securitySetup as Partial<SecuritySetupData>) ?? {});
      })
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  const handleComplete = (_response: RegistrationResponse) => {
    setSaveStatus('saving');
    setErrorMessage(null);
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="dashboard-edit-page"><p>Loading...</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="dashboard-edit-page">
        <h2>Security & 2FA</h2>
        <p className="dashboard-edit-desc">View or update your two-factor authentication preference.</p>
        {saveStatus === 'success' && <div className="alert alert-success">Changes saved successfully.</div>}
        {saveStatus === 'error' && errorMessage && <div className="alert alert-error">{errorMessage}</div>}
        <div className="dashboard-form-wrap">
          <Step10SecurityConfirm
            data={data}
            sessionId={sessionId!}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
