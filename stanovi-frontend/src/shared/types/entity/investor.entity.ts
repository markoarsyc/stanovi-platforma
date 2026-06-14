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
}