import { useState, useEffect } from 'react';
import type { AgreementsData, AgreementData } from '@/types/registration';

interface Step9Props {
  data: Partial<AgreementsData>;
  documents: Array<{ name: string; url: string }>;
  onNext: (data: AgreementsData) => void;
}

function buildAgreementsFromDocuments(
  documents: Array<{ name: string; url: string }>,
  existingByDocName?: Record<string, AgreementData>
): AgreementData[] {
  if (documents.length === 0 && existingByDocName) {
    return Object.values(existingByDocName);
  }
  return documents.map((doc) => {
    const existing = existingByDocName?.[doc.name];
    return {
      documentName: doc.name,
      documentUrl: doc.url,
      accepted: existing?.accepted ?? false,
      acceptedAt: existing?.acceptedAt,
    };
  });
}

export function Step9AgreementsSig({ data, documents, onNext }: Step9Props) {
  const [agreements, setAgreements] = useState<AgreementData[]>(() => {
    const existing = data.agreements?.length ? data.agreements : [];
    const byName = existing.length ? Object.fromEntries(existing.map((a) => [a.documentName, a])) : undefined;
    return buildAgreementsFromDocuments(documents, byName);
  });
  const [eSignatureType, setESignatureType] = useState<'typed' | 'drawn'>(data.eSignatureType || 'typed');
  const [signatureName, setSignatureName] = useState(data.signatureName || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});

  // When documents load after mount (e.g. session restore), populate agreements so they are not empty
  useEffect(() => {
    if (documents.length === 0) return;
    setAgreements((prev) => {
      if (prev.length > 0) return prev; // already have list (e.g. from data or previous documents)
      const byName = data.agreements?.length
        ? Object.fromEntries((data.agreements as AgreementData[]).map((a) => [a.documentName, a]))
        : undefined;
      return buildAgreementsFromDocuments(documents, byName);
    });
  }, [documents.length]);

  const toggleDocumentView = (docName: string) => {
    setExpandedDocs((prev) => ({
      ...prev,
      [docName]: !prev[docName],
    }));
  };

  const handleAgreementAccept = (docName: string, accepted: boolean) => {
    setAgreements((prev) =>
      prev.map((a) =>
        a.documentName === docName
          ? { ...a, accepted, acceptedAt: accepted ? new Date().toISOString() : undefined }
          : a
      )
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const allAccepted = agreements.every((a) => a.accepted);
    if (!allAccepted) {
      newErrors.agreements = 'You must accept all documents to proceed';
    }

    if (!signatureName) {
      newErrors.signatureName = 'Signature name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext({
        agreements,
        eSignatureType,
        signatureName,
        signatureDate: new Date().toISOString().split('T')[0],
      });
    }
  };

  return (
    <div className="step-container">
      <h2>Agreements, Disclosures & E-Signature</h2>
      <p className="subtitle">
        Please review and accept all required documents. Your electronic signature indicates acceptance.
      </p>

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="documents-section">
          {agreements.map((agreement) => (
            <div key={agreement.documentName} className="document-panel">
              <div className="document-header">
                <div className="document-title">
                  <input
                    type="checkbox"
                    checked={agreement.accepted}
                    onChange={(e) => handleAgreementAccept(agreement.documentName, e.target.checked)}
                  />
                  <span>{agreement.documentName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDocumentView(agreement.documentName)}
                  className="btn-expand"
                >
                  {expandedDocs[agreement.documentName] ? '▼' : '▶'}
                </button>
              </div>

              {expandedDocs[agreement.documentName] && (
                <div className="document-content">
                  <div className="document-placeholder">
                    <p>Document: {agreement.documentName}</p>
                    <p>
                      <a href={agreement.documentUrl} target="_blank" rel="noopener noreferrer">
                        View Full Document (PDF)
                      </a>
                    </p>
                    <div className="document-preview">
                      {/* In a real app, load PDF or HTML content here */}
                      <p>
                        [Document content would be displayed here. In production, render PDF or fetch HTML from
                        documentUrl]
                      </p>
                    </div>
                  </div>

                  <div className="document-footer">
                    <label className="checkbox-agreement">
                      <input
                        type="checkbox"
                        checked={agreement.accepted}
                        onChange={(e) => handleAgreementAccept(agreement.documentName, e.target.checked)}
                      />
                      <span>I have read and agree to the {agreement.documentName}</span>
                    </label>
                  </div>
                </div>
              )}

              {agreement.accepted && (
                <div className="acceptance-badge">
                  <span className="badge-accepted">✓ Accepted</span>
                  {agreement.acceptedAt && (
                    <span className="acceptance-time">
                      {new Date(agreement.acceptedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {errors.agreements && <span className="error-message">{errors.agreements}</span>}

        <hr />

        <h3>Electronic Signature</h3>

        <div className="form-group">
          <label>Type of Signature</label>
          <div className="radio-group">
            <div className="radio-item">
              <input
                id="typed-sig"
                type="radio"
                value="typed"
                checked={eSignatureType === 'typed'}
                onChange={(e) => setESignatureType(e.target.value as any)}
              />
              <label htmlFor="typed-sig">Typed Signature</label>
            </div>
            <div className="radio-item">
              <input
                id="drawn-sig"
                type="radio"
                value="drawn"
                checked={eSignatureType === 'drawn'}
                onChange={(e) => setESignatureType(e.target.value as any)}
              />
              <label htmlFor="drawn-sig">Drawn Signature (on mobile/tablet)</label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="signatureName">Your Full Name (for signature) *</label>
          <input
            id="signatureName"
            type="text"
            value={signatureName}
            onChange={(e) => setSignatureName(e.target.value)}
            placeholder="John Doe"
            className={errors.signatureName ? 'input-error' : ''}
          />
          {errors.signatureName && <span className="error-message">{errors.signatureName}</span>}
        </div>

        <div className="signature-declaration">
          <p>
            <strong>Electronic Signature Acknowledgment</strong>
          </p>
          <p>
            By typing or drawing my name above and submitting this form, I certify that I am the person identified,
            and I consent to this electronic signature. This constitutes my legal signature, and I am responsible for
            all information provided.
          </p>
          <p>
            <strong>Date: {new Date().toLocaleDateString()}</strong>
          </p>
        </div>

        <button type="submit" className="btn btn-primary">
          Continue to Next Step
        </button>
      </form>
    </div>
  );
}
