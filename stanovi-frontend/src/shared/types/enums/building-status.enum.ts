export const BuildingStatus = {
  PLANNED: "PLANNED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

export type BuildingStatus = (typeof BuildingStatus)[keyof typeof BuildingStatus];