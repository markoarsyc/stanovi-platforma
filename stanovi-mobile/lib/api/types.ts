export type BuildingStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
export type ApartmentStatus = 'AVAILABLE' | 'RESERVED';
export type ReservationStatus = 'ACTIVE' | 'CANCELLED';

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

export interface ApartmentModel {
  id: string;
  apartmentId: string;
  modelUrl: string;
  publicId: string;
  fileSize: number | null;
  createdAt: string;
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
  model?: ApartmentModel | null;
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

export interface ReservationBuyer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface ReservationApartment extends Apartment {
  building?: {
    id: string;
    title: string;
    address: string;
  };
}

export interface Reservation {
  id: string;
  apartmentId: string;
  buyerId: string;
  status: ReservationStatus;
  createdAt: string;
  cancelledAt?: string | null;
  canceledBy?: string | null;
  apartment?: ReservationApartment;
  buyer?: ReservationBuyer;
}
