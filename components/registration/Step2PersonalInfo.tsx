import { useEffect, useState } from 'react';
import type { PersonalInfoData, AddressData } from '@/types/registration';
import { Validators, maskSSN, formatSSN, formatPhone } from '@/lib/utils/validation';

interface Step2Props {
  personalData: Partial<PersonalInfoData>;
  addressData: Partial<AddressData>;
  onNext: (personal: PersonalInfoData, address: AddressData) => void;
  /** Optional label for submit button (e.g. "Save changes" in dashboard). */
  submitLabel?: string;
}

export function Step2PersonalInfo({ personalData, addressData, onNext, submitLabel }: Step2Props) {
  const [firstName, setFirstName] = useState(personalData.firstName || '');
  const [middleName, setMiddleName] = useState(personalData.middleName || '');
  const [lastName, setLastName] = useState(personalData.lastName || '');
  const [dateOfBirth, setDateOfBirth] = useState(personalData.dateOfBirth || '');
  const [citizenship, setCitizenship] = useState(personalData.citizenship || 'us-citizen');
  const [ssn, setSSN] = useState(personalData.ssn || '');
  const [phone, setPhone] = useState(personalData.phone || '');

  const [street, setStreet] = useState(addressData.street || '');
  const [city, setCity] = useState(addressData.city || '');
  const [state, setState] = useState(addressData.state || '');
  const [zip, setZip] = useState(addressData.zip || '');
  const [country, setCountry] = useState(addressData.country || 'US');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFirstName(personalData.firstName || '');
    setMiddleName(personalData.middleName || '');
    setLastName(personalData.lastName || '');
    setDateOfBirth(personalData.dateOfBirth || '');
    setCitizenship(personalData.citizenship || 'us-citizen');
    setSSN(personalData.ssn || '');
    setPhone(personalData.phone || '');

    setStreet(addressData.street || '');
    setCity(addressData.city || '');
    setState(addressData.state || '');
    setZip(addressData.zip || '');
    setCountry(addressData.country || 'US');
  }, [personalData, addressData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName) newErrors.firstName = 'First name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    if (!dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    else {
      const dobValidation = Validators.dateOfBirth(dateOfBirth);
      if (!dobValidation.valid) newErrors.dateOfBirth = dobValidation.message || 'Invalid date';
    }

    if (!ssn) newErrors.ssn = 'SSN is required';
    else if (!Validators.ssn(ssn)) newErrors.ssn = 'Invalid SSN format (###-##-####)';

    if (!phone) newErrors.phone = 'Phone is required';
    else if (!Validators.phone(phone)) newErrors.phone = 'Invalid phone format (###-###-####)';

    if (!street) newErrors.street = 'Address is required';
    else {
      const addressValidation = Validators.address(street);
      if (!addressValidation.valid) newErrors.street = addressValidation.message || 'Invalid address';
    }
    if (!city) newErrors.city = 'City is required';
    if (!state) newErrors.state = 'State is required';
    if (!zip) newErrors.zip = 'ZIP code is required';
    else if (!Validators.zip(zip)) newErrors.zip = 'Invalid ZIP format';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext(
        { firstName, middleName, lastName, dateOfBirth, citizenship, ssn, phone },
        { street, city, state, zip, country }
      );
    }
  };

  return (
    <div className="step-container">
      <h2>Personal & Identity Information</h2>
      <p className="subtitle">We'll use this information for identity verification and account setup.</p>

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={errors.firstName ? 'input-error' : ''}
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="middleName">Middle Name</label>
            <input
              id="middleName"
              type="text"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={errors.lastName ? 'input-error' : ''}
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth *</label>
            <input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className={errors.dateOfBirth ? 'input-error' : ''}
            />
            {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="citizenship">Citizenship Status *</label>
            <select
              id="citizenship"
              value={citizenship}
              onChange={(e) => setCitizenship(e.target.value as any)}
            >
              <option value="us-citizen">U.S. Citizen</option>
              <option value="resident-alien">Resident Alien</option>
              <option value="non-resident">Non-Resident</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ssn">Social Security Number *</label>
            <input
              id="ssn"
              type="password"
              value={ssn}
              onChange={(e) => setSSN(formatSSN(e.target.value))}
              placeholder="###-##-####"
              className={errors.ssn ? 'input-error' : ''}
            />
            {ssn && <div className="masked">Masked: {maskSSN(ssn)}</div>}
            {errors.ssn && <span className="error-message">{errors.ssn}</span>}
            <small>Your SSN is encrypted and never shared. We keep your information secure.</small>
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="###-###-####"
              className={errors.phone ? 'input-error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
            <small>Mobile phones preferred for 2FA verification</small>
          </div>
        </div>

        <hr />
        <h3>Residential Address</h3>

        <div className="form-group">
          <label htmlFor="street">Street Address *</label>
          <input
            id="street"
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="123 Main Street"
            className={errors.street ? 'input-error' : ''}
          />
          {errors.street && <span className="error-message">{errors.street}</span>}
          <small>No P.O. boxes allowed</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={errors.city ? 'input-error' : ''}
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="state">State *</label>
            <input
              id="state"
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="CA"
              className={errors.state ? 'input-error' : ''}
            />
            {errors.state && <span className="error-message">{errors.state}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="zip">ZIP Code *</label>
            <input
              id="zip"
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/[^\d-]/g, ''))}
              placeholder="12345"
              className={errors.zip ? 'input-error' : ''}
            />
            {errors.zip && <span className="error-message">{errors.zip}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="country">Country *</label>
          <input
            id="country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          {submitLabel ?? 'Continue to Next Step'}
        </button>
      </form>
    </div>
  );
}
