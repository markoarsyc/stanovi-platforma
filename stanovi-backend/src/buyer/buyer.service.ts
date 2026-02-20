import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuyerDto, UpdateBuyerDto } from './dto/buyer.dto';

@Injectable()
export class BuyerService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBuyerDto) {
    const existing = await this.prisma.buyer.findUnique({
      where: { userId: dto.userId },
    });

    if (existing) {
      throw new ConflictException('Buyer profile already exists for this user.');
    }

    return this.prisma.buyer.create({
      data: dto,
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

  async update(id: string, dto: UpdateBuyerDto) {
    return this.prisma.buyer.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    return this.prisma.buyer.delete({
      where: { id },
    });
  }
}