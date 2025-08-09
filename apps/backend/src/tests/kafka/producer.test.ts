import { expect, test } from "bun:test";
import { startOutboxPoller } from "../../src/kafka/producer/outbox.poller";

test("Outbox poller should send events to Kafka", async () => {
  await expect(startOutboxPoller()).resolves.not.toThrow();
});
