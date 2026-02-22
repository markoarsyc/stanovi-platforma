import type { ApartmentStatus } from "../enums/apartment-status.enum";

export interface Apartment {
  id: string;
  buildingId: string;
  aptNo: string;
  floor: number;
  rooms: number;
  area: number;
  price: number;
  status: ApartmentStatus;
}