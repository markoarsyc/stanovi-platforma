import { IsString, IsNotEmpty } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  apartmentId: string;
}
