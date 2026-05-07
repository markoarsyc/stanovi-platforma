import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
    private kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID,
        brokers: process.env.KAFKA_BROKERS?.split(',') ?? ['localhost:9092'],
    });
    private producer = this.kafka.producer();

    async onModuleInit() {
        await this.producer.connect();
        console.log('Kafka producer connected');
    }

    async sendEvent(topic: string, message: any, key?: string) {
        await this.producer.send({
            topic,
            messages: [
                {
                    key: key,
                    value: JSON.stringify(message),
                },
            ],
        });
    }
}
