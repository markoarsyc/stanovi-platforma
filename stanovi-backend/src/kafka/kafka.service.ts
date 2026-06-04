// import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
// import { Kafka } from 'kafkajs';

// @Injectable()
// export class KafkaService implements OnModuleInit {
//   private readonly logger = new Logger(KafkaService.name);
//   private kafka = new Kafka({
//     clientId: process.env.KAFKA_CLIENT_ID,
//     brokers: process.env.KAFKA_BROKERS?.split(',') ?? ['localhost:9092'],
//   });
//   private producer = this.kafka.producer();

//   async onModuleInit() {
//     await this.producer.connect();
//     this.logger.log('Kafka producer connected');
//   }

//   async sendEvent(topic: string, message: any, key?: string) {
//     await this.producer.send({
//       topic,
//       messages: [
//         {
//           key: key,
//           value: JSON.stringify(message),
//         },
//       ],
//     });
//   }
// }
