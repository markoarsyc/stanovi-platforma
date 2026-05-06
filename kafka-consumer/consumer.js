const { Kafka } = require('kafkajs');
const { Client } = require('pg');

const kafka = new Kafka({
    clientId: 'verification-consumer',
    brokers: process.env.KAFKA_BROKERS.split(','),
});

const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID });

const dlqProducer = kafka.producer();

const pgClient = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
});

async function validateEvent(event) {
    return (
        event.eventId &&
        event.eventType &&
        event.timestamp &&
        event.entityId &&
        event.payload &&
        event.payload.companyName &&
        event.payload.tin
    );
}

async function run() {
    await pgClient.connect();
    await consumer.connect();
    await dlqProducer.connect();

    await consumer.subscribe({
        topic: 'investor-verification-events',
        fromBeginning: true,
    });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const rawValue = message.value.toString();

            console.log('Received:', rawValue);

            let event;

            try {
                event = JSON.parse(rawValue);
            } catch (err) {
                console.log('Invalid JSON → DLQ');

                await dlqProducer.send({
                    topic: 'investor-verification-dlq',
                    messages: [{ value: rawValue }],
                });

                return;
            }

            // VALIDACIJA
            if (!(await validateEvent(event))) {
                console.log('Invalid event structure → DLQ');

                await dlqProducer.send({
                    topic: 'investor-verification-dlq',
                    messages: [{ value: rawValue }],
                });

                return;
            }

            try {
                await pgClient.query('BEGIN');

                // IDEMPOTENTNOST
                const existing = await pgClient.query(
                    'SELECT "eventId" FROM "Event" WHERE "eventId" = $1',
                    [event.eventId]
                );

                if (existing.rows.length > 0) {
                    console.log('Duplicate event skipped');
                    await pgClient.query('ROLLBACK');
                    return;
                }

                // 1. INSERT EVENT
                await pgClient.query(
                    `
        INSERT INTO "Event"("eventId", "eventType", "entityId", "timestamp", "payload")
        VALUES($1, $2, $3, $4, $5)
    `,
                    [
                        event.eventId,
                        event.eventType,
                        event.entityId,
                        event.timestamp,
                        event.payload,
                    ]
                );

                // 2. INSERT VERIFICATION REQUEST
                if (event.eventType === 'INVESTOR_VERIFICATION_REQUESTED') {
                    await pgClient.query(
                        `
            INSERT INTO "VerificationRequest"(
                "id",
                "investorId",
                "companyName",
                "tin",
                "status",
                "createdAt"
            )
            VALUES(gen_random_uuid(), $1, $2, $3, $4, NOW())
        `,
                        [
                            event.entityId,
                            event.payload.companyName,
                            event.payload.tin,
                            'PENDING',
                        ]
                    );
                }

                await pgClient.query('COMMIT');

                console.log('Event + VerificationRequest stored');

            } catch (err) {
                await pgClient.query('ROLLBACK');
                console.error('DB error (rolled back):', err);
            }
        },
    });
}

run();