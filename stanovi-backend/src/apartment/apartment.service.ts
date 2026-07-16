import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApartmentDto, UpdateApartmentDto } from './dto/apartment.dto';
import { ApartmentImageResponseDto } from './dto/apartment-image.dto';
import { ApartmentModelResponseDto } from './dto/apartment-model.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role, ApartmentImage, ApartmentModel } from '@prisma/client';
import { ActiveUser } from '../auth/interfaces/active-user.interface';
import type { Express } from 'express';

@Injectable()
export class ApartmentService {
  private readonly logger = new Logger(ApartmentService.name);
  private readonly MAX_IMAGES_PER_APARTMENT = 10;

  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateApartmentDto, user: ActiveUser) {
    await this.validateBuildingOwnership(dto.buildingId, user);

    const existing = await this.prisma.apartment.findUnique({
      where: {
        buildingId_aptNo: {
          buildingId: dto.buildingId,
          aptNo: dto.aptNo,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Apartment ${dto.aptNo} already exists in this building`,
      );
    }

    return this.prisma.apartment.create({ data: dto });
  }

  async findAll(buildingId?: string) {
    return this.prisma.apartment.findMany({
      where: buildingId ? { buildingId } : {},
      include: {
        building: { select: { title: true } },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        model: true,
      },
    });
  }

  async findOne(id: string) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id },
      include: {
        building: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        model: true,
      },
    });

    if (!apartment) throw new NotFoundException('Apartment not found');
    return apartment;
  }

  async update(id: string, dto: UpdateApartmentDto, user: ActiveUser) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id },
    });

    if (!apartment) throw new NotFoundException('Apartment not found');

    await this.validateBuildingOwnership(apartment.buildingId, user);

    return this.prisma.apartment.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, user: ActiveUser) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id },
    });

    if (!apartment) throw new NotFoundException('Apartment not found');

    await this.validateBuildingOwnership(apartment.buildingId, user);

    return this.prisma.apartment.delete({ where: { id } });
  }

  private async validateBuildingOwnership(
    buildingId: string,
    user: ActiveUser,
  ) {
    if (user.role === Role.ADMIN) return;

    // Find investor profile associated with the user
    const investor = await this.prisma.investor.findUnique({
      where: { userId: user.id },
    });
    // If no investor profile, deny access
    if (!investor) {
      throw new ForbiddenException('Investor profile not found');
    }

    // Find building and check ownership
    const building = await this.prisma.building.findUnique({
      where: { id: buildingId },
    });
    // If building doesn't exist, throw not found
    if (!building) {
      throw new NotFoundException('Building not found');
    }
    // If building doesn't belong to investor, deny access
    if (building.investorId !== investor.id) {
      throw new ForbiddenException(
        'You do not have permission for apartments in this building',
      );
    }
  }

  // ============================================
  // Apartment Images Methods
  // ============================================

  async uploadApartmentImage(
    apartmentId: string,
    file: Express.Multer.File,
    user: ActiveUser,
  ): Promise<ApartmentImageResponseDto> {
    // Validate ownership
    await this.validateApartmentOwnership(apartmentId, user);

    // Check image count limit
    const imageCount = await this.prisma.apartmentImage.count({
      where: { apartmentId },
    });

    if (imageCount >= this.MAX_IMAGES_PER_APARTMENT) {
      throw new BadRequestException(
        `Maximum ${this.MAX_IMAGES_PER_APARTMENT} images allowed per apartment`,
      );
    }

    // Upload to Cloudinary
    const { url, publicId } = await this.cloudinaryService.uploadImage(file);

    // Calculate next displayOrder
    const last = await this.prisma.apartmentImage.findFirst({
      where: { apartmentId },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });
    const nextOrder = (last?.displayOrder ?? -1) + 1;

    // Save to database
    const apartmentImage = await this.prisma.apartmentImage.create({
      data: {
        apartmentId,
        imageUrl: url,
        publicId,
        displayOrder: nextOrder,
      },
    });

    return this.mapApartmentImageToResponseDto(apartmentImage);
  }

  async deleteApartmentImage(
    apartmentId: string,
    imageId: string,
    user: ActiveUser,
  ): Promise<void> {
    this.logger.log(
      `[DELETE APARTMENT IMAGE] Starting deletion for image ${imageId} from apartment ${apartmentId}`,
    );

    // Validate ownership
    await this.validateApartmentOwnership(apartmentId, user);

    // Find image
    const apartmentImage = await this.prisma.apartmentImage.findUnique({
      where: { id: imageId },
    });

    if (!apartmentImage) {
      this.logger.error(
        `[DELETE APARTMENT IMAGE] Image ${imageId} not found in database`,
      );
      throw new NotFoundException('Image not found');
    }

    if (apartmentImage.apartmentId !== apartmentId) {
      this.logger.error(
        `[DELETE APARTMENT IMAGE] Image ${imageId} belongs to apartment ${apartmentImage.apartmentId}, not ${apartmentId}`,
      );
      throw new ForbiddenException('Image does not belong to this apartment');
    }

    this.logger.log(
      `[DELETE APARTMENT IMAGE] Found image with publicId ${apartmentImage.publicId}, proceeding to delete from Cloudinary`,
    );

    // Delete from Cloudinary
    await this.cloudinaryService.deleteImage(apartmentImage.publicId);

    this.logger.log(
      `[DELETE APARTMENT IMAGE] Successfully deleted from Cloudinary, now deleting from database`,
    );

    // Delete from database
    await this.prisma.apartmentImage.delete({
      where: { id: imageId },
    });

    this.logger.log(
      `[DELETE APARTMENT IMAGE] Successfully deleted image ${imageId} from apartment ${apartmentId}`,
    );
  }

  async getApartmentImages(
    apartmentId: string,
  ): Promise<ApartmentImageResponseDto[]> {
    // Check if apartment exists
    const apartment = await this.prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }

    const images = await this.prisma.apartmentImage.findMany({
      where: { apartmentId },
      orderBy: { displayOrder: 'asc' },
    });

    return images.map((img) => this.mapApartmentImageToResponseDto(img));
  }

  async reorderApartmentImages(
    apartmentId: string,
    imageIds: string[],
    user: ActiveUser,
  ): Promise<void> {
    // Validate ownership
    await this.validateApartmentOwnership(apartmentId, user);

    // Verify all images belong to this apartment
    const images = await this.prisma.apartmentImage.findMany({
      where: { apartmentId },
    });

    const imageIdSet = new Set(imageIds);
    const existingIdSet = new Set(images.map((img) => img.id));

    // Check if all provided IDs exist and belong to this apartment
    for (const id of imageIdSet) {
      if (!existingIdSet.has(id)) {
        throw new BadRequestException(
          'One or more image IDs do not belong to this apartment',
        );
      }
    }

    // Update display order
    for (let i = 0; i < imageIds.length; i++) {
      await this.prisma.apartmentImage.update({
        where: { id: imageIds[i] },
        data: { displayOrder: i },
      });
    }
  }

  private async validateApartmentOwnership(
    apartmentId: string,
    user: ActiveUser,
  ) {
    // Admins can access any apartment's images
    if (user.role === Role.ADMIN) return;

    // Find apartment
    const apartment = await this.prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: { building: true },
    });

    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }

    // Find investor associated with user
    const investor = await this.prisma.investor.findUnique({
      where: { userId: user.id },
    });

    if (!investor) {
      throw new ForbiddenException('Investor profile not found');
    }

    // Check: User's investor owns the building that contains this apartment
    if (apartment.building.investorId !== investor.id) {
      this.logger.error(
        `[APARTMENT IMAGE ACCESS DENIED] Investor ${investor.id} does not own apartment ${apartmentId} (building owner: ${apartment.building.investorId})`,
      );
      throw new ForbiddenException(
        'You do not have permission for images of this apartment',
      );
    }
  }

  private mapApartmentImageToResponseDto(
    apartmentImage: ApartmentImage,
  ): ApartmentImageResponseDto {
    return {
      id: apartmentImage.id,
      apartmentId: apartmentImage.apartmentId,
      imageUrl: apartmentImage.imageUrl,
      publicId: apartmentImage.publicId,
      displayOrder: apartmentImage.displayOrder,
      createdAt: apartmentImage.createdAt,
    };
  }

  // ============================================
  // Apartment 3D Model Methods (one model per apartment)
  // ============================================

  async uploadApartmentModel(
    apartmentId: string,
    file: Express.Multer.File,
    user: ActiveUser,
  ): Promise<ApartmentModelResponseDto> {
    await this.validateApartmentOwnership(apartmentId, user);

    // One model per apartment: remove the existing one first (replace).
    const existing = await this.prisma.apartmentModel.findUnique({
      where: { apartmentId },
    });

    if (existing) {
      await this.cloudinaryService.deleteModel(existing.publicId);
      await this.prisma.apartmentModel.delete({
        where: { id: existing.id },
      });
    }

    const { url, publicId } = await this.cloudinaryService.uploadModel(file);

    const apartmentModel = await this.prisma.apartmentModel.create({
      data: {
        apartmentId,
        modelUrl: url,
        publicId,
        fileSize: file.size,
      },
    });

    return this.mapApartmentModelToResponseDto(apartmentModel);
  }

  async deleteApartmentModel(
    apartmentId: string,
    user: ActiveUser,
  ): Promise<void> {
    await this.validateApartmentOwnership(apartmentId, user);

    const apartmentModel = await this.prisma.apartmentModel.findUnique({
      where: { apartmentId },
    });

    if (!apartmentModel) {
      throw new NotFoundException('3D model not found');
    }

    await this.cloudinaryService.deleteModel(apartmentModel.publicId);

    await this.prisma.apartmentModel.delete({
      where: { id: apartmentModel.id },
    });
  }

  async getApartmentModel(
    apartmentId: string,
  ): Promise<ApartmentModelResponseDto | null> {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }

    const apartmentModel = await this.prisma.apartmentModel.findUnique({
      where: { apartmentId },
    });

    return apartmentModel
      ? this.mapApartmentModelToResponseDto(apartmentModel)
      : null;
  }

  private mapApartmentModelToResponseDto(
    apartmentModel: ApartmentModel,
  ): ApartmentModelResponseDto {
    return {
      id: apartmentModel.id,
      apartmentId: apartmentModel.apartmentId,
      modelUrl: apartmentModel.modelUrl,
      publicId: apartmentModel.publicId,
      fileSize: apartmentModel.fileSize,
      createdAt: apartmentModel.createdAt,
    };
  }
}
