import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuildingDto, UpdateBuildingDto } from './dto/building.dto';
import { FindBuildingsQueryDto } from './dto/find-buildings-query.dto';
import { BuildingImageResponseDto } from './dto/building-image.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { GeocodingService } from '../geocoding/geocoding.service';
import { Role, BuildingImage } from '@prisma/client';
import { ActiveUser } from '../auth/interfaces/active-user.interface';

@Injectable()
export class BuildingService {
  private readonly logger = new Logger(BuildingService.name);
  private readonly MAX_IMAGES_PER_BUILDING = 10;

  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private geocodingService: GeocodingService,
  ) {}

  async create(dto: CreateBuildingDto, user: ActiveUser) {
    const investor = await this.prisma.investor.findUnique({
      where: { userId: user.id },
    });
    if (!investor) throw new ForbiddenException('Investor profile not found');

    const coords = await this.geocodeBuilding(dto.address, dto.locationId);

    return this.prisma.building.create({
      data: {
        ...dto,
        investorId: investor.id,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      },
    });
  }

  private async geocodeBuilding(address: string, locationId: number) {
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });
    if (!location) return null;
    return this.geocodingService.geocode(address, location.name);
  }

  async findAll(query: FindBuildingsQueryDto = {}) {
    const { search, locationId, status, sort } = query;
    return this.prisma.building.findMany({
      where: {
        ...(search && {
          title: { contains: search, mode: 'insensitive' },
        }),
        ...(locationId && { locationId }),
        ...(status && { status }),
      },
      include: {
        location: true,
        _count: { select: { apartments: true } },
        images: {
          orderBy: [{ isCover: 'desc' }, { displayOrder: 'asc' }],
        },
      },
      orderBy: { createdAt: sort === 'oldest' ? 'asc' : 'desc' },
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
          orderBy: [{ isCover: 'desc' }, { displayOrder: 'asc' }],
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
        apartments: {
          include: {
            images: {
              orderBy: { displayOrder: 'asc' },
            },
            model: true,
          },
          orderBy: { aptNo: 'asc' },
        },
        images: {
          orderBy: [{ isCover: 'desc' }, { displayOrder: 'asc' }],
        },
        investor: {
          select: {
            companyName: true,
            contactEmail: true,
            contactPhone: true,
            isVerified: true,
            profilePhotoUrl: true,
          },
        },
      },
    });

    if (!building) throw new NotFoundException('Building not found');
    return building;
  }

  async update(id: string, dto: UpdateBuildingDto, user: ActiveUser) {
    if (user.role !== Role.ADMIN) {
      await this.validateOwnership(id, user);
    }

    const coords = await this.resolveCoordinatesForUpdate(id, dto);

    return this.prisma.building.update({
      where: { id },
      data: {
        ...dto,
        ...(coords && { latitude: coords.lat, longitude: coords.lng }),
      },
    });
  }

  // Re-geocode only when address or location changes, using the effective
  // (new or existing) values for the unchanged field.
  private async resolveCoordinatesForUpdate(
    id: string,
    dto: UpdateBuildingDto,
  ) {
    if (dto.address === undefined && dto.locationId === undefined) return null;

    const current = await this.prisma.building.findUnique({ where: { id } });
    if (!current) return null;

    const address = dto.address ?? current.address;
    const locationId = dto.locationId ?? current.locationId;
    return this.geocodeBuilding(address, locationId);
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
      this.logger.error(
        `[OWNERSHIP VALIDATION] Building ${buildingId} not found`,
      );
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
        this.logger.error(
          `[OWNERSHIP VALIDATION DENIED] User ${user.id} investor ${investor?.id} != building investor ${building.investorId}`,
        );
        throw new ForbiddenException(
          'You do not have permission for this building',
        );
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
    const imageCount = await this.prisma.buildingImage.count({
      where: { buildingId },
    });

    if (imageCount >= this.MAX_IMAGES_PER_BUILDING) {
      throw new BadRequestException(
        `Maximum ${this.MAX_IMAGES_PER_BUILDING} images allowed per building`,
      );
    }

    // Upload to Cloudinary
    const { url, publicId } = await this.cloudinaryService.uploadImage(file);

    // Calculate next displayOrder
    const last = await this.prisma.buildingImage.findFirst({
      where: { buildingId },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });
    const nextOrder = (last?.displayOrder ?? -1) + 1;

    // Save to database; first image of a building becomes its cover
    const buildingImage = await this.prisma.buildingImage.create({
      data: {
        buildingId,
        imageUrl: url,
        publicId,
        displayOrder: nextOrder,
        isCover: imageCount === 0,
      },
    });

    return this.mapToResponseDto(buildingImage);
  }

  async deleteBuildingImage(
    buildingId: string,
    imageId: string,
    user: ActiveUser,
  ): Promise<void> {
    this.logger.log(
      `[DELETE IMAGE] Starting deletion for image ${imageId} from building ${buildingId}`,
    );

    // Validate ownership
    if (user.role !== Role.ADMIN) {
      await this.validateOwnership(buildingId, user);
    }

    // Find image
    const buildingImage = await this.prisma.buildingImage.findUnique({
      where: { id: imageId },
    });

    if (!buildingImage) {
      this.logger.error(
        `[DELETE IMAGE] Image ${imageId} not found in database`,
      );
      throw new NotFoundException('Image not found');
    }

    if (buildingImage.buildingId !== buildingId) {
      this.logger.error(
        `[DELETE IMAGE] Image ${imageId} belongs to building ${buildingImage.buildingId}, not ${buildingId}`,
      );
      throw new ForbiddenException('Image does not belong to this building');
    }

    this.logger.log(
      `[DELETE IMAGE] Found image with publicId ${buildingImage.publicId}, proceeding to delete from Cloudinary`,
    );

    // Delete from Cloudinary
    await this.cloudinaryService.deleteImage(buildingImage.publicId);

    this.logger.log(
      `[DELETE IMAGE] Successfully deleted from Cloudinary, now deleting from database`,
    );

    // Delete from database
    await this.prisma.buildingImage.delete({
      where: { id: imageId },
    });

    // If the cover was removed, promote the first remaining image to cover
    if (buildingImage.isCover) {
      const nextCover = await this.prisma.buildingImage.findFirst({
        where: { buildingId },
        orderBy: { displayOrder: 'asc' },
        select: { id: true },
      });
      if (nextCover) {
        await this.prisma.buildingImage.update({
          where: { id: nextCover.id },
          data: { isCover: true },
        });
      }
    }

    this.logger.log(
      `[DELETE IMAGE] Successfully deleted image ${imageId} from building ${buildingId}`,
    );
  }

  async setCoverImage(
    buildingId: string,
    imageId: string,
    user: ActiveUser,
  ): Promise<BuildingImageResponseDto[]> {
    // Validate ownership
    if (user.role !== Role.ADMIN) {
      await this.validateOwnership(buildingId, user);
    }

    // Verify the image belongs to this building
    const buildingImage = await this.prisma.buildingImage.findUnique({
      where: { id: imageId },
    });

    if (!buildingImage) {
      throw new NotFoundException('Image not found');
    }

    if (buildingImage.buildingId !== buildingId) {
      throw new ForbiddenException('Image does not belong to this building');
    }

    // Only one image can be the cover
    await this.prisma.$transaction([
      this.prisma.buildingImage.updateMany({
        where: { buildingId },
        data: { isCover: false },
      }),
      this.prisma.buildingImage.update({
        where: { id: imageId },
        data: { isCover: true },
      }),
    ]);

    return this.getBuildingImages(buildingId);
  }

  async getBuildingImages(
    buildingId: string,
  ): Promise<BuildingImageResponseDto[]> {
    // Check if building exists
    const building = await this.prisma.building.findUnique({
      where: { id: buildingId },
    });

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    const images = await this.prisma.buildingImage.findMany({
      where: { buildingId },
      orderBy: [{ isCover: 'desc' }, { displayOrder: 'asc' }],
    });

    return images.map((img) => this.mapToResponseDto(img));
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
    const existingIdSet = new Set(images.map((img) => img.id));

    // Check if all provided IDs exist and belong to this building
    for (const id of imageIdSet) {
      if (!existingIdSet.has(id)) {
        throw new BadRequestException(
          'One or more image IDs do not belong to this building',
        );
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

  private mapToResponseDto(
    buildingImage: BuildingImage,
  ): BuildingImageResponseDto {
    return {
      id: buildingImage.id,
      buildingId: buildingImage.buildingId,
      imageUrl: buildingImage.imageUrl,
      publicId: buildingImage.publicId,
      displayOrder: buildingImage.displayOrder,
      isCover: buildingImage.isCover,
      createdAt: buildingImage.createdAt,
    };
  }
}
