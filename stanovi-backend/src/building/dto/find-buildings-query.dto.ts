import { IsOptional, IsString, IsEnum, IsInt, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { BuildingStatus } from '@prisma/client';

export class FindBuildingsQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  locationId?: number;

  @IsEnum(BuildingStatus)
  @IsOptional()
  status?: BuildingStatus;

  @IsIn(['newest', 'oldest'])
  @IsOptional()
  sort?: 'newest' | 'oldest';
}
