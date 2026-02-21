import { Module } from '@nestjs/common';
import { BuildingService } from './building.service';
import { BuildingController } from './building.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BuildingService],
  controllers: [BuildingController],
  exports: [BuildingService]
})
export class BuildingModule {}
