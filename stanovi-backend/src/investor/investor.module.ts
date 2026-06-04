import { Module } from '@nestjs/common';
import { InvestorService } from './investor.service';
import { InvestorController } from './investor.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
//import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [PrismaModule], //KafkaModule],
  controllers: [InvestorController],
  providers: [InvestorService],
  exports: [InvestorService],
})
export class InvestorModule {}
