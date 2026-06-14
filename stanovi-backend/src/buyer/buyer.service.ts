import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBuyerDto } from './dto/buyer.dto';
import { Role } from '@prisma/client';
import { ActiveUser } from '../auth/interfaces/active-user.interface';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class BuyerService {
  private readonly logger = new Logger(BuyerService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async findAll() {
    return this.prisma.buyer.findMany();
  }

  async findOne(id: string) {
    const buyer = await this.prisma.buyer.findUnique({
      where: { id },
    });
    if (!buyer) throw new NotFoundException('Buyer not found.');
    return buyer;
  }

  async findByUserId(userId: string) {
    const buyer = await this.prisma.buyer.findUnique({
      where: { userId },
    });
    if (!buyer) throw new NotFoundException('Buyer not found.');
    return buyer;
  }

  async update(id: string, dto: UpdateBuyerDto, user: ActiveUser) {
    await this.validateOwnership(id, user);

    return this.prisma.buyer.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, user: ActiveUser) {
    await this.validateOwnership(id, user);

    return this.prisma.buyer.delete({
      where: { id },
    });
  }

  async uploadProfilePhoto(
    id: string,
    file: Express.Multer.File,
    user: ActiveUser,
  ) {
    const buyer = await this.validateOwnership(id, user);

    if (!file) throw new BadRequestException('No image file provided');

    const { url, publicId } = await this.cloudinary.uploadImage(
      file,
      this.cloudinary.PROFILE_PHOTO_FOLDER,
    );

    if (buyer.profilePhotoPublicId) {
      await this.safeDeletePhoto(buyer.profilePhotoPublicId);
    }

    return this.prisma.buyer.update({
      where: { id },
      data: { profilePhotoUrl: url, profilePhotoPublicId: publicId },
    });
  }

  async removeProfilePhoto(id: string, user: ActiveUser) {
    const buyer = await this.validateOwnership(id, user);

    if (buyer.profilePhotoPublicId) {
      await this.safeDeletePhoto(buyer.profilePhotoPublicId);
    }

    return this.prisma.buyer.update({
      where: { id },
      data: { profilePhotoUrl: null, profilePhotoPublicId: null },
    });
  }

  private async safeDeletePhoto(publicId: string) {
    try {
      await this.cloudinary.deleteImage(publicId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to delete old profile photo: ${message}`);
    }
  }

  private async validateOwnership(buyerId: string, user: ActiveUser) {
    const buyer = await this.prisma.buyer.findUnique({
      where: { id: buyerId },
    });

    if (!buyer) {
      throw new NotFoundException(`Buyer profile not found.`);
    }

    if (user.role !== Role.ADMIN && buyer.userId !== user.id) {
      throw new ForbiddenException('You can only modify your own profile.');
    }

    return buyer;
  }
}
