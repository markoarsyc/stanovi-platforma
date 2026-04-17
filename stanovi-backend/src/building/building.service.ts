import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuildingDto, UpdateBuildingDto } from './dto/building.dto';
import { BuildingImageResponseDto } from './dto/building-image.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role } from '@prisma/client';
import { ActiveUser } from '../auth/interfaces/active-user.interface';

@Injectable()
export class BuildingService {
  private readonly MAX_IMAGES_PER_BUILDING = 10;

  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) { }

  async create(dto: CreateBuildingDto, user: ActiveUser) {
    const investor = await this.prisma.investor.findUnique({
      where: { userId: user.id },
    });
    if (!investor) throw new ForbiddenException('Investor profile not found');

    return this.prisma.building.create({
      data: {
        ...dto,
        investorId: investor.id,
      },
    });
  }

  async findAll() {
    return this.prisma.building.findMany({
      include: {
        location: true,
        _count: { select: { apartments: true } },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  async getInvestorBuildings(user: ActiveUser) {
    const investor = await this.prisma.investor.findUnique({
      where: { userId: user.id },
    });
    if (!investor) throw new ForbiddenException('Investor profile not found');

    return this.prisma.building.findMany({
      where: { investorId: investor.id },
      include: {
        location: true,
        apartments: {
          orderBy: { aptNo: 'asc' },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const building = await this.prisma.building.findUnique({
      where: { id },
      include: {
        location: true,
        apartments: true,
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        investor: {
          select: { companyName: true, contactEmail: true }
        }
      },
    });

    if (!building) throw new NotFoundException('Building not found');
    return building;
  }

  async update(id: string, dto: UpdateBuildingDto, user: ActiveUser) {
    if (user.role !== Role.ADMIN) {
      await this.validateOwnership(id, user);
    }

    return this.prisma.building.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, user: ActiveUser) {
    if (user.role !== Role.ADMIN) {
      await this.validateOwnership(id, user);
    }
    return this.prisma.building.delete({
      where: { id },
    });
  }

  private async validateOwnership(buildingId: string, user: ActiveUser) {
    //Check if building exists
    const building = await this.prisma.building.findUnique({
      where: { id: buildingId },
    });
    //Throw 404 if building doesn't exist
    if (!building) {
      throw new NotFoundException(`Building with ID ${buildingId} not found`);
    }
    //Check if user is admin or the owner of the building, if not throw 403
    if (user.role !== Role.ADMIN) {
      //Find investor associated with the user
      const investor = await this.prisma.investor.findUnique({
        where: { userId: user.id },
      });
      // If no investor found or the building doesn't belong to the investor, throw 403
      if (!investor || building.investorId !== investor.id) {
        throw new ForbiddenException('You do not have permission for this building');
      }
    }
    // If the user is an admin or the owner, return the building
    return building;
  }

  async uploadBuildingImage(
    buildingId: string,
    file: Express.Multer.File,
    user: ActiveUser,
  ): Promise<BuildingImageResponseDto> {
    // Validate ownership
    if (user.role !== Role.ADMIN) {
      await this.validateOwnership(buildingId, user);
    }

    // Check image count limit
    const existingImages = await this.prisma.buildingImage.findMany({
      where: { buildingId },
    });

    if (existingImages.length >= this.MAX_IMAGES_PER_BUILDING) {
      throw new BadRequestException(
        `Maximum ${this.MAX_IMAGES_PER_BUILDING} images allowed per building`,
      );
    }

    // Upload to Cloudinary
    const { url, publicId } = await this.cloudinaryService.uploadImage(file);

    // Calculate next displayOrder
    const maxOrder = Math.max(...existingImages.map(img => img.displayOrder), -1);

    // Save to database
    const buildingImage = await this.prisma.buildingImage.create({
      data: {
        buildingId,
        imageUrl: url,
        publicId,
        displayOrder: maxOrder + 1,
      },
    });

    return this.mapToResponseDto(buildingImage);
  }

  async deleteBuildingImage(
    buildingId: string,
    imageId: string,
    user: ActiveUser,
  ): Promise<void> {
    // Validate ownership
    if (user.role !== Role.ADMIN) {
      await this.validateOwnership(buildingId, user);
    }

    // Find image
    const buildingImage = await this.prisma.buildingImage.findUnique({
      where: { id: imageId },
    });

    if (!buildingImage) {
      throw new NotFoundException('Image not found');
    }

    if (buildingImage.buildingId !== buildingId) {
      throw new ForbiddenException('Image does not belong to this building');
    }

    // Delete from Cloudinary
    await this.cloudinaryService.deleteImage(buildingImage.publicId);

    // Delete from database
    await this.prisma.buildingImage.delete({
      where: { id: imageId },
    });
  }

  async getBuildingImages(buildingId: string): Promise<BuildingImageResponseDto[]> {
    // Check if building exists
    const building = await this.prisma.building.findUnique({
      where: { id: buildingId },
    });

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    const images = await this.prisma.buildingImage.findMany({
      where: { buildingId },
      orderBy: { displayOrder: 'asc' },
    });

    return images.map(img => this.mapToResponseDto(img));
  }

  async reorderBuildingImages(
    buildingId: string,
    imageIds: string[],
    user: ActiveUser,
  ): Promise<void> {
    // Validate ownership
    if (user.role !== Role.ADMIN) {
      await this.validateOwnership(buildingId, user);
    }

    // Verify all images belong to this building
    const images = await this.prisma.buildingImage.findMany({
      where: { buildingId },
    });

    const imageIdSet = new Set(imageIds);
    const existingIdSet = new Set(images.map(img => img.id));

    // Check if all provided IDs exist and belong to this building
    for (const id of imageIdSet) {
      if (!existingIdSet.has(id)) {
        throw new BadRequestException('One or more image IDs do not belong to this building');
      }
    }

    // Update display order
    for (let i = 0; i < imageIds.length; i++) {
      await this.prisma.buildingImage.update({
        where: { id: imageIds[i] },
        data: { displayOrder: i },
      });
    }
  }

  private mapToResponseDto(buildingImage: any): BuildingImageResponseDto {
    return {
      id: buildingImage.id,
      buildingId: buildingImage.buildingId,
      imageUrl: buildingImage.imageUrl,
      publicId: buildingImage.publicId,
      displayOrder: buildingImage.displayOrder,
      createdAt: buildingImage.createdAt,
    };
  }
}