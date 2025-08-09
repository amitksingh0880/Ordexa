import { expect, test } from "bun:test";
import { startConsumer } from "../../src/kafka/consumer/order.created";

test("Kafka consumer should start without crashing", async () => {
  await expect(startConsumer()).resolves.not.toThrow();
});
