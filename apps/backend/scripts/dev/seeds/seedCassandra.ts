// scripts/dev/seedCassandra.ts
import "dotenv/config";
import { cassandraClient, connectCassandra } from "../../../src/kafka/utils/cassandra";

async function seedCassandra() {
  await connectCassandra();

  const orders = [
    {
      order_id: "11111111-1111-1111-1111-111111111111",
      user_id: "user-1",
      status: "Created",
      total_amount: 120.5,
      currency: "USD",
      description: "Test order for user-1",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      order_id: "22222222-2222-2222-2222-222222222222",
      user_id: "user-2",
      status: "Created",
      total_amount: 89.99,
      currency: "EUR",
      description: "Test order for user-2",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  for (const order of orders) {
    await cassandraClient.execute(
      `INSERT INTO orders (order_id, user_id, status, total_amount, currency, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.order_id,
        order.user_id,
        order.status,
        order.total_amount,
        order.currency,
        order.description,
        order.created_at,
        order.updated_at,
      ],
      { prepare: true }
    );
    console.log(`✅ Seeded order ${order.order_id}`);
  }

  await cassandraClient.shutdown();
  console.log("🌱 Cassandra seeding complete.");
}

seedCassandra().catch((err) => {
  console.error("❌ Error seeding Cassandra:", err);
  process.exit(1);
});
