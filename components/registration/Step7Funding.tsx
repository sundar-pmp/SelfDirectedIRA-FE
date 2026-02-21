import { useState } from 'react';
import type { FundingMethodData, FundingMethod } from '@/types/registration';
import { Validators, maskAccountNumber } from '@/lib/utils/validation';

interface Step7Props {
  data: Partial<FundingMethodData>;
  onNext: (data: FundingMethodData) => void;
}

export function Step7Funding({ data, onNext }: Step7Props) {
  const [fundingMethods, setFundingMethods] = useState<FundingMethod[]>(data.methods || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addFundingMethod = (type: 'transfer' | 'rollover' | 'new-contribution') => {
    const newMethod: FundingMethod = { type };

    if (type === 'transfer') {
      newMethod.transferDetails = {
        currentCustodian: '',
        accountType: 'traditional',
        accountNumber: '',
        estimatedAmount: 0,
      };
    } else if (type === 'rollover') {
      newMethod.rolloverDetails = {
        planType: '401k',
        employerName: '',
        planAdminContact: '',
        estimatedAmount: 0,
      };
    } else if (type === 'new-contribution') {
      newMethod.contributionDetails = {
        amount: 0,
        taxYear: new Date().getFullYear(),
        fundingSource: 'bank-transfer',
        bankAccount: {
          accountHolderName: '',
          routingNumber: '',
          accountNumber: '',
          accountType: 'checking',
        },
      };
    }

    setFundingMethods([...fundingMethods, newMethod]);
  };

  const removeFundingMethod = (index: number) => {
    setFundingMethods(fundingMethods.filter((_, i) => i !== index));
  };

  const updateTransferDetails = (index: number, field: string, value: any) => {
    const updated = [...fundingMethods];
    if (updated[index].transferDetails) {
      updated[index].transferDetails = { ...updated[index].transferDetails!, [field]: value };
    }
    setFundingMethods(updated);
  };

  const updateRolloverDetails = (index: number, field: string, value: any) => {
    const updated = [...fundingMethods];
    if (updated[index].rolloverDetails) {
      updated[index].rolloverDetails = { ...updated[index].rolloverDetails!, [field]: value };
    }
    setFundingMethods(updated);
  };

  const updateContributionDetails = (index: number, field: string, value: any) => {
    const updated = [...fundingMethods];
    if (updated[index].contributionDetails) {
      updated[index].contributionDetails = { ...updated[index].contributionDetails!, [field]: value };
    }
    setFundingMethods(updated);
  };

  const updateBankAccount = (index: number, field: string, value: any) => {
    const updated = [...fundingMethods];
    if (updated[index].contributionDetails?.bankAccount) {
      updated[index].contributionDetails.bankAccount = {
        ...updated[index].contributionDetails.bankAccount!,
        [field]: value,
      };
    }
    setFundingMethods(updated);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (fundingMethods.length === 0) {
      newErrors.methods = 'Please select at least one funding method';
    }

    fundingMethods.forEach((method, idx) => {
      if (method.type === 'transfer' && method.transferDetails) {
        if (!method.transferDetails.currentCustodian)
          newErrors[`transfer-custodian-${idx}`] = 'Custodian name required';
        if (!method.transferDetails.accountNumber) newErrors[`transfer-account-${idx}`] = 'Account number required';
      }

      if (method.type === 'rollover' && method.rolloverDetails) {
        if (!method.rolloverDetails.employerName) newErrors[`rollover-employer-${idx}`] = 'Employer name required';
        if (!method.rolloverDetails.planAdminContact)
          newErrors[`rollover-contact-${idx}`] = 'Plan admin contact required';
      }

      if (method.type === 'new-contribution' && method.contributionDetails) {
        if (method.contributionDetails.amount <= 0) newErrors[`contribution-amount-${idx}`] = 'Amount required';
        if (method.contributionDetails.fundingSource === 'bank-transfer' && method.contributionDetails.bankAccount) {
          if (!method.contributionDetails.bankAccount.routingNumber)
            newErrors[`bank-routing-${idx}`] = 'Routing number required';
          if (!Validators.routingNumber(method.contributionDetails.bankAccount.routingNumber))
            newErrors[`bank-routing-${idx}`] = 'Invalid routing number';
          if (!method.contributionDetails.bankAccount.accountNumber)
            newErrors[`bank-account-${idx}`] = 'Account number required';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({ methods: fundingMethods });
    }
  };

  return (
    <div className="step-container">
      <h2>Funding Method</h2>
      <p className="subtitle">Choose how you want to fund your IRA. You can select multiple methods.</p>

      <form onSubmit={handleSubmit} className="registration-form">
        {errors.methods && <span className="error-message">{errors.methods}</span>}

        <div className="funding-cards">
          {fundingMethods.map((method, idx) => (
            <div key={idx} className="funding-method-card">
              <div className="card-header">
                <span className="method-type">
                  {method.type === 'transfer' && 'IRA Transfer'}
                  {method.type === 'rollover' && 'Employer Plan Rollover'}
                  {method.type === 'new-contribution' && 'New Contribution'}
                </span>
                <button
                  type="button"
                  onClick={() => removeFundingMethod(idx)}
                  className="btn btn-danger btn-sm"
                >
                  ✕
                </button>
              </div>

              {method.type === 'transfer' && method.transferDetails && (
                <div className="card-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Current Custodian Name *</label>
                      <input
                        type="text"
                        value={method.transferDetails.currentCustodian}
                        onChange={(e) => updateTransferDetails(idx, 'currentCustodian', e.target.value)}
                        placeholder="e.g., Fidelity, Charles Schwab"
                        className={errors[`transfer-custodian-${idx}`] ? 'input-error' : ''}
                      />
                    </div>
                    <div className="form-group">
                      <label>Account Type *</label>
                      <select
                        value={method.transferDetails.accountType}
                        onChange={(e) => updateTransferDetails(idx, 'accountType', e.target.value)}
                      >
                        <option value="traditional">Traditional</option>
                        <option value="roth">Roth</option>
                        <option value="sep">SEP</option>
                        <option value="simple">SIMPLE</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Account Number *</label>
                      <input
                        type="password"
                        value={method.transferDetails.accountNumber}
                        onChange={(e) => updateTransferDetails(idx, 'accountNumber', e.target.value)}
                        className={errors[`transfer-account-${idx}`] ? 'input-error' : ''}
                      />
                      {method.transferDetails.accountNumber && (
                        <small>Masked: {maskAccountNumber(method.transferDetails.accountNumber)}</small>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Estimated Amount</label>
                      <input
                        type="number"
                        value={method.transferDetails.estimatedAmount}
                        onChange={(e) =>
                          updateTransferDetails(idx, 'estimatedAmount', parseFloat(e.target.value) || 0)
                        }
                        placeholder="$0.00"
                      />
                    </div>
                  </div>
                </div>
              )}

              {method.type === 'rollover' && method.rolloverDetails && (
                <div className="card-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Plan Type *</label>
                      <select
                        value={method.rolloverDetails.planType}
                        onChange={(e) => updateRolloverDetails(idx, 'planType', e.target.value)}
                      >
                        <option value="401k">401(k)</option>
                        <option value="403b">403(b)</option>
                        <option value="457">457</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Employer Name *</label>
                      <input
                        type="text"
                        value={method.rolloverDetails.employerName}
                        onChange={(e) => updateRolloverDetails(idx, 'employerName', e.target.value)}
                        className={errors[`rollover-employer-${idx}`] ? 'input-error' : ''}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Plan Administrator Contact *</label>
                    <input
                      type="text"
                      value={method.rolloverDetails.planAdminContact}
                      onChange={(e) => updateRolloverDetails(idx, 'planAdminContact', e.target.value)}
                      placeholder="Name, phone, or email"
                      className={errors[`rollover-contact-${idx}`] ? 'input-error' : ''}
                    />
                  </div>

                  <div className="form-group">
                    <label>Estimated Amount</label>
                    <input
                      type="number"
                      value={method.rolloverDetails.estimatedAmount}
                      onChange={(e) => updateRolloverDetails(idx, 'estimatedAmount', parseFloat(e.target.value) || 0)}
                      placeholder="$0.00"
                    />
                  </div>
                </div>
              )}

              {method.type === 'new-contribution' && method.contributionDetails && (
                <div className="card-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contribution Amount *</label>
                      <input
                        type="number"
                        value={method.contributionDetails.amount}
                        onChange={(e) => updateContributionDetails(idx, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="$0.00"
                        className={errors[`contribution-amount-${idx}`] ? 'input-error' : ''}
                      />
                    </div>
                    <div className="form-group">
                      <label>Tax Year *</label>
                      <input
                        type="number"
                        value={method.contributionDetails.taxYear}
                        onChange={(e) => updateContributionDetails(idx, 'taxYear', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Funding Source *</label>
                    <select
                      value={method.contributionDetails.fundingSource}
                      onChange={(e) => updateContributionDetails(idx, 'fundingSource', e.target.value)}
                    >
                      <option value="bank-transfer">Bank Transfer</option>
                      <option value="check">Check</option>
                      <option value="wire">Wire Transfer</option>
                    </select>
                  </div>

                  {method.contributionDetails.fundingSource === 'bank-transfer' &&
                    method.contributionDetails.bankAccount && (
                      <>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Account Holder Name *</label>
                            <input
                              type="text"
                              value={method.contributionDetails.bankAccount.accountHolderName}
                              onChange={(e) => updateBankAccount(idx, 'accountHolderName', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Account Type</label>
                            <select
                              value={method.contributionDetails.bankAccount.accountType}
                              onChange={(e) => updateBankAccount(idx, 'accountType', e.target.value)}
                            >
                              <option value="checking">Checking</option>
                              <option value="savings">Savings</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Routing Number *</label>
                            <input
                              type="text"
                              value={method.contributionDetails.bankAccount.routingNumber}
                              onChange={(e) => updateBankAccount(idx, 'routingNumber', e.target.value)}
                              placeholder="000000000"
                              className={errors[`bank-routing-${idx}`] ? 'input-error' : ''}
                            />
                            {errors[`bank-routing-${idx}`] && (
                              <span className="error-message">{errors[`bank-routing-${idx}`]}</span>
                            )}
                          </div>
                          <div className="form-group">
                            <label>Account Number *</label>
                            <input
                              type="password"
                              value={method.contributionDetails.bankAccount.accountNumber}
                              onChange={(e) => updateBankAccount(idx, 'accountNumber', e.target.value)}
                              className={errors[`bank-account-${idx}`] ? 'input-error' : ''}
                            />
                            {method.contributionDetails.bankAccount.accountNumber && (
                              <small>
                                Masked: {maskAccountNumber(method.contributionDetails.bankAccount.accountNumber)}
                              </small>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="funding-actions">
          <button
            type="button"
            onClick={() => addFundingMethod('transfer')}
            className="btn btn-secondary btn-sm"
          >
            + Add Transfer
          </button>
          <button
            type="button"
            onClick={() => addFundingMethod('rollover')}
            className="btn btn-secondary btn-sm"
          >
            + Add Rollover
          </button>
          <button
            type="button"
            onClick={() => addFundingMethod('new-contribution')}
            className="btn btn-secondary btn-sm"
          >
            + Add New Contribution
          </button>
        </div>

        <button type="submit" className="btn btn-primary">
          Continue to Next Step
        </button>
      </form>
    </div>
  );
}
