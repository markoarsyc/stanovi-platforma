import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { BuildingService } from './building.service';
import { CreateBuildingDto, UpdateBuildingDto } from './dto/building.dto';
import { UpdateBuildingImageDto } from './dto/building-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role } from '@prisma/client';
import type { ActiveUser } from '../auth/interfaces/active-user.interface';

@Controller('buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(Role.INVESTOR)
  create(@Body() dto: CreateBuildingDto, @GetUser() user: ActiveUser) {
    return this.buildingService.create(dto, user);
  }

  @Get()
  findAll() {
    return this.buildingService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('investor/my-buildings')
  @Roles(Role.INVESTOR)
  getInvestorBuildings(@GetUser() user: ActiveUser) {
    return this.buildingService.getInvestorBuildings(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.buildingService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(Role.ADMIN, Role.INVESTOR)
  update(@Param('id') id: string, @Body() dto: UpdateBuildingDto, @GetUser() user: ActiveUser) {
    return this.buildingService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(Role.ADMIN, Role.INVESTOR)
  delete(@Param('id') id: string, @GetUser() user: ActiveUser) {
    return this.buildingService.delete(id, user);
  }

  // ============================================
  // Building Images Endpoints
  // ============================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/images')
  @Roles(Role.INVESTOR)
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @Param('id') buildingId: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: ActiveUser,
  ) {
    return this.buildingService.uploadBuildingImage(buildingId, file, user);
  }

  @Get(':id/images')
  getBuildingImages(@Param('id') buildingId: string) {
    return this.buildingService.getBuildingImages(buildingId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id/images/:imageId')
  @Roles(Role.ADMIN, Role.INVESTOR)
  deleteImage(
    @Param('id') buildingId: string,
    @Param('imageId') imageId: string,
    @GetUser() user: ActiveUser,
  ) {
    try {
      console.log(`[DELETE IMAGE] User ${user.id} (${user.role}) attempting to delete image ${imageId} from building ${buildingId}`);
      return this.buildingService.deleteBuildingImage(buildingId, imageId, user);
    } catch (error) {
      console.error(`[DELETE IMAGE ERROR] Building: ${buildingId}, Image: ${imageId}, User: ${user.id}`, error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/images/:imageId')
  @Roles(Role.INVESTOR)
  updateImage(
    @Param('id') buildingId: string,
    @Param('imageId') imageId: string,
    @Body() dto: UpdateBuildingImageDto,
    @GetUser() user: ActiveUser,
  ) {
    return this.buildingService.reorderBuildingImages(buildingId, [imageId], user);
  }
}