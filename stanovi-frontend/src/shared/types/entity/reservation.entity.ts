import type { ApartmentDetail } from "../building-detail.types";
import type { ReservationStatus } from "../enums/reservation-status.enum";

export interface ReservationBuyer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface ReservationApartment extends ApartmentDetail {
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
