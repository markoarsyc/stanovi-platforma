export const ApartmentStatus = {
  AVAILABLE: "AVAILABLE",
  RESERVED: "RESERVED",
} as const;

export type ApartmentStatus = (typeof ApartmentStatus)[keyof typeof ApartmentStatus];
