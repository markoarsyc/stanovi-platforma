import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuildingDto, UpdateBuildingDto } from './dto/building.dto';

@Injectable()
export class BuildingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateBuildingDto) {
    return this.prisma.building.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.building.findMany({
      include: {
        location: true,
        _count: { select: { apartments: true } },
      },
    });
  }

  async findOne(id: string) {
    const building = await this.prisma.building.findUnique({
      where: { id },
      include: {
        location: true,
        apartments: true,
        investor: {
          select: { companyName: true, contactEmail: true }
        }
      },
    });

    if (!building) throw new NotFoundException('Building not found');
    return building;
  }

  async update(id: string, dto: UpdateBuildingDto) {
    try {
      return await this.prisma.building.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      throw new NotFoundException('Building not found or update failed');
    }
  }

  async delete(id: string) {
    return this.prisma.building.delete({
      where: { id },
    });
  }
}