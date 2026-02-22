import type { BuildingStatus } from "../enums/building-status.enum";

export interface Building {
  id: string;
  investorId: string;
  locationId: number;
  title: string;
  address: string;
  description?: string | null;
  dueDate: Date | string;
  status: BuildingStatus;
}