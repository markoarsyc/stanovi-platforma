import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query } from '@nestjs/common';
import { ApartmentService } from './apartment.service';
import { CreateApartmentDto, UpdateApartmentDto } from './dto/apartment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { ActiveUser } from '../auth/interfaces/active-user.interface';

@Controller('apartments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}

  @Post()
  @Roles(Role.INVESTOR)
  create(@Body() dto: CreateApartmentDto, @GetUser() user: ActiveUser) {
    return this.apartmentService.create(dto, user);
  }

  @Get()
  findAll(@Query('buildingId') buildingId?: string) {
    return this.apartmentService.findAll(buildingId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.apartmentService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.INVESTOR)
  update(@Param('id') id: string, @Body() dto: UpdateApartmentDto, @GetUser() user: ActiveUser) {
    return this.apartmentService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.INVESTOR)
  delete(@Param('id') id: string, @GetUser() user: ActiveUser) {
    return this.apartmentService.delete(id, user);
  }
}