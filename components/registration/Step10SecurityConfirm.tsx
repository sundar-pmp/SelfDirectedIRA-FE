import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { SecuritySetupData, RegistrationResponse } from '@/types/registration';
import { RegistrationClient } from '@/lib/api/registrationClient';

interface Step10Props {
  data: Partial<SecuritySetupData>;
  sessionId: string;
  onComplete: (response: RegistrationResponse) => void;
}

export function Step10SecurityConfirm({ data, sessionId, onComplete }: Step10Props) {
  const router = useRouter();
  const [twoFAMethod, setTwoFAMethod] = useState<'sms' | 'authenticator' | 'email'>(data.twoFAMethod || 'sms');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const [authenticatorSecret, setAuthenticatorSecret] = useState(data.authenticatorSecret || '');
  const [authenticatorCode, setAuthenticatorCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const isSessionExpiredError = (err: unknown): boolean => {
    const message = err instanceof Error ? err.message.toLowerCase() : String(err ?? '').toLowerCase();
    return message.includes('401') || message.includes('session expired');
  };

  const handleSendCode = async () => {
    if (!phoneNumber) {
      setErrors({ phoneNumber: 'Phone number is required' });
      return;
    }

    setLoading(true);
    try {
      // In a real app, POST to /api/auth/send-2fa-code
      // For now, mock a 6-digit code
      console.log('Sending 2FA code to:', phoneNumber);
      setCodeSent(true);
      setErrors({});
    } catch (err) {
      setErrors({ send: 'Failed to send code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({ verificationCode: 'Please enter a valid 6-digit code' });
      return;
    }

    setLoading(true);
    try {
      // In a real app, POST to /api/auth/verify-2fa-code
      console.log('Verifying code:', verificationCode);
      setCodeVerified(true);
      setErrors({});
    } catch (err) {
      setErrors({ verificationCode: 'Invalid code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (twoFAMethod !== 'email' && !codeVerified) {
      setErrors({ twoFA: '2FA verification is required' });
      return;
    }

    setLoading(true);
    try {
      const response = await RegistrationClient.submitFinalRegistration(sessionId, {
        twoFAMethod,
        phoneNumberVerified: codeVerified || twoFAMethod === 'email',
      });

      onComplete(response);
    } catch (err) {
      if (isSessionExpiredError(err)) {
        localStorage.removeItem('session_id');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('registration_session');
        router.replace('/session-expired');
        return;
      }
      setErrors({ submit: 'Failed to submit registration. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step-container">
      <h2>Security Setup & Confirmation</h2>
      <p className="subtitle">Set up two-factor authentication to secure your account.</p>

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label>Two-Factor Authentication Method *</label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                id="2fa-sms"
                type="radio"
                value="sms"
                checked={twoFAMethod === 'sms'}
                onChange={(e) => setTwoFAMethod(e.target.value as any)}
              />
              <label htmlFor="2fa-sms">SMS Text Message</label>
            </div>
            <div className="radio-item">
              <input
                id="2fa-auth"
                type="radio"
                value="authenticator"
                checked={twoFAMethod === 'authenticator'}
                onChange={(e) => setTwoFAMethod(e.target.value as any)}
              />
              <label htmlFor="2fa-auth">Authenticator App (Google Authenticator, Authy, etc.)</label>
            </div>
            <div className="radio-item">
              <input
                id="2fa-email"
                type="radio"
                value="email"
                checked={twoFAMethod === 'email'}
                onChange={(e) => setTwoFAMethod(e.target.value as any)}
              />
              <label htmlFor="2fa-email">Email</label>
            </div>
          </div>
        </div>

        {twoFAMethod === 'sms' && (
          <div className="twofa-setup">
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d-]/g, ''))}
                placeholder="###-###-####"
                disabled={codeSent}
                className={errors.phoneNumber ? 'input-error' : ''}
              />
              {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
            </div>

            {!codeSent ? (
              <button
                type="button"
                onClick={handleSendCode}
                disabled={loading}
                className="btn btn-secondary"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            ) : (
              <div className="form-group">
                <label htmlFor="verificationCode">Enter 6-Digit Code *</label>
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  disabled={codeVerified}
                  className={errors.verificationCode ? 'input-error' : ''}
                />
                {errors.verificationCode && (
                  <span className="error-message">{errors.verificationCode}</span>
                )}

                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={loading || codeVerified}
                  className="btn btn-secondary"
                >
                  {loading ? 'Verifying...' : codeVerified ? '✓ Verified' : 'Verify Code'}
                </button>
              </div>
            )}
          </div>
        )}

        {twoFAMethod === 'authenticator' && (
          <div className="twofa-setup">
            <p className="info-text">
              Scan the QR code below with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator,
              etc.).
            </p>

            <div className="qr-code-placeholder">
              {/* In a real app, generate and display QR code */}
              <p>[QR Code would be displayed here]</p>
              <p>Manual Entry Code: {authenticatorSecret || 'ABCD1234EFGH5678'}</p>
            </div>

            <div className="form-group">
              <label htmlFor="authenticatorCode">Enter 6-Digit Code from App *</label>
              <input
                id="authenticatorCode"
                type="text"
                value={authenticatorCode}
                onChange={(e) => setAuthenticatorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className={errors.authenticatorCode ? 'input-error' : ''}
              />
              {errors.authenticatorCode && (
                <span className="error-message">{errors.authenticatorCode}</span>
              )}
            </div>

            <button
              type="button"
              onClick={async () => {
                if (authenticatorCode.length === 6) {
                  try {
                    // Verify authenticator code
                    setCodeVerified(true);
                    setErrors({});
                  } catch (err) {
                    setErrors({ authenticatorCode: 'Invalid code. Please try again.' });
                  }
                }
              }}
              disabled={authenticatorCode.length !== 6 || codeVerified}
              className="btn btn-secondary"
            >
              {codeVerified ? '✓ Verified' : 'Verify Code'}
            </button>
          </div>
        )}

        {twoFAMethod === 'email' && (
          <div className="twofa-setup">
            <p className="info-text">
              A verification code will be sent to your registered email address. This is the most convenient method.
            </p>
            <button
              type="button"
              onClick={async () => {
                setCodeVerified(true);
              }}
              className="btn btn-secondary"
            >
              Enable Email 2FA
            </button>
          </div>
        )}

        {errors.twoFA && <span className="error-message">{errors.twoFA}</span>}

        <hr />

        <div className="confirmation-info">
          <h3>What Happens Next?</h3>
          <ul>
            <li>Your application will be reviewed by our compliance team (typically 1-2 business days)</li>
            <li>You'll receive an email confirmation with your Application ID</li>
            <li>Funding typically transfers within 5-7 business days after approval</li>
            <li>
              You can log into your account anytime to check your application status and funding progress
            </li>
          </ul>

          <h3>Questions?</h3>
          <p>
            Contact our support team at <strong>support@selfdirectedira.com</strong> or call{' '}
            <strong>1-800-555-0123</strong>
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || (twoFAMethod !== 'email' && !codeVerified)}
          className="btn btn-primary btn-lg"
        >
          {loading ? 'Submitting...' : '✓ Submit Application'}
        </button>
      </form>
    </div>
  );
}
