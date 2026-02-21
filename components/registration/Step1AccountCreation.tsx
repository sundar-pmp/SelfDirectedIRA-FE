import { useEffect, useState } from 'react';
import type { AccountCreationData } from '@/types/registration';
import { Validators } from '@/lib/utils/validation';

interface Step1Props {
  data: Partial<AccountCreationData>;
  onNext: (data: AccountCreationData) => void;
}

export function Step1AccountCreation({ data, onNext }: Step1Props) {
  const getSavedLoginEmail = () => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('last_login_email') || '';
  };

  const [email, setEmail] = useState(data.email || getSavedLoginEmail());
  const [password, setPassword] = useState(data.password || '');
  const [confirmPassword, setConfirmPassword] = useState(data.confirmPassword || '');
  const [acceptTerms, setAcceptTerms] = useState(data.acceptTerms || Boolean(data.email || getSavedLoginEmail()));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    color: string;
  } | null>(null);

  useEffect(() => {
    const savedEmail = getSavedLoginEmail();
    setEmail(data.email || savedEmail);
    setPassword(data.password || '');
    setConfirmPassword(data.confirmPassword || '');
    setAcceptTerms(data.acceptTerms || Boolean(data.email || savedEmail));
  }, [data]);

  const validatePasswordStrength = (pwd: string) => {
    const validation = Validators.password(pwd);
    const score = 5 - validation.errors.length;
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['red', 'orange', 'yellow', 'lime', 'green', 'darkgreen'];
    setPasswordStrength({
      score,
      label: labels[score],
      color: colors[score],
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    validatePasswordStrength(e.target.value);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = 'Email is required';
    else if (!Validators.email(email)) newErrors.email = 'Invalid email format';

    if (!password) newErrors.password = 'Password is required';
    else {
      const validation = Validators.password(password);
      if (!validation.valid) newErrors.password = validation.errors.join(', ');
    }

    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!acceptTerms) newErrors.acceptTerms = 'You must accept the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({ email, password, confirmPassword, acceptTerms });
    }
  };

  return (
    <div className="step-container">
      <h2>Welcome & Account Creation</h2>
      <p className="subtitle">Create your account to start your IRA registration. You can save your progress at any time.</p>

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="••••••••"
            className={errors.password ? 'input-error' : ''}
          />
          {passwordStrength && (
            <div className="password-strength" style={{ color: passwordStrength.color }}>
              Strength: {passwordStrength.label}
            </div>
          )}
          <small>Min 8 chars, uppercase, lowercase, number, special character</small>
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className={errors.confirmPassword ? 'input-error' : ''}
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        <div className="form-group checkbox">
          <input
            id="acceptTerms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          <label htmlFor="acceptTerms">I agree to create an account and receive communications</label>
          {errors.acceptTerms && <span className="error-message">{errors.acceptTerms}</span>}
        </div>

        <button type="submit" className="btn btn-primary">
          Continue to Next Step
        </button>
      </form>
    </div>
  );
}
