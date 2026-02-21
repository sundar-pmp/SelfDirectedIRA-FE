import { useState } from 'react';
import type { Beneficiary, BeneficiariesData } from '@/types/registration';
import { Validators } from '@/lib/utils/validation';

interface Step6Props {
  data: Partial<BeneficiariesData>;
  onNext: (data: BeneficiariesData) => void;
}

export function Step6Beneficiaries({ data, onNext }: Step6Props) {
  const [primaryBeneficiaries, setPrimaryBeneficiaries] = useState<Beneficiary[]>(
    data.primaryBeneficiaries || []
  );
  const [contingentBeneficiaries, setContingentBeneficiaries] = useState<Beneficiary[]>(
    data.contingentBeneficiaries || []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addBeneficiary = (type: 'primary' | 'contingent') => {
    const newBeneficiary: Beneficiary = {
      id: Math.random().toString(),
      fullName: '',
      relationship: '',
      dateOfBirth: '',
      ssn: '',
      type,
      allocationPercentage: 0,
    };

    if (type === 'primary') {
      setPrimaryBeneficiaries([...primaryBeneficiaries, newBeneficiary]);
    } else {
      setContingentBeneficiaries([...contingentBeneficiaries, newBeneficiary]);
    }
  };

  const removeBeneficiary = (id: string, type: 'primary' | 'contingent') => {
    if (type === 'primary') {
      setPrimaryBeneficiaries(primaryBeneficiaries.filter((b) => b.id !== id));
    } else {
      setContingentBeneficiaries(contingentBeneficiaries.filter((b) => b.id !== id));
    }
  };

  const updateBeneficiary = (id: string, field: string, value: any, type: 'primary' | 'contingent') => {
    const list = type === 'primary' ? primaryBeneficiaries : contingentBeneficiaries;
    const updated = list.map((b) => (b.id === id ? { ...b, [field]: value } : b));
    if (type === 'primary') {
      setPrimaryBeneficiaries(updated);
    } else {
      setContingentBeneficiaries(updated);
    }
  };

  const getTotalPercentage = (list: Beneficiary[]) => {
    return list.reduce((sum, b) => sum + (b.allocationPercentage || 0), 0);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (primaryBeneficiaries.length === 0) {
      newErrors.primaryBeneficiaries = 'At least one primary beneficiary is required';
    } else {
      const primaryTotal = getTotalPercentage(primaryBeneficiaries);
      if (primaryTotal !== 100) {
        newErrors.primaryPercentage = `Primary beneficiary percentages must total 100% (current: ${primaryTotal}%)`;
      }

      primaryBeneficiaries.forEach((b) => {
        if (!b.fullName) newErrors[`name-${b.id}`] = 'Name required';
        if (!b.relationship) newErrors[`rel-${b.id}`] = 'Relationship required';
        if (!b.dateOfBirth) newErrors[`dob-${b.id}`] = 'DOB required';
        if (!b.ssn) newErrors[`ssn-${b.id}`] = 'SSN required';
      });
    }

    if (contingentBeneficiaries.length > 0) {
      const contingentTotal = getTotalPercentage(contingentBeneficiaries);
      if (contingentTotal !== 100) {
        newErrors.contingentPercentage = `Contingent beneficiary percentages must total 100% (current: ${contingentTotal}%)`;
      }

      contingentBeneficiaries.forEach((b) => {
        if (!b.fullName) newErrors[`name-${b.id}`] = 'Name required';
        if (!b.relationship) newErrors[`rel-${b.id}`] = 'Relationship required';
        if (!b.dateOfBirth) newErrors[`dob-${b.id}`] = 'DOB required';
        if (!b.ssn) newErrors[`ssn-${b.id}`] = 'SSN required';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({ primaryBeneficiaries, contingentBeneficiaries });
    }
  };

  return (
    <div className="step-container">
      <h2>Beneficiaries</h2>
      <p className="subtitle">Designate who will receive your IRA if you pass away.</p>

      <form onSubmit={handleSubmit} className="registration-form">
        <h3>Primary Beneficiaries *</h3>
        {errors.primaryBeneficiaries && <span className="error-message">{errors.primaryBeneficiaries}</span>}
        {errors.primaryPercentage && <span className="error-message">{errors.primaryPercentage}</span>}

        <div className="beneficiary-list">
          {primaryBeneficiaries.map((beneficiary) => (
            <div key={beneficiary.id} className="beneficiary-card">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={beneficiary.fullName}
                    onChange={(e) => updateBeneficiary(beneficiary.id!, 'fullName', e.target.value, 'primary')}
                    className={errors[`name-${beneficiary.id}`] ? 'input-error' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>Relationship *</label>
                  <input
                    type="text"
                    value={beneficiary.relationship}
                    onChange={(e) =>
                      updateBeneficiary(beneficiary.id!, 'relationship', e.target.value, 'primary')
                    }
                    placeholder="Spouse, Child, Parent, etc."
                    className={errors[`rel-${beneficiary.id}`] ? 'input-error' : ''}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={beneficiary.dateOfBirth}
                    onChange={(e) => updateBeneficiary(beneficiary.id!, 'dateOfBirth', e.target.value, 'primary')}
                    className={errors[`dob-${beneficiary.id}`] ? 'input-error' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>SSN *</label>
                  <input
                    type="password"
                    value={beneficiary.ssn}
                    onChange={(e) => updateBeneficiary(beneficiary.id!, 'ssn', e.target.value, 'primary')}
                    placeholder="###-##-####"
                    className={errors[`ssn-${beneficiary.id}`] ? 'input-error' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>Allocation % *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={beneficiary.allocationPercentage}
                    onChange={(e) =>
                      updateBeneficiary(
                        beneficiary.id!,
                        'allocationPercentage',
                        parseFloat(e.target.value) || 0,
                        'primary'
                      )
                    }
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeBeneficiary(beneficiary.id!, 'primary')}
                className="btn btn-danger btn-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <p className="allocation-bar">
          Primary Total: {getTotalPercentage(primaryBeneficiaries)}%
          <div className="progress-bar">
            <div style={{ width: `${getTotalPercentage(primaryBeneficiaries)}%` }}></div>
          </div>
        </p>

        <button
          type="button"
          onClick={() => addBeneficiary('primary')}
          className="btn btn-secondary btn-sm"
        >
          + Add Primary Beneficiary
        </button>

        <hr />

        <h3>Contingent Beneficiaries (Optional)</h3>
        {errors.contingentPercentage && <span className="error-message">{errors.contingentPercentage}</span>}

        <div className="beneficiary-list">
          {contingentBeneficiaries.map((beneficiary) => (
            <div key={beneficiary.id} className="beneficiary-card">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={beneficiary.fullName}
                    onChange={(e) =>
                      updateBeneficiary(beneficiary.id!, 'fullName', e.target.value, 'contingent')
                    }
                    className={errors[`name-${beneficiary.id}`] ? 'input-error' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>Relationship *</label>
                  <input
                    type="text"
                    value={beneficiary.relationship}
                    onChange={(e) =>
                      updateBeneficiary(beneficiary.id!, 'relationship', e.target.value, 'contingent')
                    }
                    placeholder="Spouse, Child, Parent, etc."
                    className={errors[`rel-${beneficiary.id}`] ? 'input-error' : ''}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={beneficiary.dateOfBirth}
                    onChange={(e) =>
                      updateBeneficiary(beneficiary.id!, 'dateOfBirth', e.target.value, 'contingent')
                    }
                    className={errors[`dob-${beneficiary.id}`] ? 'input-error' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>SSN *</label>
                  <input
                    type="password"
                    value={beneficiary.ssn}
                    onChange={(e) =>
                      updateBeneficiary(beneficiary.id!, 'ssn', e.target.value, 'contingent')
                    }
                    placeholder="###-##-####"
                    className={errors[`ssn-${beneficiary.id}`] ? 'input-error' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>Allocation % *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={beneficiary.allocationPercentage}
                    onChange={(e) =>
                      updateBeneficiary(
                        beneficiary.id!,
                        'allocationPercentage',
                        parseFloat(e.target.value) || 0,
                        'contingent'
                      )
                    }
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeBeneficiary(beneficiary.id!, 'contingent')}
                className="btn btn-danger btn-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {contingentBeneficiaries.length > 0 && (
          <p className="allocation-bar">
            Contingent Total: {getTotalPercentage(contingentBeneficiaries)}%
            <div className="progress-bar">
              <div style={{ width: `${getTotalPercentage(contingentBeneficiaries)}%` }}></div>
            </div>
          </p>
        )}

        <button
          type="button"
          onClick={() => addBeneficiary('contingent')}
          className="btn btn-secondary btn-sm"
        >
          + Add Contingent Beneficiary
        </button>

        <button type="submit" className="btn btn-primary">
          Continue to Next Step
        </button>
      </form>
    </div>
  );
}
