export type BuildingStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
export type ApartmentStatus = 'AVAILABLE' | 'RESERVED';

export interface Location {
  id: number;
  name: string;
}

export interface BuildingImage {
  id: string;
  imageUrl: string;
  displayOrder: number;
}

export interface ApartmentImage {
  id: string;
  imageUrl: string;
  displayOrder: number;
}

export interface Apartment {
  id: string;
  aptNo: string;
  floor: number;
  rooms: number;
  // area/price may serialize as strings from the backend (Prisma Decimal).
  area: number | string;
  price: number | string;
  status: ApartmentStatus;
  images: ApartmentImage[];
}

export interface Building {
  id: string;
  title: string;
  address: string;
  description?: string | null;
  dueDate: string;
  status: BuildingStatus;
  latitude: number | null;
  longitude: number | null;
  location: Location;
  images: BuildingImage[];
  _count: { apartments: number };
}

export interface Investor {
  companyName: string;
  contactEmail: string | null;
  contactPhone?: string | null;
  isVerified?: boolean;
  profilePhotoUrl?: string | null;
}

export interface BuyerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  profilePhotoUrl?: string | null;
  createdAt: string;
}

export interface InvestorProfile {
  id: string;
  userId: string;
  companyName: string;
  tin: string | null;
  contactEmail: string;
  contactPhone: string;
  isVerified: boolean;
  profilePhotoUrl?: string | null;
  createdAt: string;
}

export interface InvestorBuilding extends Omit<Building, '_count'> {
  locationId: number;
  apartments: Apartment[];
}

export interface BuildingDetail {
  id: string;
  title: string;
  address: string;
  description?: string | null;
  dueDate: string;
  status: BuildingStatus;
  location: Location;
  images: BuildingImage[];
  apartments: Apartment[];
  investor: Investor;
}
