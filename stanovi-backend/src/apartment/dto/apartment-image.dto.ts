import { IsOptional, IsInt, Min } from 'class-validator';

export class CreateApartmentImageDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class UpdateApartmentImageDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class ApartmentImageResponseDto {
  id: string;
  apartmentId: string;
  imageUrl: string;
  publicId: string;
  displayOrder: number;
  createdAt: Date;
}
