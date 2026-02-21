import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Step2PersonalInfo } from '@/components/registration/Step2PersonalInfo';
import { RegistrationClient } from '@/lib/api/registrationClient';
import type { PersonalInfoData, AddressData } from '@/types/registration';

export default function DashboardPersonalInfoPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [personalData, setPersonalData] = useState<Partial<PersonalInfoData>>({});
  const [addressData, setAddressData] = useState<Partial<AddressData>>({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const sid = typeof window !== 'undefined' ? localStorage.getItem('session_id') : null;
    setSessionId(sid);
    if (!sid) return;
    RegistrationClient.fetchProgress(sid)
      .then((progress) => {
        const data = progress.savedData ?? progress.registrationData ?? progress;
        setPersonalData((data.personalInfo as Partial<PersonalInfoData>) ?? {});
        setAddressData((data.address as Partial<AddressData>) ?? {});
      })
      .catch(() => setPersonalData({}))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (personal: PersonalInfoData, address: AddressData) => {
    if (!sessionId) return;
    setSaveStatus('saving');
    setErrorMessage(null);
    const payload = {
      ...personal,
      ...address,
    };
    RegistrationClient.savePersonalInfo(sessionId, payload)
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
        <h2>Personal & Address</h2>
        <p className="dashboard-edit-desc">Update your name, date of birth, contact information, and residential address.</p>
        {saveStatus === 'success' && <div className="alert alert-success">Changes saved successfully.</div>}
        {saveStatus === 'error' && errorMessage && <div className="alert alert-error">{errorMessage}</div>}
        <div className="dashboard-form-wrap">
          <Step2PersonalInfo
            personalData={personalData}
            addressData={addressData}
            onNext={handleSave}
            submitLabel={saveStatus === 'saving' ? 'Saving...' : 'Save changes'}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
