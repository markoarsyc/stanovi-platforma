export const ReservationStatus = {
  ACTIVE: "ACTIVE",
  CANCELLED: "CANCELLED",
} as const;

export type ReservationStatus =
  (typeof ReservationStatus)[keyof typeof ReservationStatus];
