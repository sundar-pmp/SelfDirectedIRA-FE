import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Step9AgreementsSig } from '@/components/registration/Step9AgreementsSig';
import { RegistrationClient } from '@/lib/api/registrationClient';

export default function DashboardAgreementsPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [documents, setDocuments] = useState<Array<{ name: string; url: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const sid = typeof window !== 'undefined' ? localStorage.getItem('session_id') : null;
    setSessionId(sid);
    if (!sid) return;
    Promise.all([
      RegistrationClient.fetchProgress(sid),
      RegistrationClient.fetchDocuments(sid),
    ])
      .then(([progress, docs]) => {
        const raw = progress.savedData ?? progress.registrationData ?? progress;
        setData((raw.agreements as Record<string, unknown>) ?? {});
        setDocuments(docs);
      })
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (payload: Record<string, unknown>) => {
    if (!sessionId) return;
    setSaveStatus('saving');
    setErrorMessage(null);
    RegistrationClient.saveAgreements(sessionId, payload)
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
        <h2>Agreements & Signature</h2>
        <p className="dashboard-edit-desc">Update accepted agreements and e-signature.</p>
        {saveStatus === 'success' && <div className="alert alert-success">Changes saved successfully.</div>}
        {saveStatus === 'error' && errorMessage && <div className="alert alert-error">{errorMessage}</div>}
        <div className="dashboard-form-wrap">
          <Step9AgreementsSig data={data as any} documents={documents} onNext={handleSave} />
        </div>
      </div>
    </DashboardLayout>
  );
}
