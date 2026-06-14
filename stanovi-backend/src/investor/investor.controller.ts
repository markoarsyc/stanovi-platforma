import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Delete,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InvestorService } from './investor.service';
import { UpdateInvestorDto } from './dto/investor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { ActiveUser } from '../auth/interfaces/active-user.interface';
import { RequestVerificationDto } from './dto/request-verification.dto';

@Controller('investors')
export class InvestorController {
  constructor(private readonly investorService: InvestorService) {}

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

  @Patch('verification-requests/:requestId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  handleVerificationRequest(
    @Param('requestId') requestId: string,
    @Body('isApproved') isApproved: boolean,
  ) {
    return this.investorService.handleVerificationRequest(
      requestId,
      isApproved,
    );
  }

  @Post(':id/request-verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INVESTOR)
  requestVerification(
    @Param('id') id: string,
    @Body() dto: RequestVerificationDto,
    @GetUser() user: ActiveUser,
  ) {
    return this.investorService.requestVerification(id, dto, user);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INVESTOR)
  findByUserId(@Param('userId') userId: string) {
    return this.investorService.findByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.investorService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INVESTOR)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInvestorDto,
    @GetUser() user: ActiveUser,
  ) {
    return this.investorService.update(id, dto, user);
  }

  @Post(':id/photo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INVESTOR)
  @UseInterceptors(FileInterceptor('image'))
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: ActiveUser,
  ) {
    return this.investorService.uploadProfilePhoto(id, file, user);
  }

  @Delete(':id/photo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INVESTOR)
  removePhoto(@Param('id') id: string, @GetUser() user: ActiveUser) {
    return this.investorService.removeProfilePhoto(id, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INVESTOR)
  delete(@Param('id') id: string, @GetUser() user: ActiveUser) {
    return this.investorService.delete(id, user);
  }
}
