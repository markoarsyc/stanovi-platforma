import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Global()
@Module({
  providers: [
    {
      provide: PrismaClient,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const adapter = new PrismaPg({
          connectionString: configService.getOrThrow<string>('DATABASE_URL'),
        });

        return new PrismaClient({ adapter });
      },
    },
  ],
  exports: [PrismaClient],
})
export class PrismaModule {}
