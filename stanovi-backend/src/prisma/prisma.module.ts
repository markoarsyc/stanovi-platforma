import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const adapter = new PrismaPg({
          connectionString: configService.getOrThrow<string>('DATABASE_URL'),
        });

        return new PrismaClient({ adapter });
      },
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
