import { connectKafka, disconnectKafka } from './kafka/utils/kafka';
import { pollOutbox } from './kafka/producer/outbox.poller';
import { startOrderCreatedConsumer } from './kafka/consumer/order.created';
import { logger } from './kafka/utils/kafka';

async function main() {
  await connectKafka();
  startOrderCreatedConsumer();
  pollOutbox();

  process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    await disconnectKafka();
    process.exit(0);
  });
}

main().catch((err) => {
  logger.error(err, 'Fatal error');
  process.exit(1);
});
