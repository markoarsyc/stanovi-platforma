import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActiveUser } from '../auth/interfaces/active-user.interface';
import { Role } from '@prisma/client';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { KafkaService } from 'src/kafka/kafka.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvestorService {
  constructor(private prisma: PrismaService, private kafkaService: KafkaService) { }

  async findAll() {
    return this.prisma.investor.findMany({
      include: { buildings: true }
    });
  }

  async findOne(id: string) {
    const investor = await this.prisma.investor.findUnique({
      where: { id },
      include: { buildings: true }
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

  //Verification request methods
  async requestVerification(id: string, dto: RequestVerificationDto) {

    const event = {
      eventId: uuidv4(),
      eventType: 'INVESTOR_VERIFICATION_REQUESTED',
      timestamp: new Date().toISOString(),
      entityId: id,
      payload: {
        companyName: dto.companyName,
        tin: dto.tin,
        requestedAt: new Date().toISOString(),
      },
    };

    try {
      await this.kafkaService.sendEvent(
        'investor-verification-events',
        event,
        id
      );

      return {
        message: 'Verification request sent',
      };

    } catch (error) {
      console.error('Kafka error:', error);
      throw new Error('Kafka send failed');
    }
  }

  async getVerificationRequests() {
    return this.prisma.verificationRequest.findMany({
      include: { investor: true }
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

    // 1. Update VerificationRequest status
    const verificationRequest = await tx.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: isApproved ? 'APPROVED' : 'REJECTED',
      },
    });

    // 2. Update Investor verification status
    const updatedInvestor = await tx.investor.update({
      where: { id: request.investorId },
      data: {
        isVerified: Boolean(isApproved),
      },
    });

    return {
      verificationRequest,
      updatedInvestor,
    };
  });

  // 3. Send Kafka event AFTER successful transaction
  const event = {
    eventId: uuidv4(),
    eventType: isApproved
      ? 'INVESTOR_VERIFICATION_APPROVED'
      : 'INVESTOR_VERIFICATION_REJECTED',
    timestamp: new Date().toISOString(),
    entityId: request.investorId,
    payload: {
      verificationRequestId: request.id,
      investorId: request.investorId,
      companyName: request.companyName,
      tin: request.tin,
      status: isApproved ? 'APPROVED' : 'REJECTED',
      processedAt: new Date().toISOString(),
    },
  };

  try {
    await this.kafkaService.sendEvent(
      'investor-verification-events',
      event,
      request.investorId
    );
  } catch (error) {
    console.error('Kafka event send failed:', error);
  }

  return updatedRequest.verificationRequest;
}

}