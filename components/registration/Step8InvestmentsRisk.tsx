import { useState } from 'react';
import type { InvestmentPreferencesData } from '@/types/registration';

interface Step8Props {
  data: Partial<InvestmentPreferencesData>;
  onNext: (data: InvestmentPreferencesData) => void;
}

export function Step8InvestmentsRisk({ data, onNext }: Step8Props) {
  const [assetTypes, setAssetTypes] = useState<string[]>(data.assetTypes || []);
  const [assetDetails, setAssetDetails] = useState(data.assetDetails || {});
  const [understandsRisks, setUnderstandsRisks] = useState(
    data.riskAcknowledgments?.understandsNonTraditionalRisks || false
  );
  const [acceptsResponsibility, setAcceptsResponsibility] = useState(
    data.riskAcknowledgments?.acceptsResponsibilityForDecisions || false
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const assetOptions = [
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'private-equity', label: 'Private Equity' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'precious-metals', label: 'Precious Metals' },
    { value: 'notes-lending', label: 'Notes & Lending' },
    { value: 'other', label: 'Other' },
  ];

  const handleAssetTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const updated = e.target.checked
      ? [...assetTypes, value]
      : assetTypes.filter((a) => a !== value);
    setAssetTypes(updated);

    // Initialize asset details
    if (e.target.checked && !assetDetails[value]) {
      setAssetDetails((prev) => ({
        ...prev,
        [value]: { experienceLevel: 'limited', plannedAllocation: 0 },
      }));
    }
  };

  const updateAssetDetail = (assetType: string, field: string, value: any) => {
    setAssetDetails((prev) => ({
      ...prev,
      [assetType]: {
        ...prev[assetType],
        [field]: value,
      },
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!understandsRisks) {
      newErrors.understandsRisks = 'You must acknowledge the risks';
    }

    if (!acceptsResponsibility) {
      newErrors.acceptsResponsibility = 'You must accept responsibility for investment decisions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({
        assetTypes,
        assetDetails,
        riskAcknowledgments: {
          understandsNonTraditionalRisks: understandsRisks,
          acceptsResponsibilityForDecisions: acceptsResponsibility,
        },
      });
    }
  };

  return (
    <div className="step-container">
      <h2>Investment Preferences & Risk Acknowledgments</h2>
      <p className="subtitle">
        Self-directed IRAs allow you to invest in non-traditional assets. Tell us what you're interested in.
      </p>

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label>Asset Types You Intend to Invest In (optional)</label>
          <div className="checkbox-group">
            {assetOptions.map((option) => (
              <div key={option.value} className="checkbox-item">
                <input
                  id={`asset-${option.value}`}
                  type="checkbox"
                  value={option.value}
                  checked={assetTypes.includes(option.value)}
                  onChange={handleAssetTypeChange}
                />
                <label htmlFor={`asset-${option.value}`}>{option.label}</label>
              </div>
            ))}
          </div>
        </div>

        {assetTypes.length > 0 && (
          <div className="asset-details">
            <h3>Asset Type Details</h3>
            {assetTypes.map((assetType) => (
              <div key={assetType} className="asset-detail-card">
                <h4>{assetOptions.find((o) => o.value === assetType)?.label}</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label>Experience Level</label>
                    <select
                      value={assetDetails[assetType]?.experienceLevel || 'limited'}
                      onChange={(e) => updateAssetDetail(assetType, 'experienceLevel', e.target.value)}
                    >
                      <option value="none">None</option>
                      <option value="limited">Limited</option>
                      <option value="moderate">Moderate</option>
                      <option value="extensive">Extensive</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Planned Allocation %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={assetDetails[assetType]?.plannedAllocation || 0}
                      onChange={(e) => updateAssetDetail(assetType, 'plannedAllocation', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <hr />

        <h3>Risk Acknowledgments</h3>
        <p className="info-text">
          Please read and acknowledge the following risk disclosures. Self-directed IRAs carry unique risks you should
          understand.
        </p>

        <div className="form-group checkbox">
          <input
            id="understandsRisks"
            type="checkbox"
            checked={understandsRisks}
            onChange={(e) => setUnderstandsRisks(e.target.checked)}
          />
          <label htmlFor="understandsRisks">
            I understand that self-directed IRAs may invest in non-traditional assets that can be illiquid, volatile,
            and risky.
          </label>
          {errors.understandsRisks && <span className="error-message">{errors.understandsRisks}</span>}
        </div>

        <div className="form-group checkbox">
          <input
            id="acceptsResponsibility"
            type="checkbox"
            checked={acceptsResponsibility}
            onChange={(e) => setAcceptsResponsibility(e.target.checked)}
          />
          <label htmlFor="acceptsResponsibility">
            I understand I am responsible for all investment decisions made within this IRA. The custodian does not
            provide investment advice.
          </label>
          {errors.acceptsResponsibility && (
            <span className="error-message">{errors.acceptsResponsibility}</span>
          )}
        </div>

        <button type="submit" className="btn btn-primary">
          Continue to Next Step
        </button>
      </form>
    </div>
  );
}
