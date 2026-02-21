import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { BuildingService } from './building.service';
import { CreateBuildingDto, UpdateBuildingDto } from './dto/building.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@Controller('buildings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Post()
  @Roles(Role.INVESTOR)
  create(@Body() dto: CreateBuildingDto, @GetUser() user: any) {
    return this.buildingService.create(dto, user);
  }

  @Get()
  findAll() {
    return this.buildingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.buildingService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.INVESTOR)
  update(@Param('id') id: string, @Body() dto: UpdateBuildingDto, @GetUser() user: any) {
    return this.buildingService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.INVESTOR)
  delete(@Param('id') id: string, @GetUser() user: any) {
    return this.buildingService.delete(id, user);
  }
}