import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActiveUser } from '../auth/interfaces/active-user.interface';
import { Role } from '@prisma/client';
import { RequestVerificationDto } from './dto/request-verification.dto';

@Injectable()
export class InvestorService {
  private readonly logger = new Logger(InvestorService.name);

  constructor(private prisma: PrismaService) {}

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
    const investor = await this.prisma.investor.findUnique({ where: { id } });

    if (!investor) throw new NotFoundException('Investor not found');

    if (user.role !== Role.ADMIN && investor.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own profile');
    }

    return this.prisma.investor.delete({ where: { id } });
  }

  // --- Verification Methods ---

  async requestVerification(id: string, dto: RequestVerificationDto) {
    const investor = await this.prisma.investor.findUnique({ where: { id } });
    if (!investor) throw new NotFoundException('Investor not found');

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