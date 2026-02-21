/**
 * Registration workflow types and interfaces.
 * Shared between frontend and API (must align with C# DTOs).
 */

export interface RegistrationSession {
  sessionId: string;
  currentStep: number;
  email: string;
  createdAt: string;
  lastSavedAt: string;
  isComplete: boolean;
}

// Step 1: Account Creation
export interface AccountCreationData {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

// Step 2: Personal Information
export interface PersonalInfoData {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string; // ISO 8601
  citizenship: 'us-citizen' | 'resident-alien' | 'non-resident';
  ssn: string; // masked in logs
  phone: string;
}

// Step 3: Residential Address
export interface AddressData {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

// Step 3: KYC/AML Identity Verification
export interface KYCIdentityData {
  governmentIdType: 'driver-license' | 'passport' | 'state-id';
  idNumber: string;
  issuingState: string;
  expirationDate: string; // ISO 8601
  idFrontImageUrl?: string; // Uploaded file reference
  idBackImageUrl?: string;
  proofOfAddressUrl?: string;
  identityQuizAnswers?: Record<string, string>; // Out-of-wallet responses
}

// Step 4: Employment & Financial Profile
export interface EmploymentFinancialData {
  employmentStatus: 'employed' | 'self-employed' | 'unemployed' | 'retired' | 'student' | 'homemaker';
  employerName?: string;
  employerAddress?: string;
  occupation?: string;
  annualIncomeRange: 'under-50k' | '50k-100k' | '100k-250k' | '250k-500k' | 'over-500k';
  netWorthRange: 'under-100k' | '100k-500k' | '500k-1m' | 'over-1m';
  sourceOfFunds: string[]; // ['salary', 'business', 'investments', 'inheritance', 'retirement-plan', 'other']
  investmentExperience?: 'none' | 'limited' | 'moderate' | 'extensive';
}

// Step 5: IRA Type Selection
export interface IRATypeData {
  iraType: 'traditional' | 'roth' | 'sep' | 'simple' | 'inherited';
  purpose: string;
  conditionalQuestions?: {
    // For SEP/SIMPLE
    isEmployer?: boolean;
    businessDetails?: string;
    // For Inherited
    decedentName?: string;
    relationship?: string;
    dateOfDeath?: string;
  };
}

// Step 6: Beneficiary
export interface Beneficiary {
  id?: string;
  fullName: string;
  relationship: string;
  dateOfBirth: string; // ISO 8601
  ssn: string;
  type: 'primary' | 'contingent';
  allocationPercentage: number;
}

export interface BeneficiariesData {
  primaryBeneficiaries: Beneficiary[];
  contingentBeneficiaries: Beneficiary[];
}

// Step 7: Funding Method
export interface FundingMethodData {
  methods: FundingMethod[];
}

export interface FundingMethod {
  type: 'transfer' | 'rollover' | 'new-contribution';
  transferDetails?: {
    currentCustodian: string;
    accountType: 'traditional' | 'roth' | 'sep' | 'simple';
    accountNumber: string;
    estimatedAmount: number;
    statementFileUrl?: string;
  };
  rolloverDetails?: {
    planType: '401k' | '403b' | '457' | 'other';
    employerName: string;
    planAdminContact: string;
    estimatedAmount: number;
  };
  contributionDetails?: {
    amount: number;
    taxYear: number;
    fundingSource: 'bank-transfer' | 'check' | 'wire';
    bankAccount?: {
      accountHolderName: string;
      routingNumber: string;
      accountNumber: string;
      accountType: 'checking' | 'savings';
    };
  };
}

// Step 8: Investment Preferences
export interface InvestmentPreferencesData {
  assetTypes: string[]; // ['real-estate', 'private-equity', 'crypto', 'precious-metals', 'notes-lending', 'other']
  assetDetails?: Record<
    string,
    {
      experienceLevel?: 'none' | 'limited' | 'moderate' | 'extensive';
      plannedAllocation?: number;
    }
  >;
  riskAcknowledgments: {
    understandsNonTraditionalRisks: boolean;
    acceptsResponsibilityForDecisions: boolean;
  };
}

// Step 9: Agreements & Disclosures
export interface AgreementData {
  documentName: string;
  documentUrl: string;
  accepted: boolean;
  acceptedAt?: string;
}

export interface AgreementsData {
  agreements: AgreementData[];
  eSignatureType: 'typed' | 'drawn';
  signatureName: string;
  signatureDate: string; // ISO 8601
  signatureImage?: string; // For drawn signatures
}

// Step 10: Security Setup
export interface SecuritySetupData {
  twoFAMethod: 'sms' | 'authenticator' | 'email';
  phoneNumberVerified?: boolean;
  authenticatorSecret?: string;
  securityQuestions?: Record<string, string>;
}

// Complete Registration Request (sent to API)
export interface RegistrationRequest {
  accountCreation: AccountCreationData;
  personalInfo: PersonalInfoData;
  address: AddressData;
  kycIdentity: KYCIdentityData;
  employmentFinancial: EmploymentFinancialData;
  iraType: IRATypeData;
  beneficiaries: BeneficiariesData;
  fundingMethod: FundingMethodData;
  investmentPreferences: InvestmentPreferencesData;
  agreements: AgreementsData;
  securitySetup: SecuritySetupData;
}

// Registration Response (from API)
export interface RegistrationResponse {
  success: boolean;
  message: string;
  applicationId?: string;
  nextSteps?: string;
  reviewTimeline?: string;
  fundingTimeline?: string;
  contactInfo?: {
    email: string;
    phone: string;
  };
}
