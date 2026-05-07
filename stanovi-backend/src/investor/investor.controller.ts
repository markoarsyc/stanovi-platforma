import { Controller, Get, Post, Body, Param, Patch, UseGuards, Delete } from '@nestjs/common';
import { InvestorService } from './investor.service';
import { CreateInvestorDto } from './dto/investor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { ActiveUser } from '../auth/interfaces/active-user.interface';
import { RequestVerificationDto } from './dto/request-verification.dto';

@Controller('investors')
export class InvestorController {
  constructor(private readonly investorService: InvestorService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INVESTOR)
  create(@Body() dto: CreateInvestorDto, @GetUser() user: ActiveUser) {
    return this.investorService.create(dto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.investorService.findAll();
  }

  @Get('verification-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getVerificationRequests() {
    return this.investorService.getVerificationRequests();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.investorService.findOne(id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INVESTOR)
  findByUserId(@Param('userId') userId: string) {
    return this.investorService.findByUserId(userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INVESTOR)
  delete(@Param('id') id: string, @GetUser() user: ActiveUser) {
    return this.investorService.delete(id, user);
  }

  @Post(':id/request-verification')
  requestVerification(@Param('id') id: string, @Body() dto: RequestVerificationDto) {
    return this.investorService.requestVerification(id, dto);
  }


  @Patch('verification-requests/:requestId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  handleVerificationRequest(
    @Param('requestId') requestId: string,
    @Body('isApproved') isApproved: boolean
  ) {
    return this.investorService.handleVerificationRequest(requestId, isApproved);
  }
}