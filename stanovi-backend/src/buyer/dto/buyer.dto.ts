import { IsNotEmpty, IsString, IsUUID, IsPhoneNumber } from 'class-validator';

export class CreateBuyerDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string; 
}

export class UpdateBuyerDto {
  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsString()
  phone?: string;
}