/**
 * Dashboard menu configuration: one item per registration section.
 */

export interface DashboardNavItem {
  href: string;
  label: string;
  description?: string;
}

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Overview', description: 'Application status and quick links' },
  { href: '/dashboard/personal-info', label: 'Personal & Address', description: 'Name, DOB, contact, address' },
  { href: '/dashboard/kyc', label: 'Identity (KYC)', description: 'Government ID and verification' },
  { href: '/dashboard/employment', label: 'Employment & Financial', description: 'Employment and income' },
  { href: '/dashboard/ira-type', label: 'IRA Type', description: 'IRA type and purpose' },
  { href: '/dashboard/beneficiaries', label: 'Beneficiaries', description: 'Primary and contingent' },
  { href: '/dashboard/funding', label: 'Funding Method', description: 'Transfer, rollover, or contribution' },
  { href: '/dashboard/investments', label: 'Investments & Risk', description: 'Asset types and acknowledgments' },
  { href: '/dashboard/agreements', label: 'Agreements & Signature', description: 'Documents and e-signature' },
  { href: '/dashboard/security', label: 'Security & 2FA', description: 'Two-factor authentication' },
];
