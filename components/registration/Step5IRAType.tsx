import { useState } from 'react';
import type { IRATypeData } from '@/types/registration';

interface Step5Props {
  data: Partial<IRATypeData>;
  onNext: (data: IRATypeData) => void;
}

export function Step5IRAType({ data, onNext }: Step5Props) {
  const [iraType, setIraType] = useState(data.iraType || 'traditional');
  const [purpose, setPurpose] = useState(data.purpose || '');
  const [isEmployer, setIsEmployer] = useState(data.conditionalQuestions?.isEmployer || false);
  const [businessDetails, setBusinessDetails] = useState(data.conditionalQuestions?.businessDetails || '');
  const [decedentName, setDecedentName] = useState(data.conditionalQuestions?.decedentName || '');
  const [relationship, setRelationship] = useState(data.conditionalQuestions?.relationship || '');
  const [dateOfDeath, setDateOfDeath] = useState(data.conditionalQuestions?.dateOfDeath || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const iraTypes = [
    { value: 'traditional', label: 'Traditional IRA', desc: 'Tax-deferred growth. Withdrawals taxed as ordinary income.' },
    { value: 'roth', label: 'Roth IRA', desc: 'After-tax contributions. Qualified withdrawals are tax-free.' },
    { value: 'sep', label: 'SEP IRA', desc: 'For self-employed / small business owners. High contribution limits.' },
    { value: 'simple', label: 'SIMPLE IRA', desc: 'For businesses with 100 or fewer employees.' },
    { value: 'inherited', label: 'Inherited IRA', desc: 'From a deceased person. Special distribution rules apply.' },
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!purpose) newErrors.purpose = 'Please select a purpose';

    if (iraType === 'sep' || iraType === 'simple') {
      if (!businessDetails) newErrors.businessDetails = 'Business details are required';
    }

    if (iraType === 'inherited') {
      if (!decedentName) newErrors.decedentName = 'Decedent name is required';
      if (!relationship) newErrors.relationship = 'Relationship is required';
      if (!dateOfDeath) newErrors.dateOfDeath = 'Date of death is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({
        iraType,
        purpose,
        conditionalQuestions: {
          isEmployer: iraType === 'sep' || iraType === 'simple' ? isEmployer : undefined,
          businessDetails: iraType === 'sep' || iraType === 'simple' ? businessDetails : undefined,
          decedentName: iraType === 'inherited' ? decedentName : undefined,
          relationship: iraType === 'inherited' ? relationship : undefined,
          dateOfDeath: iraType === 'inherited' ? dateOfDeath : undefined,
        },
      });
    }
  };

  return (
    <div className="step-container">
      <h2>IRA Type & Purpose</h2>
      <p className="subtitle">Choose the IRA type that best fits your needs.</p>

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="ira-types-grid">
          {iraTypes.map((type) => (
            <div
              key={type.value}
              className={`ira-card ${iraType === type.value ? 'selected' : ''}`}
              onClick={() => setIraType(type.value as any)}
            >
              <input
                type="radio"
                name="iraType"
                value={type.value}
                checked={iraType === type.value}
                onChange={(e) => setIraType(e.target.value as any)}
              />
              <h3>{type.label}</h3>
              <p>{type.desc}</p>
            </div>
          ))}
        </div>

        <div className="form-group">
          <label htmlFor="purpose">Primary Purpose *</label>
          <select
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className={errors.purpose ? 'input-error' : ''}
          >
            <option value="">-- Select --</option>
            <option value="retirement">Retirement Savings</option>
            <option value="alternative-assets">Alternative Asset Investing</option>
            <option value="consolidation">Plan Consolidation / Rollover</option>
            <option value="tax-planning">Tax Planning</option>
          </select>
          {errors.purpose && <span className="error-message">{errors.purpose}</span>}
        </div>

        {(iraType === 'sep' || iraType === 'simple') && (
          <>
            <div className="form-group checkbox">
              <input
                id="isEmployer"
                type="checkbox"
                checked={isEmployer}
                onChange={(e) => setIsEmployer(e.target.checked)}
              />
              <label htmlFor="isEmployer">I am the employer / business owner</label>
            </div>

            <div className="form-group">
              <label htmlFor="businessDetails">Business Details *</label>
              <textarea
                id="businessDetails"
                value={businessDetails}
                onChange={(e) => setBusinessDetails(e.target.value)}
                placeholder="Brief description of your business and number of employees"
                className={errors.businessDetails ? 'input-error' : ''}
              />
              {errors.businessDetails && <span className="error-message">{errors.businessDetails}</span>}
            </div>
          </>
        )}

        {iraType === 'inherited' && (
          <>
            <div className="form-group">
              <label htmlFor="decedentName">Decedent's Name *</label>
              <input
                id="decedentName"
                type="text"
                value={decedentName}
                onChange={(e) => setDecedentName(e.target.value)}
                className={errors.decedentName ? 'input-error' : ''}
              />
              {errors.decedentName && <span className="error-message">{errors.decedentName}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="relationship">Your Relationship to Decedent *</label>
                <input
                  id="relationship"
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g., Spouse, Parent, Child"
                  className={errors.relationship ? 'input-error' : ''}
                />
                {errors.relationship && <span className="error-message">{errors.relationship}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="dateOfDeath">Date of Death *</label>
                <input
                  id="dateOfDeath"
                  type="date"
                  value={dateOfDeath}
                  onChange={(e) => setDateOfDeath(e.target.value)}
                  className={errors.dateOfDeath ? 'input-error' : ''}
                />
                {errors.dateOfDeath && <span className="error-message">{errors.dateOfDeath}</span>}
              </div>
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary">
          Continue to Next Step
        </button>
      </form>
    </div>
  );
}
