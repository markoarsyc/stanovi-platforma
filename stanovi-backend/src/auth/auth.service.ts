import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterBuyerDto } from './dto/register-buyer.dto';
import { RegisterInvestorDto } from './dto/register-investor.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user.id, user.email, user.role);
  }

  async registerBuyer(dto: RegisterBuyerDto) {
    // Validation BEFORE transaction (fail-fast)
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Atomic transaction: User + Buyer
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash: hashedPassword,
          role: Role.BUYER,
        },
      });

      const buyer = await tx.buyer.create({
        data: {
          userId: user.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
        },
      });

      return { user, buyer };
    });

    return this.generateToken(result.user.id, result.user.email, result.user.role);
  }

  async registerInvestor(dto: RegisterInvestorDto) {
    // Validation BEFORE transaction (fail-fast)
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Atomic transaction: User + Investor
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash: hashedPassword,
          role: Role.INVESTOR,
        },
      });

      const investor = await tx.investor.create({
        data: {
          userId: user.id,
          companyName: dto.companyName,
          tin: dto.tin,
          contactEmail: dto.contactEmail,
          contactPhone: dto.contactPhone,
        },
      });

      return { user, investor };
    });

    return this.generateToken(result.user.id, result.user.email, result.user.role);
  }

  private generateToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}