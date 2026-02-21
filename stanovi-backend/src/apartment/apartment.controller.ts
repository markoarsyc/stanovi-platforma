import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query } from '@nestjs/common';
import { ApartmentService } from './apartment.service';
import { CreateApartmentDto, UpdateApartmentDto } from './dto/apartment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('apartments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}

  @Post()
  @Roles(Role.ADMIN, Role.INVESTOR)
  create(@Body() dto: CreateApartmentDto) {
    return this.apartmentService.create(dto);
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
  update(@Param('id') id: string, @Body() dto: UpdateApartmentDto) {
    return this.apartmentService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.INVESTOR)
  remove(@Param('id') id: string) {
    return this.apartmentService.delete(id);
  }
}