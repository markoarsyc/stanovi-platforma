export interface Investor {
  id: string;
  userId: string;
  companyName: string;
  tin?: string | null;
  contactEmail: string;
  contactPhone: string;
  isVerified: boolean;
}