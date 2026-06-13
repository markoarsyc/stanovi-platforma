import { Module } from '@nestjs/common';
import { BuildingService } from './building.service';
import { BuildingController } from './building.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { GeocodingModule } from 'src/geocoding/geocoding.module';

@Module({
  imports: [CloudinaryModule, GeocodingModule],
  providers: [BuildingService],
  controllers: [BuildingController],
  exports: [BuildingService],
})
export class BuildingModule {}
