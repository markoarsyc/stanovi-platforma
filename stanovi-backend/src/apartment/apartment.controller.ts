import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { ApartmentService } from './apartment.service';
import { CreateApartmentDto, UpdateApartmentDto } from './dto/apartment.dto';
import { UpdateApartmentImageDto } from './dto/apartment-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { ActiveUser } from '../auth/interfaces/active-user.interface';

@Controller('apartments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApartmentController {
  private readonly logger = new Logger(ApartmentController.name);

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
  @Roles(Role.INVESTOR)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateApartmentDto,
    @GetUser() user: ActiveUser,
  ) {
    return this.apartmentService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.INVESTOR)
  delete(@Param('id') id: string, @GetUser() user: ActiveUser) {
    return this.apartmentService.delete(id, user);
  }

  // ============================================
  // Apartment Images Endpoints
  // ============================================

  @Post(':id/images')
  @Roles(Role.INVESTOR)
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @Param('id') apartmentId: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: ActiveUser,
  ) {
    try {
      this.logger.log(
        `[UPLOAD APARTMENT IMAGE] User ${user.id} (${user.role}) uploading image for apartment ${apartmentId}`,
      );
      return this.apartmentService.uploadApartmentImage(
        apartmentId,
        file,
        user,
      );
    } catch (error) {
      this.logger.error(
        `[UPLOAD APARTMENT IMAGE ERROR] Apartment: ${apartmentId}, User: ${user.id}`,
        error,
      );
      throw error;
    }
  }

  @Get(':id/images')
  getApartmentImages(@Param('id') apartmentId: string) {
    return this.apartmentService.getApartmentImages(apartmentId);
  }

  @Delete(':id/images/:imageId')
  @Roles(Role.INVESTOR)
  deleteImage(
    @Param('id') apartmentId: string,
    @Param('imageId') imageId: string,
    @GetUser() user: ActiveUser,
  ) {
    try {
      this.logger.log(
        `[DELETE APARTMENT IMAGE] User ${user.id} (${user.role}) attempting to delete image ${imageId} from apartment ${apartmentId}`,
      );
      return this.apartmentService.deleteApartmentImage(
        apartmentId,
        imageId,
        user,
      );
    } catch (error) {
      this.logger.error(
        `[DELETE APARTMENT IMAGE ERROR] Apartment: ${apartmentId}, Image: ${imageId}, User: ${user.id}`,
        error,
      );
      throw error;
    }
  }

  @Patch(':id/images/:imageId')
  @Roles(Role.INVESTOR)
  reorderImages(
    @Param('id') apartmentId: string,
    @Param('imageId') imageId: string,
    @Body() dto: UpdateApartmentImageDto,
    @GetUser() user: ActiveUser,
  ) {
    return this.apartmentService.reorderApartmentImages(
      apartmentId,
      [imageId],
      user,
    );
  }

  // ============================================
  // Apartment 3D Model Endpoints (one model per apartment)
  // ============================================

  @Post(':id/model')
  @Roles(Role.INVESTOR)
  @UseInterceptors(FileInterceptor('model'))
  uploadModel(
    @Param('id') apartmentId: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: ActiveUser,
  ) {
    try {
      this.logger.log(
        `[UPLOAD APARTMENT MODEL] User ${user.id} (${user.role}) uploading 3D model for apartment ${apartmentId}`,
      );
      return this.apartmentService.uploadApartmentModel(
        apartmentId,
        file,
        user,
      );
    } catch (error) {
      this.logger.error(
        `[UPLOAD APARTMENT MODEL ERROR] Apartment: ${apartmentId}, User: ${user.id}`,
        error,
      );
      throw error;
    }
  }

  @Get(':id/model')
  getApartmentModel(@Param('id') apartmentId: string) {
    return this.apartmentService.getApartmentModel(apartmentId);
  }

  @Delete(':id/model')
  @Roles(Role.INVESTOR)
  deleteModel(@Param('id') apartmentId: string, @GetUser() user: ActiveUser) {
    try {
      this.logger.log(
        `[DELETE APARTMENT MODEL] User ${user.id} (${user.role}) attempting to delete 3D model from apartment ${apartmentId}`,
      );
      return this.apartmentService.deleteApartmentModel(apartmentId, user);
    } catch (error) {
      this.logger.error(
        `[DELETE APARTMENT MODEL ERROR] Apartment: ${apartmentId}, User: ${user.id}`,
        error,
      );
      throw error;
    }
  }
}
