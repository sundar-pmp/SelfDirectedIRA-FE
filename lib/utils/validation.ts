/**
 * Validation utilities for registration form fields.
 */

export const Validators = {
  email: (value: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  },

  password: (value: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (value.length < 8) errors.push('Minimum 8 characters');
    if (!/[A-Z]/.test(value)) errors.push('At least one uppercase letter');
    if (!/[a-z]/.test(value)) errors.push('At least one lowercase letter');
    if (!/\d/.test(value)) errors.push('At least one number');
    if (!/[!@#$%^&*]/.test(value)) errors.push('At least one special character (!@#$%^&*)');
    return { valid: errors.length === 0, errors };
  },

  ssn: (value: string): boolean => {
    // Basic SSN format: ###-##-####
    const re = /^\d{3}-\d{2}-\d{4}$/;
    return re.test(value);
  },

  phone: (value: string): boolean => {
    // Basic US phone format
    const re = /^\d{3}-\d{3}-\d{4}$/;
    return re.test(value);
  },

  zip: (value: string): boolean => {
    const re = /^\d{5}(-\d{4})?$/;
    return re.test(value);
  },

  dateOfBirth: (value: string): { valid: boolean; message?: string } => {
    const dob = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18) {
      return { valid: false, message: 'Must be at least 18 years old' };
    }
    return { valid: true };
  },

  address: (value: string): { valid: boolean; message?: string } => {
    if (value.toUpperCase().includes('P.O.') || value.toUpperCase().includes('PO BOX')) {
      return { valid: false, message: 'P.O. boxes are not allowed' };
    }
    return { valid: true };
  },

  beneficiaryPercentages: (beneficiaries: any[]): { valid: boolean; message?: string } => {
    const total = beneficiaries.reduce((sum, b) => sum + (b.allocationPercentage || 0), 0);
    if (total !== 100) {
      return { valid: false, message: `Percentages must total 100% (current: ${total}%)` };
    }
    return { valid: true };
  },

  routingNumber: (value: string): boolean => {
    // US routing number is 9 digits
    return /^\d{9}$/.test(value);
  },

  accountNumber: (value: string): boolean => {
    // Basic check: 5-17 digits
    return /^\d{5,17}$/.test(value);
  },
};

export const maskSSN = (ssn: string): string => {
  return ssn.replace(/\d(?=\d{4})/g, '*');
};

export const maskAccountNumber = (account: string): string => {
  if (account.length <= 4) return account;
  return '*'.repeat(account.length - 4) + account.slice(-4);
};

/**
 * Format SSN to ###-##-#### format
 * Accepts any input and extracts digits only
 */
export const formatSSN = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
};

/**
 * Format phone to ###-###-#### format
 * Accepts any input and extracts digits only
 */
export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};
