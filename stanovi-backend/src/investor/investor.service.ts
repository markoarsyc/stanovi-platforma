import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActiveUser } from '../auth/interfaces/active-user.interface';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { UpdateInvestorDto } from './dto/investor.dto';

@Injectable()
export class InvestorService {
  private readonly logger = new Logger(InvestorService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async findAll() {
    return this.prisma.investor.findMany({
      include: { buildings: true },
    });
  }

  async findOne(id: string) {
    const investor = await this.prisma.investor.findUnique({
      where: { id },
      include: { buildings: true },
    });

    if (!investor) throw new NotFoundException('Investor not found');
    return investor;
  }

  async findByUserId(userId: string) {
    const investor = await this.prisma.investor.findUnique({
      where: { userId },
    });

    if (!investor) throw new NotFoundException('Investor not found');
    return investor;
  }

  async delete(id: string, user: ActiveUser) {
    await this.validateOwnership(id, user);
    return this.prisma.investor.delete({ where: { id } });
  }

  async update(id: string, dto: UpdateInvestorDto, user: ActiveUser) {
    const investor = await this.validateOwnership(id, user);

    // Changing the company name or TIN invalidates any prior verification —
    // the investor must go through the verification flow again.
    const resetsVerification =
      (dto.companyName !== undefined &&
        dto.companyName !== investor.companyName) ||
      (dto.tin !== undefined && (dto.tin ?? '') !== (investor.tin ?? ''));

    try {
      if (resetsVerification) {
        return await this.prisma.$transaction(async (tx) => {
          await tx.verificationRequest.deleteMany({
            where: { investorId: id, status: 'PENDING' },
          });

          return tx.investor.update({
            where: { id },
            data: { ...dto, isVerified: false },
          });
        });
      }

      return await this.prisma.investor.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('TIN already in use');
      }
      throw error;
    }
  }

  async uploadProfilePhoto(
    id: string,
    file: Express.Multer.File,
    user: ActiveUser,
  ) {
    const investor = await this.validateOwnership(id, user);

    if (!file) throw new BadRequestException('No image file provided');

    const { url, publicId } = await this.cloudinary.uploadImage(
      file,
      this.cloudinary.PROFILE_PHOTO_FOLDER,
    );

    if (investor.profilePhotoPublicId) {
      await this.safeDeletePhoto(investor.profilePhotoPublicId);
    }

    return this.prisma.investor.update({
      where: { id },
      data: { profilePhotoUrl: url, profilePhotoPublicId: publicId },
    });
  }

  async removeProfilePhoto(id: string, user: ActiveUser) {
    const investor = await this.validateOwnership(id, user);

    if (investor.profilePhotoPublicId) {
      await this.safeDeletePhoto(investor.profilePhotoPublicId);
    }

    return this.prisma.investor.update({
      where: { id },
      data: { profilePhotoUrl: null, profilePhotoPublicId: null },
    });
  }

  private async validateOwnership(id: string, user: ActiveUser) {
    const investor = await this.prisma.investor.findUnique({ where: { id } });

    if (!investor) throw new NotFoundException('Investor not found');

    if (user.role !== Role.ADMIN && investor.userId !== user.id) {
      throw new ForbiddenException('You can only modify your own profile');
    }

    return investor;
  }

  private async safeDeletePhoto(publicId: string) {
    try {
      await this.cloudinary.deleteImage(publicId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to delete old profile photo: ${message}`);
    }
  }

  // --- Verification Methods ---

  async requestVerification(
    id: string,
    dto: RequestVerificationDto,
    user: ActiveUser,
  ) {
    const investor = await this.prisma.investor.findUnique({ where: { id } });
    if (!investor) throw new NotFoundException('Investor not found');

    if (investor.userId !== user.id) {
      throw new ForbiddenException(
        'You can only request verification for your own investor profile',
      );
    }

    const request = await this.prisma.verificationRequest.create({
      data: {
        investorId: id,
        companyName: dto.companyName,
        tin: dto.tin,
        status: 'PENDING',
      },
    });

    return {
      message: 'Verification request submitted successfully',
      request,
    };
  }

  async getVerificationRequests() {
    return this.prisma.verificationRequest.findMany({
      include: { investor: true },
    });
  }

  async handleVerificationRequest(requestId: string, isApproved: boolean) {
    const request = await this.prisma.verificationRequest.findUnique({
      where: { id: requestId },
      include: { investor: true },
    });

    if (!request) {
      throw new NotFoundException('Verification request not found');
    }

    const updatedRequest = await this.prisma.$transaction(async (tx) => {
      const verificationRequest = await tx.verificationRequest.update({
        where: { id: requestId },
        data: {
          status: isApproved ? 'APPROVED' : 'REJECTED',
        },
      });

      await tx.investor.update({
        where: { id: request.investorId },
        data: {
          isVerified: Boolean(isApproved),
        },
      });

      return verificationRequest;
    });

    return updatedRequest;
  }
}
