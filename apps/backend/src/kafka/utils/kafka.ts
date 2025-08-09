import { Kafka, logLevel } from 'kafkajs';
import pino from 'pino';
import { config } from '../../utils/config';

export const logger = pino({ level: config.LOG_LEVEL || 'info' });

export const kafka = new Kafka({
  clientId: 'ordexa-service',
  brokers: config.KAFKA_BROKERS.split(','),
  logLevel: logLevel.ERROR,
});

export const kafkaProducer = kafka.producer();
export const kafkaConsumer = kafka.consumer({ groupId: config.KAFKA_CONSUMER_GROUP });

export async function connectKafka() {
  logger.info('Connecting to Kafka...');
  await kafkaProducer.connect();
  await kafkaConsumer.connect();
  logger.info('Kafka connected.');
}

export async function disconnectKafka() {
  logger.info('Disconnecting from Kafka...');
  await kafkaProducer.disconnect();
  await kafkaConsumer.disconnect();
  logger.info('Kafka disconnected.');
}
