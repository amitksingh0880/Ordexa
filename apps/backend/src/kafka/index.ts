import { startConsumer } from "./consumer/order.created";
import { startOutboxPoller } from "./producer/outbox.poller";


async function main() {
  await startOutboxPoller();
  await startConsumer();
}

main().catch(console.error);
