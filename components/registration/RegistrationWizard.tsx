import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRegistrationState } from '@/lib/hooks/useRegistrationState';
import { RegistrationClient } from '@/lib/api/registrationClient';
import type { RegistrationResponse } from '@/types/registration';

import { Step1AccountCreation } from './Step1AccountCreation';
import { Step2PersonalInfo } from './Step2PersonalInfo';
import { Step3KYCIdentity } from './Step3KYCIdentity';
import { Step4EmploymentFinancial } from './Step4EmploymentFinancial';
import { Step5IRAType } from './Step5IRAType';
import { Step6Beneficiaries } from './Step6Beneficiaries';
import { Step7Funding } from './Step7Funding';
import { Step8InvestmentsRisk } from './Step8InvestmentsRisk';
import { Step9AgreementsSig } from './Step9AgreementsSig';
import { Step10SecurityConfirm } from './Step10SecurityConfirm';

export interface RegistrationWizardProps {
  onComplete?: (response: RegistrationResponse) => void;
}

export function RegistrationWizard({ onComplete }: RegistrationWizardProps) {
  const router = useRouter();
  const {
    currentStep,
    formData,
    setStep,
    updateFormData,
    saveSession,
    getLastSaved,
  } = useRegistrationState();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Array<{ name: string; url: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [completionResponse, setCompletionResponse] = useState<RegistrationResponse | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const isSessionExpiredError = (err: unknown): boolean => {
    const message = err instanceof Error ? err.message.toLowerCase() : String(err ?? '').toLowerCase();
    return message.includes('401') || message.includes('session expired');
  };

  // Load session ID from localStorage on mount and fetch progress
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSessionId = localStorage.getItem('session_id');
      if (savedSessionId) {
        setSessionId(savedSessionId);
        // Load documents so Step 9 has agreement list (e.g. when returning to registration)
        loadDocuments(savedSessionId);
        // Fetch user's progress from the API
        RegistrationClient.fetchProgress(savedSessionId)
          .then((progress) => {
            console.log('User progress:', progress);
            if (progress.currentStep) {
              setStep(progress.currentStep);
            }
            const registrationData = progress.registrationData || progress.savedData;
            if (registrationData) {
              if (registrationData.personalInfo) {
                updateFormData('personalInfo', registrationData.personalInfo);
              }
              if (registrationData.address) {
                updateFormData('address', registrationData.address);
              }

              Object.entries(registrationData).forEach(([key, value]) => {
                if (key === 'personalInfo' || key === 'address') return;
                updateFormData(key as keyof typeof formData, value);
              });
            }
          })
          .catch((err) => {
            console.error('Failed to fetch progress:', err);
            if (isSessionExpiredError(err)) {
              handleSessionExpired();
            }
          });
      }
      // Note: Don't redirect here - Step 1 creates a new session
      // Only existing sessions are loaded from localStorage
      setIsHydrated(true);
    }
  }, []);

  // When hydrated, no session, and we're past step 1 → show session-expired page and redirect to home
  useEffect(() => {
    if (!isHydrated || !router.isReady) return;
    const sid = typeof window !== 'undefined' ? localStorage.getItem('session_id') : null;
    if (!sid && currentStep > 1) {
      handleSessionExpired();
    }
  }, [isHydrated, currentStep, router.isReady]);

  const stepTitles = [
    'Welcome & Account Creation',
    'Personal & Identity Information',
    'Identity Verification (KYC/AML)',
    'Employment & Financial Profile',
    'IRA Type & Purpose',
    'Beneficiaries',
    'Funding Method',
    'Investment Preferences & Risk',
    'Agreements & Signature',
    'Security Setup & Confirmation',
  ];

  const loadDocuments = async (sid: string) => {
    try {
      const docs = await RegistrationClient.fetchDocuments(sid);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const handleStep1Complete = async (data: any) => {
    try {
      setLoading(true);
      const response = await RegistrationClient.register(data.email, data.password);

      if (response.error) {
        setError(response.error);
        return;
      }

      if (!response.sessionId) {
        setError('Failed to create account. Please try again.');
        return;
      }

      setSessionId(response.sessionId);
      localStorage.setItem('session_id', response.sessionId);
      localStorage.setItem('last_login_email', data.email);
      
      await loadDocuments(response.sessionId);
      updateFormData('accountCreation', {
        email: data.email,
        acceptTerms: data.acceptTerms,
      });
      setStep(2);
    } catch (err) {
      setError('Failed to create account. Please check your email and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = async (stepNumber: number, dataKey: string, data: any) => {
    try {
      setLoading(true);
      
      if (!sessionId) {
        setError('Session lost. Please start over.');
        return;
      }

      updateFormData(dataKey as keyof typeof formData, data);
      
      // Save to backend
      try {
        switch (stepNumber) {
          case 2:
            await RegistrationClient.savePersonalInfo(sessionId, data);
            break;
          case 3:
            await RegistrationClient.saveKYCIdentity(sessionId, data);
            break;
          case 4:
            await RegistrationClient.saveEmploymentFinancial(sessionId, data);
            break;
          case 5:
            await RegistrationClient.saveIRAType(sessionId, data);
            break;
          case 6:
            await RegistrationClient.saveBeneficiaries(sessionId, data);
            break;
          case 7:
            await RegistrationClient.saveFundingMethod(sessionId, data);
            break;
          case 8:
            await RegistrationClient.saveInvestmentPreferences(sessionId, data);
            break;
          case 9:
            await RegistrationClient.saveAgreements(sessionId, data);
            break;
        }
      } catch (err: any) {
        if (isSessionExpiredError(err)) {
          handleSessionExpired();
          return;
        }
        throw err;
      }

      if (stepNumber < 10) {
        setStep(stepNumber + 1);
      }
    } catch (err) {
      setError(`Failed to save step ${stepNumber}. Please try again.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Complete = async (personal: any, address: any) => {
    try {
      setLoading(true);

      if (!sessionId) {
        setError('Session lost. Please start over.');
        return;
      }

      updateFormData('personalInfo', personal);
      updateFormData('address', address);

      const payload = {
        ...personal,
        ...address,
      };

      try {
        await RegistrationClient.savePersonalInfo(sessionId, payload);
      } catch (err: any) {
        if (isSessionExpiredError(err)) {
          handleSessionExpired();
          return;
        }
        throw err;
      }

      setStep(3);
    } catch (err: any) {
      setError(err?.message || 'Failed to save step 2. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStep10Complete = (response: RegistrationResponse) => {
    setIsComplete(true);
    setCompletionResponse(response);
    localStorage.removeItem('registration_session');
    localStorage.removeItem('registration_session_id');
    
    if (onComplete) {
      onComplete(response);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('session_id');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('registration_session');
    router.push('/login');
  };

  const handleSessionExpired = () => {
    localStorage.removeItem('session_id');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('registration_session');
    router.replace('/session-expired');
  };

  const lastSaved = getLastSaved();
  const progressPercentage = ((currentStep - 1) / 9) * 100;

  if (isComplete && completionResponse) {
    return (
      <div className="wizard-container">
        <div className="completion-screen">
          <div className="completion-icon">✓</div>
          <h1>Application Submitted Successfully!</h1>
          
          {completionResponse.applicationId && (
            <div className="application-id">
              <p><strong>Application ID:</strong> {completionResponse.applicationId}</p>
            </div>
          )}

          <div className="next-steps">
            <h3>What happens next:</h3>
            <ul>
              <li>
                <strong>Review:</strong> {completionResponse.reviewTimeline || 'Your application will be reviewed within 1-2 business days'}
              </li>
              <li>
                <strong>Funding:</strong> {completionResponse.fundingTimeline || 'Funds will be transferred within 5-7 business days after approval'}
              </li>
              <li>
                <strong>Confirmation:</strong> You'll receive an email when your IRA is activated and ready to fund
              </li>
            </ul>
          </div>

          {completionResponse.contactInfo && (
            <div className="contact-info">
              <h3>Questions?</h3>
              <p>
                Email: <a href={`mailto:${completionResponse.contactInfo.email}`}>{completionResponse.contactInfo.email}</a>
              </p>
              <p>Phone: {completionResponse.contactInfo.phone}</p>
            </div>
          )}

          <button onClick={() => window.location.href = '/dashboard'} className="btn btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return <div className="wizard-container"><div className="wizard-header"><p>Loading...</p></div></div>;
  }

  // Step 1 doesn't need a session (creates one), but other steps do
  if (!sessionId && currentStep > 1) {
    return <div className="wizard-container"><div className="wizard-header"><p>Session expired. Please start over.</p></div></div>;
  }

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <h1>Self-Directed IRA Registration</h1>
        <div className="progress-indicator">
          <div className="step-counter">Step {currentStep} of 10</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="step-title">{stepTitles[currentStep - 1]}</div>
        </div>

        {lastSaved && (
          <div className="last-saved">
            Last saved: {new Date(lastSaved).toLocaleTimeString()}
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="btn-close">✕</button>
        </div>
      )}

      <div className="wizard-content">
        {currentStep === 1 && (
          <Step1AccountCreation
            data={formData.accountCreation || {}}
            onNext={handleStep1Complete}
          />
        )}
        {currentStep === 2 && (
          <Step2PersonalInfo
            personalData={formData.personalInfo || {}}
            addressData={formData.address || {}}
            onNext={handleStep2Complete}
          />
        )}
        {currentStep === 3 && (
          <Step3KYCIdentity
            data={formData.kycIdentity || {}}
            onNext={(data) => handleStepComplete(3, 'kycIdentity', data)}
          />
        )}
        {currentStep === 4 && (
          <Step4EmploymentFinancial
            data={formData.employmentFinancial || {}}
            onNext={(data) => handleStepComplete(4, 'employmentFinancial', data)}
          />
        )}
        {currentStep === 5 && (
          <Step5IRAType
            data={formData.iraType || {}}
            onNext={(data) => handleStepComplete(5, 'iraType', data)}
          />
        )}
        {currentStep === 6 && (
          <Step6Beneficiaries
            data={formData.beneficiaries || {}}
            onNext={(data) => handleStepComplete(6, 'beneficiaries', data)}
          />
        )}
        {currentStep === 7 && (
          <Step7Funding
            data={formData.fundingMethod || {}}
            onNext={(data) => handleStepComplete(7, 'fundingMethod', data)}
          />
        )}
        {currentStep === 8 && (
          <Step8InvestmentsRisk
            data={formData.investmentPreferences || {}}
            onNext={(data) => handleStepComplete(8, 'investmentPreferences', data)}
          />
        )}
        {currentStep === 9 && (
          <Step9AgreementsSig
            data={formData.agreements || {}}
            documents={documents}
            onNext={(data) => handleStepComplete(9, 'agreements', data)}
          />
        )}
        {currentStep === 10 && sessionId && (
          <Step10SecurityConfirm
            data={formData.securitySetup || {}}
            sessionId={sessionId}
            onComplete={handleStep10Complete}
          />
        )}
      </div>

      <div className="wizard-footer">
        <button
          onClick={() => {
            saveSession();
            alert('Progress saved! You can resume from this step later.');
          }}
          disabled={loading}
          className="btn btn-outline"
        >
          Save & Exit
        </button>

        <button
          onClick={handlePreviousStep}
          disabled={currentStep === 1 || loading}
          className="btn btn-secondary"
        >
          ← Back
        </button>

        <button
          onClick={handleLogout}
          className="btn btn-outline"
          style={{ marginLeft: 'auto' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
