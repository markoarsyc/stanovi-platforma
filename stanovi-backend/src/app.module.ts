import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InvestorModule } from './investor/investor.module';
import { BuyerModule } from './buyer/buyer.module';
import { BuildingModule } from './building/building.module';
import { ApartmentModule } from './apartment/apartment.module';
import { LocationModule } from './location/location.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 3 }]),
    PrismaModule,
    AuthModule,
    InvestorModule,
    BuyerModule,
    BuildingModule,
    ApartmentModule,
    LocationModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
