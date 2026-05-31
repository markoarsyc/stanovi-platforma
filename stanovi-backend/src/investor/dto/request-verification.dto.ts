import { IsString } from 'class-validator';

export class RequestVerificationDto {
  @IsString()
  companyName: string;

  @IsString()
  tin: string;
}
