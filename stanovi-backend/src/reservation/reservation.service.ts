import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/reservation.dto';
import { Role, ApartmentStatus, ReservationStatus } from '@prisma/client';
import { ActiveUser } from '../auth/interfaces/active-user.interface';

@Injectable()
export class ReservationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReservationDto, user: ActiveUser) {
    const buyer = await this.prisma.buyer.findUnique({
      where: { userId: user.id },
    });
    if (!buyer) {
      throw new ForbiddenException('Buyer profile not found');
    }

    const apartment = await this.prisma.apartment.findUnique({
      where: { id: dto.apartmentId },
    });
    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }
    if (apartment.status !== ApartmentStatus.AVAILABLE) {
      throw new ConflictException('Apartment is not available');
    }

    const [reservation] = await this.prisma.$transaction([
      this.prisma.reservation.create({
        data: {
          apartmentId: apartment.id,
          buyerId: buyer.id,
          status: ReservationStatus.ACTIVE,
        },
      }),
      this.prisma.apartment.update({
        where: { id: apartment.id },
        data: { status: ApartmentStatus.RESERVED },
      }),
    ]);

    return reservation;
  }

  async findMine(user: ActiveUser) {
    const buyer = await this.prisma.buyer.findUnique({
      where: { userId: user.id },
    });
    if (!buyer) {
      throw new ForbiddenException('Buyer profile not found');
    }

    return this.prisma.reservation.findMany({
      where: { buyerId: buyer.id },
      include: {
        apartment: {
          include: {
            building: { select: { id: true, title: true, address: true } },
            images: { orderBy: { displayOrder: 'asc' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForBuilding(buildingId: string, user: ActiveUser) {
    await this.validateBuildingOwnership(buildingId, user);

    return this.prisma.reservation.findMany({
      where: {
        status: ReservationStatus.ACTIVE,
        apartment: { buildingId },
      },
      include: {
        apartment: true,
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancel(id: string, user: ActiveUser) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        apartment: { include: { building: true } },
        buyer: true,
      },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    await this.validateCancelPermission(reservation, user);

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new ConflictException('Reservation is already cancelled');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.reservation.update({
        where: { id },
        data: {
          status: ReservationStatus.CANCELLED,
          cancelledAt: new Date(),
          canceledBy: user.id,
        },
      }),
      this.prisma.apartment.update({
        where: { id: reservation.apartmentId },
        data: { status: ApartmentStatus.AVAILABLE },
      }),
    ]);

    return updated;
  }

  private async validateCancelPermission(
    reservation: {
      buyer: { userId: string };
      apartment: { building: { investorId: string } };
    },
    user: ActiveUser,
  ) {
    if (user.role === Role.ADMIN) return;

    if (user.role === Role.BUYER) {
      if (reservation.buyer.userId !== user.id) {
        throw new ForbiddenException(
          'You can only cancel your own reservations',
        );
      }
      return;
    }

    if (user.role === Role.INVESTOR) {
      const investor = await this.prisma.investor.findUnique({
        where: { userId: user.id },
      });
      if (
        !investor ||
        reservation.apartment.building.investorId !== investor.id
      ) {
        throw new ForbiddenException(
          'You do not have permission for this reservation',
        );
      }
      return;
    }

    throw new ForbiddenException(
      'You do not have permission for this reservation',
    );
  }

  private async validateBuildingOwnership(
    buildingId: string,
    user: ActiveUser,
  ) {
    if (user.role === Role.ADMIN) return;

    const investor = await this.prisma.investor.findUnique({
      where: { userId: user.id },
    });
    if (!investor) {
      throw new ForbiddenException('Investor profile not found');
    }

    const building = await this.prisma.building.findUnique({
      where: { id: buildingId },
    });
    if (!building) {
      throw new NotFoundException('Building not found');
    }
    if (building.investorId !== investor.id) {
      throw new ForbiddenException(
        'You do not have permission for reservations in this building',
      );
    }
  }
}
