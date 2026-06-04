import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInvestorDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsOptional()
  tin?: string;

  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @IsString()
  @IsNotEmpty()
  contactPhone: string;
}
