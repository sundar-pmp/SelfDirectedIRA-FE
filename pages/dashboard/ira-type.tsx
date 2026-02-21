import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Step5IRAType } from '@/components/registration/Step5IRAType';
import { RegistrationClient } from '@/lib/api/registrationClient';

export default function DashboardIRATypePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, unknown>>({});
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
        setData((raw.iraType as Record<string, unknown>) ?? {});
      })
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (payload: Record<string, unknown>) => {
    if (!sessionId) return;
    setSaveStatus('saving');
    setErrorMessage(null);
    RegistrationClient.saveIRAType(sessionId, payload)
      .then(() => {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      })
      .catch((err) => {
        setSaveStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Save failed');
      });
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
        <h2>IRA Type</h2>
        <p className="dashboard-edit-desc">Update your IRA type and purpose.</p>
        {saveStatus === 'success' && <div className="alert alert-success">Changes saved successfully.</div>}
        {saveStatus === 'error' && errorMessage && <div className="alert alert-error">{errorMessage}</div>}
        <div className="dashboard-form-wrap">
          <Step5IRAType data={data as any} onNext={handleSave} />
        </div>
      </div>
    </DashboardLayout>
  );
}
