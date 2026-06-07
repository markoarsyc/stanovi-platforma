import { IsNotEmpty, IsString } from 'class-validator';

export class RequestVerificationDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  tin: string;
}
