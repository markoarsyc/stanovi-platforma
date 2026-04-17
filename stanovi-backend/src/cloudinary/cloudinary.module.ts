import { Module, OnModuleInit } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { configureCloudinary } from './cloudinary.config';

@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule implements OnModuleInit {
  onModuleInit() {
    configureCloudinary();
  }
}
