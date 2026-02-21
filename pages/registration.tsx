import React from 'react';
import { RegistrationWizard } from '../components/registration/RegistrationWizard';
import type { RegistrationResponse } from '../types/registration';

export default function RegistrationPage() {
  const handleComplete = (response: RegistrationResponse) => {
    console.log('Registration complete:', response);
    // Optionally redirect or show success message
  };

  return (
    <div className="page registration-page">
      <RegistrationWizard onComplete={handleComplete} />
    </div>
  );
}
