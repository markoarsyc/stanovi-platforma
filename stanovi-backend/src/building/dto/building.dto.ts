import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsDateString } from 'class-validator';
import { BuildingStatus } from '@prisma/client';

export class CreateBuildingDto {
  @IsString()
  @IsNotEmpty()
  investorId: string;

  @IsInt()
  @IsNotEmpty()
  locationId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
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
  @IsString() @IsOptional()
  title?: string;

  @IsString() @IsOptional()
  address?: string;

  @IsString() @IsOptional()
  description?: string;

  @IsDateString() @IsOptional()
  dueDate?: Date;

  @IsEnum(BuildingStatus) @IsOptional()
  status?: BuildingStatus;

  @IsInt() @IsOptional()
  locationId?: number;
}