import { startOrderCreatedConsumer } from "./consumer/order.created";
import { startOutboxPoller } from "./producer/outbox.poller";


async function bootstrap() {
  await Promise.all([
    startOutboxPoller(),
    startOrderCreatedConsumer(),
  ]);
}

bootstrap().catch(err => {
  console.error('[Bootstrap] Fatal error:', err);
  process.exit(1);
});
