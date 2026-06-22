import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { ActiveUser } from '../auth/interfaces/active-user.interface';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @Roles(Role.BUYER)
  create(@Body() dto: CreateReservationDto, @GetUser() user: ActiveUser) {
    return this.reservationService.create(dto, user);
  }

  @Get('me')
  @Roles(Role.BUYER)
  findMine(@GetUser() user: ActiveUser) {
    return this.reservationService.findMine(user);
  }

  @Get()
  @Roles(Role.INVESTOR)
  findForBuilding(
    @Query('buildingId') buildingId: string,
    @GetUser() user: ActiveUser,
  ) {
    return this.reservationService.findForBuilding(buildingId, user);
  }

  @Patch(':id/cancel')
  @Roles(Role.BUYER, Role.INVESTOR)
  cancel(@Param('id') id: string, @GetUser() user: ActiveUser) {
    return this.reservationService.cancel(id, user);
  }
}
