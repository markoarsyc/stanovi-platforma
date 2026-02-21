import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuildingDto, UpdateBuildingDto } from './dto/building.dto';
import { Role } from '@prisma/client';
import { ActiveUser } from '../auth/interfaces/active-user.interface';

@Injectable()
export class BuildingService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateBuildingDto, user: ActiveUser) {
    const investor = await this.prisma.investor.findUnique({
      where: { userId: user.id },
    });
    if (!investor) throw new ForbiddenException('Investor profile not found');

    return this.prisma.building.create({
      data: {
        ...dto,
        investorId: investor.id,
      },
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

  async update(id: string, dto: UpdateBuildingDto, user: ActiveUser) {
    if (user.role !== Role.ADMIN) {
      await this.validateOwnership(id, user);
    }

    return this.prisma.building.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string, user: ActiveUser) {
    if (user.role !== Role.ADMIN) {
      await this.validateOwnership(id, user);
    }
    return this.prisma.building.delete({
      where: { id },
    });
  }

  private async validateOwnership(buildingId: string, user: ActiveUser) {
    //Check if building exists
    const building = await this.prisma.building.findUnique({
      where: { id: buildingId },
    });
    //Throw 404 if building doesn't exist
    if (!building) {
      throw new NotFoundException(`Building with ID ${buildingId} not found`);
    }
    //Check if user is admin or the owner of the building, if not throw 403
    if (user.role !== Role.ADMIN) {
      //Find investor associated with the user
      const investor = await this.prisma.investor.findUnique({
        where: { userId: user.id },
      });
      // If no investor found or the building doesn't belong to the investor, throw 403
      if (!investor || building.investorId !== investor.id) {
        throw new ForbiddenException('You do not have permission for this building');
      }
    }
    // If the user is an admin or the owner, return the building
    return building;
  }
}