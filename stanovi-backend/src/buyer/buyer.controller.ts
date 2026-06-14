import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BuyerService } from './buyer.service';
import { UpdateBuyerDto } from './dto/buyer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { ActiveUser } from '../auth/interfaces/active-user.interface';

@Controller('buyers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BuyerController {
  constructor(private readonly buyerService: BuyerService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.buyerService.findAll();
  }

  @Get('user/:userId')
  @Roles(Role.ADMIN, Role.BUYER)
  findByUserId(@Param('userId') userId: string) {
    return this.buyerService.findByUserId(userId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.BUYER)
  findOne(@Param('id') id: string) {
    return this.buyerService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.BUYER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBuyerDto,
    @GetUser() user: ActiveUser,
  ) {
    return this.buyerService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.BUYER)
  remove(@Param('id') id: string, @GetUser() user: ActiveUser) {
    return this.buyerService.delete(id, user);
  }

  @Post(':id/photo')
  @Roles(Role.ADMIN, Role.BUYER)
  @UseInterceptors(FileInterceptor('image'))
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: ActiveUser,
  ) {
    return this.buyerService.uploadProfilePhoto(id, file, user);
  }

  @Delete(':id/photo')
  @Roles(Role.ADMIN, Role.BUYER)
  removePhoto(@Param('id') id: string, @GetUser() user: ActiveUser) {
    return this.buyerService.removeProfilePhoto(id, user);
  }
}
