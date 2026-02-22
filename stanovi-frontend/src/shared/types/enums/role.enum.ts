export const Role = {
  BUYER: "BUYER",
  INVESTOR: "INVESTOR",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof Role)[keyof typeof Role];