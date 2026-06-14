export type BuildingStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
export type ApartmentStatus = 'AVAILABLE' | 'RESERVED';

export interface ApartmentDetail {
  id: string;
  aptNo: string;
  floor: number;
  rooms: number;
  area: number;
  price: number;
  status: ApartmentStatus;
  buildingId: string;
  createdAt?: string;
  images?: ApartmentImage[];
}

export interface LocationInfo {
  id: number;
  name: string;
}

export interface InvestorInfo {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  isVerified: boolean;
  profilePhotoUrl?: string | null;
}

export interface BuildingImage {
  id: string;
  buildingId: string;
  imageUrl: string;
  publicId: string;
  displayOrder: number;
  createdAt: string;
}

export interface ApartmentImage {
  id: string;
  apartmentId: string;
  imageUrl: string;
  publicId: string;
  displayOrder: number;
  createdAt: string;
}

export interface BuildingDetail {
  id: string;
  title: string;
  address: string;
  description?: string;
  image_url?: string | null;
  dueDate: string | Date;
  status: BuildingStatus;
  createdAt?: string;
  updatedAt?: string;
  location?: LocationInfo;
  apartments?: ApartmentDetail[];
  images?: BuildingImage[];
  investorId?: string;
  investor?: InvestorInfo;
}

