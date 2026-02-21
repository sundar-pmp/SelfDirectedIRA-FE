import { useState } from 'react';
import type { EmploymentFinancialData } from '@/types/registration';

interface Step4Props {
  data: Partial<EmploymentFinancialData>;
  onNext: (data: EmploymentFinancialData) => void;
}

export function Step4EmploymentFinancial({ data, onNext }: Step4Props) {
  const [employmentStatus, setEmploymentStatus] = useState(data.employmentStatus || 'employed');
  const [employerName, setEmployerName] = useState(data.employerName || '');
  const [employerAddress, setEmployerAddress] = useState(data.employerAddress || '');
  const [occupation, setOccupation] = useState(data.occupation || '');
  const [annualIncomeRange, setAnnualIncomeRange] = useState(data.annualIncomeRange || 'under-50k');
  const [netWorthRange, setNetWorthRange] = useState(data.netWorthRange || 'under-100k');
  const [sourceOfFunds, setSourceOfFunds] = useState<string[]>(data.sourceOfFunds || []);
  const [investmentExperience, setInvestmentExperience] = useState(data.investmentExperience || 'limited');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sourceOptions = [
    { value: 'salary', label: 'Salary / W-2 Income' },
    { value: 'business', label: 'Business Income' },
    { value: 'investments', label: 'Investment Returns' },
    { value: 'inheritance', label: 'Inheritance' },
    { value: 'retirement-plan', label: 'Retirement Plan Distribution' },
    { value: 'other', label: 'Other' },
  ];

  const handleSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSourceOfFunds((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (employmentStatus === 'employed' || employmentStatus === 'self-employed') {
      if (!employerName) newErrors.employerName = 'Employer name is required';
      if (!occupation) newErrors.occupation = 'Occupation is required';
    }

    if (sourceOfFunds.length === 0) newErrors.sourceOfFunds = 'Select at least one source of funds';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({
        employmentStatus,
        employerName,
        employerAddress,
        occupation,
        annualIncomeRange,
        netWorthRange,
        sourceOfFunds,
        investmentExperience,
      });
    }
  };

  return (
    <div className="step-container">
      <h2>Employment & Financial Profile</h2>
      <p className="subtitle">This information helps us ensure the IRA is appropriate for your financial situation.</p>

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label htmlFor="employmentStatus">Employment Status *</label>
          <select id="employmentStatus" value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)}>
            <option value="employed">Employed</option>
            <option value="self-employed">Self-Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="retired">Retired</option>
            <option value="student">Student</option>
            <option value="homemaker">Homemaker</option>
          </select>
        </div>

        {(employmentStatus === 'employed' || employmentStatus === 'self-employed') && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="employerName">Employer Name *</label>
                <input
                  id="employerName"
                  type="text"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  className={errors.employerName ? 'input-error' : ''}
                />
                {errors.employerName && <span className="error-message">{errors.employerName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="employerAddress">Employer Address</label>
                <input
                  id="employerAddress"
                  type="text"
                  value={employerAddress}
                  onChange={(e) => setEmployerAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="occupation">Occupation *</label>
              <input
                id="occupation"
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className={errors.occupation ? 'input-error' : ''}
              />
              {errors.occupation && <span className="error-message">{errors.occupation}</span>}
            </div>
          </>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="annualIncomeRange">Annual Income Range *</label>
            <select
              id="annualIncomeRange"
              value={annualIncomeRange}
              onChange={(e) => setAnnualIncomeRange(e.target.value)}
            >
              <option value="under-50k">Under $50,000</option>
              <option value="50k-100k">$50,000 - $100,000</option>
              <option value="100k-250k">$100,000 - $250,000</option>
              <option value="250k-500k">$250,000 - $500,000</option>
              <option value="over-500k">Over $500,000</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="netWorthRange">Net Worth Range *</label>
            <select id="netWorthRange" value={netWorthRange} onChange={(e) => setNetWorthRange(e.target.value)}>
              <option value="under-100k">Under $100,000</option>
              <option value="100k-500k">$100,000 - $500,000</option>
              <option value="500k-1m">$500,000 - $1,000,000</option>
              <option value="over-1m">Over $1,000,000</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Source of Funds (select all that apply) *</label>
          <div className="checkbox-group">
            {sourceOptions.map((option) => (
              <div key={option.value} className="checkbox-item">
                <input
                  id={`source-${option.value}`}
                  type="checkbox"
                  value={option.value}
                  checked={sourceOfFunds.includes(option.value)}
                  onChange={handleSourceChange}
                />
                <label htmlFor={`source-${option.value}`}>{option.label}</label>
              </div>
            ))}
          </div>
          {errors.sourceOfFunds && <span className="error-message">{errors.sourceOfFunds}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="investmentExperience">Investment Experience (optional)</label>
          <select
            id="investmentExperience"
            value={investmentExperience}
            onChange={(e) => setInvestmentExperience(e.target.value as any)}
          >
            <option value="none">None</option>
            <option value="limited">Limited</option>
            <option value="moderate">Moderate</option>
            <option value="extensive">Extensive</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Continue to Next Step
        </button>
      </form>
    </div>
  );
}
