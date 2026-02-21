import type { RegistrationRequest, RegistrationResponse } from '@/types/registration';

const getApiUrl = () => {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:5000';
  const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, '');
  return normalizedBaseUrl.endsWith('/api') ? normalizedBaseUrl : `${normalizedBaseUrl}/api`;
};

const API_URL = getApiUrl();

/**
 * The "session id" from register/login is the registration progress id:
 * it identifies the user's draft so we can fetch progress and save step data
 * (where the user left off). It is not an auth session token.
 */
interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export class RegistrationClient {
  private static getSessionHeaders(registrationProgressId: string) {
    return {
      'Content-Type': 'application/json',
      'X-Session-Id': registrationProgressId,
    };
  }

  static async register(email: string, password: string): Promise<{ sessionId?: string; error?: string }> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const errorMessage = await this.getErrorMessage(response);
      return { error: errorMessage };
    }
    return response.json();
  }

  static async savePersonalInfo(sessionId: string, data: any): Promise<void> {
    const payload = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      citizenship: data.citizenship,
      ssn: data.ssn,
      phone: data.phone,
      street: data.street,
      city: data.city,
      state: data.state,
      zip: data.zip,
      country: data.country,
    };

    const response = await fetch(`${API_URL}/registration/personal-info`, {
      method: 'POST',
      headers: this.getSessionHeaders(sessionId),
      body: JSON.stringify(payload),
    });
    if (!response.ok) await this.throwApiError(response);
  }

  static async saveKYCIdentity(sessionId: string, data: any): Promise<void> {
    const response = await fetch(`${API_URL}/registration/kyc-identity`, {
      method: 'POST',
      headers: this.getSessionHeaders(sessionId),
      body: JSON.stringify(data),
    });
    if (!response.ok) await this.throwApiError(response);
  }

  static async saveEmploymentFinancial(sessionId: string, data: any): Promise<void> {
    const response = await fetch(`${API_URL}/registration/employment`, {
      method: 'POST',
      headers: this.getSessionHeaders(sessionId),
      body: JSON.stringify(data),
    });
    if (!response.ok) await this.throwApiError(response);
  }

  static async saveIRAType(sessionId: string, data: any): Promise<void> {
    const response = await fetch(`${API_URL}/registration/ira-type`, {
      method: 'POST',
      headers: this.getSessionHeaders(sessionId),
      body: JSON.stringify(data),
    });
    if (!response.ok) await this.throwApiError(response);
  }

  static async saveBeneficiaries(sessionId: string, data: any): Promise<void> {
    const response = await fetch(`${API_URL}/registration/beneficiaries`, {
      method: 'POST',
      headers: this.getSessionHeaders(sessionId),
      body: JSON.stringify(data),
    });
    if (!response.ok) await this.throwApiError(response);
  }

  static async saveFundingMethod(sessionId: string, data: any): Promise<void> {
    const response = await fetch(`${API_URL}/registration/funding`, {
      method: 'POST',
      headers: this.getSessionHeaders(sessionId),
      body: JSON.stringify(data),
    });
    if (!response.ok) await this.throwApiError(response);
  }

  static async saveInvestmentPreferences(sessionId: string, data: any): Promise<void> {
    const response = await fetch(`${API_URL}/registration/investments`, {
      method: 'POST',
      headers: this.getSessionHeaders(sessionId),
      body: JSON.stringify(data),
    });
    if (!response.ok) await this.throwApiError(response);
  }

  static async saveAgreements(sessionId: string, data: any): Promise<void> {
    const response = await fetch(`${API_URL}/registration/agreements`, {
      method: 'POST',
      headers: this.getSessionHeaders(sessionId),
      body: JSON.stringify(data),
    });
    if (!response.ok) await this.throwApiError(response);
  }

  static async submitFinalRegistration(sessionId: string, data: any): Promise<RegistrationResponse> {
    const response = await fetch(`${API_URL}/registration/security-2fa`, {
      method: 'POST',
      headers: this.getSessionHeaders(sessionId),
      body: JSON.stringify(data),
    });
    if (!response.ok) await this.throwApiError(response);
    return response.json();
  }

  static async fetchDocuments(sessionId: string): Promise<Array<{ name: string; url: string }>> {
    const response = await fetch(`${API_URL}/registration/documents`, {
      headers: { 'X-Session-Id': sessionId },
    });
    if (!response.ok) await this.throwApiError(response);
    return response.json();
  }

  static async fetchProgress(sessionId: string): Promise<any> {
    const response = await fetch(`${API_URL}/registration/progress`, {
      headers: { 'X-Session-Id': sessionId },
    });
    if (!response.ok) await this.throwApiError(response);
    return response.json();
  }

  private static async throwApiError(response: Response): Promise<never> {
    const errorMessage = await this.getErrorMessage(response);
    throw new Error(errorMessage);
  }

  private static async getErrorMessage(response: Response): Promise<string> {
    try {
      const errorData = await response.json() as ApiError;
      const validationMessage = errorData.errors
        ? Object.values(errorData.errors).flat().join(' ')
        : undefined;

      return validationMessage || errorData.message || `API Error: ${response.status} ${response.statusText}`;
    } catch {
      return `API Error: ${response.status} ${response.statusText}`;
    }
  }
}
