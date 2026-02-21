import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Step4EmploymentFinancial } from '@/components/registration/Step4EmploymentFinancial';
import { RegistrationClient } from '@/lib/api/registrationClient';
import type { EmploymentFinancialData } from '@/types/registration';

export default function DashboardEmploymentPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [data, setData] = useState<Partial<EmploymentFinancialData>>({});
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
        setData((raw.employmentFinancial as Partial<EmploymentFinancialData>) ?? {});
      })
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (payload: EmploymentFinancialData) => {
    if (!sessionId) return;
    setSaveStatus('saving');
    setErrorMessage(null);
    RegistrationClient.saveEmploymentFinancial(sessionId, payload)
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
        <h2>Employment & Financial</h2>
        <p className="dashboard-edit-desc">Update your employment status, income, and source of funds.</p>
        {saveStatus === 'success' && <div className="alert alert-success">Changes saved successfully.</div>}
        {saveStatus === 'error' && errorMessage && <div className="alert alert-error">{errorMessage}</div>}
        <div className="dashboard-form-wrap">
          <Step4EmploymentFinancial data={data} onNext={handleSave} />
        </div>
      </div>
    </DashboardLayout>
  );
}
