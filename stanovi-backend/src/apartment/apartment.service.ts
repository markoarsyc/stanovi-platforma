import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApartmentDto, UpdateApartmentDto } from './dto/apartment.dto';
import { Role } from '@prisma/client';
import { ActiveUser } from '../auth/interfaces/active-user.interface';

@Injectable()
export class ApartmentService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateApartmentDto, user: ActiveUser) {
    await this.validateBuildingOwnership(dto.buildingId, user);

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

  async update(id: string, dto: UpdateApartmentDto, user: ActiveUser) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id },
    });

    if (!apartment) throw new NotFoundException('Apartment not found');

    await this.validateBuildingOwnership(apartment.buildingId, user);

    return this.prisma.apartment.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, user: ActiveUser) {
    const apartment = await this.prisma.apartment.findUnique({
      where: { id },
    });

    if (!apartment) throw new NotFoundException('Apartment not found');

    await this.validateBuildingOwnership(apartment.buildingId, user);

    return this.prisma.apartment.delete({ where: { id } });
  }

  private async validateBuildingOwnership(buildingId: string, user: ActiveUser) {
    if (user.role === Role.ADMIN) return;

    // Find investor profile associated with the user
    const investor = await this.prisma.investor.findUnique({
      where: { userId: user.id },
    });
    // If no investor profile, deny access
    if (!investor) {
      throw new ForbiddenException('Investor profile not found');
    }

    // Find building and check ownership
    const building = await this.prisma.building.findUnique({
      where: { id: buildingId },
    });
    // If building doesn't exist, throw not found
    if (!building) {
      throw new NotFoundException('Building not found');
    }
    // If building doesn't belong to investor, deny access
    if (building.investorId !== investor.id) {
      throw new ForbiddenException('You do not have permission for apartments in this building');
    }
  }
}