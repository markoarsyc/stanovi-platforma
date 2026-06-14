export interface Buyer {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  profilePhotoUrl?: string | null;
  profilePhotoPublicId?: string | null;
  createdAt: Date | string;
}