import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BuyerService } from './buyer.service';
import { CreateBuyerDto, UpdateBuyerDto } from './dto/buyer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('buyers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BuyerController {
  constructor(private readonly buyerService: BuyerService) {}

  @Post()
  @Roles(Role.BUYER)
  create(@Body() dto: CreateBuyerDto, @GetUser() user: any) {
    return this.buyerService.create(dto, user);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.buyerService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.BUYER)
  findOne(@Param('id') id: string) {
    return this.buyerService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.BUYER)
  update(@Param('id') id: string, @Body() dto: UpdateBuyerDto, @GetUser() user: any) {
    return this.buyerService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.BUYER)
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.buyerService.delete(id, user);
  }
}