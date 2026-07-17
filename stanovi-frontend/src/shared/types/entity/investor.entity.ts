import type { VerificationStatus } from '@/shared/constants/statusConfig';

export interface VerificationRequest {
  id: string;
  investorId: string;
  companyName: string;
  tin: string;
  status: VerificationStatus;
  createdAt: string;
}

export interface Investor {
  id: string;
  userId: string;
  companyName: string;
  tin?: string | null;
  contactEmail: string;
  contactPhone: string;
  isVerified: boolean;
  profilePhotoUrl?: string | null;
  profilePhotoPublicId?: string | null;
  /** Only the most recent request is returned by the API. */
  verificationRequests?: VerificationRequest[];
}