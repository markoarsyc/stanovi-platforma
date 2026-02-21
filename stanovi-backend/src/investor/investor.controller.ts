import { Controller, Get, Post, Body, Param, Patch, UseGuards, Delete } from '@nestjs/common';
import { InvestorService } from './investor.service';
import { CreateInvestorDto } from './dto/investor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('investors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvestorController {
  constructor(private readonly investorService: InvestorService) {}

  @Post()
  @Roles(Role.INVESTOR)
  create(@Body() dto: CreateInvestorDto, @GetUser() user: any) {
    return this.investorService.create(dto, user);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.investorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.investorService.findOne(id);
  }

  @Patch(':id/verify')
  @Roles(Role.ADMIN)
  verify(@Param('id') id: string) {
    return this.investorService.verifyInvestor(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.INVESTOR)
  delete(@Param('id') id: string, @GetUser() user: any) {
    return this.investorService.delete(id, user);
  }
}