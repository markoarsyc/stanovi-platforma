import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { BuildingStatus } from '@prisma/client';

export class CreateBuildingDto {
  @IsInt()
  @IsNotEmpty()
  locationId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  address: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate: Date;

  @IsEnum(BuildingStatus)
  status: BuildingStatus;
}

export class UpdateBuildingDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  address?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @IsEnum(BuildingStatus)
  @IsOptional()
  status?: BuildingStatus;

  @IsInt()
  @IsOptional()
  locationId?: number;
}
