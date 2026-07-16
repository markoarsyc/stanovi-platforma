import { IsOptional, IsInt, Min } from 'class-validator';

export class CreateBuildingImageDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class UpdateBuildingImageDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class BuildingImageResponseDto {
  id: string;
  buildingId: string;
  imageUrl: string;
  publicId: string;
  displayOrder: number;
  isCover: boolean;
  createdAt: Date;
}
