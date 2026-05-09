//Ova skripta se koristi za testiranje kako backend reaguje na neispravne poruke koje dolaze iz Kafke.
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'test-producer',
  brokers: ['localhost:9093'],
});

const producer = kafka.producer();

async function sendBadMessage() {
  await producer.connect();
  
  // Ovo je neispravan JSON - fali tin
  const badData = '{"eventId": "test-123", "payload": { "companyName": "Bad Company" }}'; 

  await producer.send({
    topic: 'investor-verification-events',
    messages: [{ value: badData }],
  });

  console.log('Poslata neispravna poruka u Kafku!');
  await producer.disconnect();
}

sendBadMessage();