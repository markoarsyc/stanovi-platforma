import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvestorDto } from './dto/investor.dto';

@Injectable()
export class InvestorService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateInvestorDto, user: any) {
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

  async delete(id: string, user: any) {
  const investor = await this.prisma.investor.findUnique({ where: { id } });
  
  if (!investor) throw new NotFoundException('Investor not found');

  if (user.role !== 'ADMIN' && investor.userId !== user.id) {
    throw new ForbiddenException('You can only delete your own profile');
  }

  return this.prisma.investor.delete({ where: { id } });
}
}