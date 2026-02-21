import { useState } from 'react';
import type { KYCIdentityData } from '@/types/registration';

interface Step3Props {
  data: Partial<KYCIdentityData>;
  onNext: (data: KYCIdentityData) => void;
}

export function Step3KYCIdentity({ data, onNext }: Step3Props) {
  const [idType, setIdType] = useState<'driver-license' | 'passport' | 'state-id'>(
    data.governmentIdType || 'driver-license'
  );
  const [idNumber, setIdNumber] = useState(data.idNumber || '');
  const [issuingState, setIssuingState] = useState(data.issuingState || '');
  const [expirationDate, setExpirationDate] = useState(data.expirationDate || '');
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [proofOfAddressFile, setProofOfAddressFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({
    idFront: data.idFrontImageUrl || '',
    idBack: data.idBackImageUrl || '',
    proofOfAddress: data.proofOfAddressUrl || '',
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!idNumber) newErrors.idNumber = 'ID number is required';
    if (!issuingState) newErrors.issuingState = 'Issuing state/country is required';
    if (!expirationDate) newErrors.expirationDate = 'Expiration date is required';
    if (!uploadedFiles.idFront && !idFrontFile) newErrors.idFront = 'Front ID image required';
    if (!uploadedFiles.idBack && !idBackFile) newErrors.idBack = 'Back ID image required';
    if (!uploadedFiles.proofOfAddress && !proofOfAddressFile)
      newErrors.proofOfAddress = 'Proof of address required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: 'Only JPG, PNG, or PDF files allowed',
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: 'File size must be less than 5MB',
        }));
        return;
      }

      if (fieldName === 'idFront') setIdFrontFile(file);
      if (fieldName === 'idBack') setIdBackFile(file);
      if (fieldName === 'proofOfAddress') setProofOfAddressFile(file);

      // In a real app, upload to storage service and get URL
      setUploadedFiles((prev) => ({
        ...prev,
        [fieldName]: file.name,
      }));
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({
        governmentIdType: idType,
        idNumber,
        issuingState,
        expirationDate,
        idFrontImageUrl: uploadedFiles.idFront,
        idBackImageUrl: uploadedFiles.idBack,
        proofOfAddressUrl: uploadedFiles.proofOfAddress,
      });
    }
  };

  return (
    <div className="step-container">
      <h2>Identity Verification (KYC/AML)</h2>
      <p className="subtitle">
        We need to verify your identity with a government-issued ID and proof of address.
      </p>

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="idType">Government ID Type *</label>
            <select id="idType" value={idType} onChange={(e) => setIdType(e.target.value as any)}>
              <option value="driver-license">Driver's License</option>
              <option value="passport">Passport</option>
              <option value="state-id">State ID</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="idNumber">ID Number *</label>
            <input
              id="idNumber"
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className={errors.idNumber ? 'input-error' : ''}
            />
            {errors.idNumber && <span className="error-message">{errors.idNumber}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="issuingState">Issuing State/Country *</label>
            <input
              id="issuingState"
              type="text"
              value={issuingState}
              onChange={(e) => setIssuingState(e.target.value)}
              placeholder="CA"
              className={errors.issuingState ? 'input-error' : ''}
            />
            {errors.issuingState && <span className="error-message">{errors.issuingState}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="expirationDate">Expiration Date *</label>
            <input
              id="expirationDate"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className={errors.expirationDate ? 'input-error' : ''}
            />
            {errors.expirationDate && <span className="error-message">{errors.expirationDate}</span>}
          </div>
        </div>

        <hr />
        <h3>Document Uploads</h3>

        <div className="file-upload-group">
          <label>ID Front Image *</label>
          <div className="file-input-wrapper">
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(e) => handleFileUpload(e, 'idFront')}
              className={errors.idFront ? 'input-error' : ''}
            />
            {uploadedFiles.idFront && <span className="file-uploaded">✓ {uploadedFiles.idFront}</span>}
          </div>
          {errors.idFront && <span className="error-message">{errors.idFront}</span>}
          <small>JPG, PNG, or PDF. Max 5MB. Show full front of ID with photo visible.</small>
        </div>

        <div className="file-upload-group">
          <label>ID Back Image *</label>
          <div className="file-input-wrapper">
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(e) => handleFileUpload(e, 'idBack')}
              className={errors.idBack ? 'input-error' : ''}
            />
            {uploadedFiles.idBack && <span className="file-uploaded">✓ {uploadedFiles.idBack}</span>}
          </div>
          {errors.idBack && <span className="error-message">{errors.idBack}</span>}
          <small>JPG, PNG, or PDF. Max 5MB. Show full back of ID.</small>
        </div>

        <div className="file-upload-group">
          <label>Proof of Address *</label>
          <div className="file-input-wrapper">
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(e) => handleFileUpload(e, 'proofOfAddress')}
              className={errors.proofOfAddress ? 'input-error' : ''}
            />
            {uploadedFiles.proofOfAddress && (
              <span className="file-uploaded">✓ {uploadedFiles.proofOfAddress}</span>
            )}
          </div>
          {errors.proofOfAddress && <span className="error-message">{errors.proofOfAddress}</span>}
          <small>Utility bill, bank statement, or lease agreement. Max 5MB.</small>
        </div>

        <button type="submit" className="btn btn-primary">
          Continue to Next Step
        </button>
      </form>
    </div>
  );
}
