import { Module } from '@nestjs/common';
import { InvestorService } from './investor.service';
import { InvestorController } from './investor.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { KafkaService } from 'src/kafka/kafka.service';


@Module({
  imports: [PrismaModule],
  controllers: [InvestorController],
  providers: [InvestorService, KafkaService],
  exports: [InvestorService],
})
export class InvestorModule { }
