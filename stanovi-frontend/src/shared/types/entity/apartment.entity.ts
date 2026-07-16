import type { ApartmentStatus } from "../enums/apartment-status.enum";
import type { ApartmentImage, ApartmentModel } from "../building-detail.types";

export interface Apartment {
  id: string;
  buildingId: string;
  aptNo: string;
  floor: number;
  rooms: number;
  area: number;
  price: number;
  status: ApartmentStatus;
  images?: ApartmentImage[];
  model?: ApartmentModel | null;
}