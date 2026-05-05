import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvestorDto } from './dto/investor.dto';
import { ActiveUser } from '../auth/interfaces/active-user.interface';
import { Role } from '@prisma/client';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { KafkaService } from 'src/kafka/kafka.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InvestorService {
  constructor(private prisma: PrismaService, private kafkaService: KafkaService) { }

  async create(dto: CreateInvestorDto, user: ActiveUser) {
    const existing = await this.prisma.investor.findUnique({
      where: { userId: user.id }
    });

    if (existing) {
      throw new ConflictException('Investor profile already exists for this user');
    }

    return this.prisma.investor.create({
      data: {
        ...dto,
        userId: user.id
      }
    });
  }

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

  async verifyInvestor(id: string) {
    return this.prisma.investor.update({
      where: { id },
      data: { isVerified: true }
    });
  }

  async delete(id: string, user: ActiveUser) {
    const investor = await this.prisma.investor.findUnique({ where: { id } });

    if (!investor) throw new NotFoundException('Investor not found');

    if (user.role !== Role.ADMIN && investor.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own profile');
    }

    return this.prisma.investor.delete({ where: { id } });
  }


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
}