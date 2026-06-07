import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterBuyerDto } from './dto/register-buyer.dto';
import { RegisterInvestorDto } from './dto/register-investor.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import type { ActiveUser } from './interfaces/active-user.interface';
import { GetUser } from './decorators/get-user.decorator';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register-buyer')
  @UseGuards(ThrottlerGuard)
  registerBuyer(@Body() dto: RegisterBuyerDto) {
    return this.authService.registerBuyer(dto);
  }

  @Post('register-investor')
  @UseGuards(ThrottlerGuard)
  registerInvestor(@Body() dto: RegisterInvestorDto) {
    return this.authService.registerInvestor(dto);
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INVESTOR, Role.BUYER)
  getProfile(@GetUser() user: ActiveUser) {
    return user;
  }
}
