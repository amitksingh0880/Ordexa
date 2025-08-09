// scripts/dev/checkCassandra.ts
import "dotenv/config";
import Table from "cli-table3";
import { cassandraClient, connectCassandra } from "../../../src/kafka/utils/cassandra";
async function checkCassandra() {
  await connectCassandra();

  try {
    const result = await cassandraClient.execute("SELECT * FROM orders");

    console.log(`📦 Retrieved ${result.rowLength} rows from Cassandra orders table`);

    const table = new Table({
      head: ["Order ID", "User ID", "Status", "Total", "Currency", "Description", "Created At"],
      colWidths: [38, 15, 12, 10, 12, 30, 25],
    });

    result.rows.forEach((row, i) => {
      // Log raw row for debugging
      console.log(`Row ${i}:`, row);

      table.push([
        // Convert UUID to string explicitly
        row.order_id ? row.order_id.toString() : "",
        row.user_id ?? "",
        row.status ?? "",
        row.total_amount ?? "",
        row.currency ?? "",
        row.description ?? "",
        row.created_at ? row.created_at.toISOString() : "",
      ]);
    });

    console.log("\n📋 Orders in Cassandra:");
    console.log(table.toString());
  } catch (err) {
    console.error("❌ Error checking Cassandra:", err);
  } finally {
    await cassandraClient.shutdown();
  }
}

checkCassandra().catch((err) => {
  console.error("❌ Uncaught error:", err);
  process.exit(1);
});
