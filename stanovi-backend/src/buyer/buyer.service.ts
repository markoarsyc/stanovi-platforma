import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuyerDto, UpdateBuyerDto } from './dto/buyer.dto';
import { Role } from '@prisma/client/index-browser';

@Injectable()
export class BuyerService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBuyerDto, user: any) {
    const existing = await this.prisma.buyer.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      throw new ConflictException('Buyer profile already exists for this user.');
    }

    return this.prisma.buyer.create({
      data: {
        ...dto,
        userId: user.id,
      },
    });
  }

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

  async update(id: string, dto: UpdateBuyerDto, user: any) {
    await this.validateOwnership(id, user);

    return this.prisma.buyer.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, user: any) {
    await this.validateOwnership(id, user);

    return this.prisma.buyer.delete({
      where: { id },
    });
  }

  private async validateOwnership(buyerId: string, user: any) {
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