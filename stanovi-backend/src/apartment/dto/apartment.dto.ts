import { IsString, IsNotEmpty, IsInt, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApartmentStatus } from '@prisma/client';

export class CreateApartmentDto {
  @IsString()
  @IsNotEmpty()
  buildingId: string;

  @IsString()
  @IsNotEmpty()
  aptNo: string;

  @IsInt()
  @Min(0)
  floor: number;

  @IsInt()
  @Min(1)
  rooms: number;

  @IsNumber()
  @Min(1)
  area: number;

  @IsNumber()
  @Min(1)
  price: number;

  @IsEnum(ApartmentStatus)
  @IsOptional()
  status?: ApartmentStatus;
}

export class UpdateApartmentDto {
  @IsString() @IsOptional()
  aptNo?: string;

  @IsInt() @IsOptional()
  floor?: number;

  @IsInt() @IsOptional()
  rooms?: number;

  @IsNumber() @IsOptional()
  area?: number;

  @IsNumber() @IsOptional()
  price?: number;

  @IsEnum(ApartmentStatus) @IsOptional()
  status?: ApartmentStatus;
}