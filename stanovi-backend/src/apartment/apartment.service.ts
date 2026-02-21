import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApartmentDto, UpdateApartmentDto } from './dto/apartment.dto';

@Injectable()
export class ApartmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApartmentDto) {
    const existing = await this.prisma.apartment.findUnique({
      where: {
        buildingId_aptNo: {
          buildingId: dto.buildingId,
          aptNo: dto.aptNo,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Apartment ${dto.aptNo} already exists in this building`);
    }

    return this.prisma.apartment.create({ data: dto });
  }

  async findAll(buildingId?: string) {
    return this.prisma.apartment.findMany({
      where: buildingId ? { buildingId } : {},
      include: { building: { select: { title: true } } },
    });
  }

  async findOne(id: string) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id },
      include: { building: true },
    });

    if (!apartment) throw new NotFoundException('Apartment not found');
    return apartment;
  }

  async update(id: string, dto: UpdateApartmentDto) {
    return this.prisma.apartment.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    return this.prisma.apartment.delete({ where: { id } });
  }
}