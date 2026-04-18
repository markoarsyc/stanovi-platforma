import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApartmentDto, UpdateApartmentDto } from './dto/apartment.dto';
import { ApartmentImageResponseDto, UpdateApartmentImageDto } from './dto/apartment-image.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role } from '@prisma/client';
import { ActiveUser } from '../auth/interfaces/active-user.interface';
import type { Express } from 'express';

@Injectable()
export class ApartmentService {
  private readonly MAX_IMAGES_PER_APARTMENT = 10;

  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) { }

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
      throw new ConflictException(`Apartment ${dto.aptNo} already exists in this building`);
    }

    return this.prisma.apartment.create({ data: dto });
  }

  async findAll(buildingId?: string) {
    return this.prisma.apartment.findMany({
      where: buildingId ? { buildingId } : {},
      include: { 
        building: { select: { title: true } },
        images: {
          orderBy: { displayOrder: 'asc' }
        }
      },
    });
  }

  async findOne(id: string) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id },
      include: { 
        building: true,
        images: {
          orderBy: { displayOrder: 'asc' }
        }
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

  private async validateBuildingOwnership(buildingId: string, user: ActiveUser) {
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
      throw new ForbiddenException('You do not have permission for apartments in this building');
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
    const existingImages = await this.prisma.apartmentImage.findMany({
      where: { apartmentId },
    });

    if (existingImages.length >= this.MAX_IMAGES_PER_APARTMENT) {
      throw new BadRequestException(
        `Maximum ${this.MAX_IMAGES_PER_APARTMENT} images allowed per apartment`,
      );
    }

    // Upload to Cloudinary
    const { url, publicId } = await this.cloudinaryService.uploadImage(file);

    // Calculate next displayOrder
    const maxOrder = Math.max(...existingImages.map(img => img.displayOrder), -1);

    // Save to database
    const apartmentImage = await this.prisma.apartmentImage.create({
      data: {
        apartmentId,
        imageUrl: url,
        publicId,
        displayOrder: maxOrder + 1,
      },
    });

    return this.mapApartmentImageToResponseDto(apartmentImage);
  }

  async deleteApartmentImage(
    apartmentId: string,
    imageId: string,
    user: ActiveUser,
  ): Promise<void> {
    console.log(`[DELETE APARTMENT IMAGE] Starting deletion for image ${imageId} from apartment ${apartmentId}`);
    
    // Validate ownership
    await this.validateApartmentOwnership(apartmentId, user);

    // Find image
    const apartmentImage = await this.prisma.apartmentImage.findUnique({
      where: { id: imageId },
    });

    if (!apartmentImage) {
      console.error(`[DELETE APARTMENT IMAGE] Image ${imageId} not found in database`);
      throw new NotFoundException('Image not found');
    }

    if (apartmentImage.apartmentId !== apartmentId) {
      console.error(`[DELETE APARTMENT IMAGE] Image ${imageId} belongs to apartment ${apartmentImage.apartmentId}, not ${apartmentId}`);
      throw new ForbiddenException('Image does not belong to this apartment');
    }

    console.log(`[DELETE APARTMENT IMAGE] Found image with publicId ${apartmentImage.publicId}, proceeding to delete from Cloudinary`);
    
    // Delete from Cloudinary
    await this.cloudinaryService.deleteImage(apartmentImage.publicId);

    console.log(`[DELETE APARTMENT IMAGE] Successfully deleted from Cloudinary, now deleting from database`);
    
    // Delete from database
    await this.prisma.apartmentImage.delete({
      where: { id: imageId },
    });
    
    console.log(`[DELETE APARTMENT IMAGE] Successfully deleted image ${imageId} from apartment ${apartmentId}`);
  }

  async getApartmentImages(apartmentId: string): Promise<ApartmentImageResponseDto[]> {
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

    return images.map(img => this.mapApartmentImageToResponseDto(img));
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
    const existingIdSet = new Set(images.map(img => img.id));

    // Check if all provided IDs exist and belong to this apartment
    for (const id of imageIdSet) {
      if (!existingIdSet.has(id)) {
        throw new BadRequestException('One or more image IDs do not belong to this apartment');
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

  private async validateApartmentOwnership(apartmentId: string, user: ActiveUser) {
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
      console.error(`[APARTMENT IMAGE ACCESS DENIED] Investor ${investor.id} does not own apartment ${apartmentId} (building owner: ${apartment.building.investorId})`);
      throw new ForbiddenException('You do not have permission for images of this apartment');
    }
  }

  private mapApartmentImageToResponseDto(apartmentImage: any): ApartmentImageResponseDto {
    return {
      id: apartmentImage.id,
      apartmentId: apartmentImage.apartmentId,
      imageUrl: apartmentImage.imageUrl,
      publicId: apartmentImage.publicId,
      displayOrder: apartmentImage.displayOrder,
      createdAt: apartmentImage.createdAt,
    };
  }
}