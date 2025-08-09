// scripts/dev/checkCassandra.ts
import "dotenv/config";
import Table from "cli-table3";
import { cassandraClient, connectCassandra } from "../../../src/kafka/utils/cassandra";

async function checkCassandra() {
  await connectCassandra();

  try {
    const result = await cassandraClient.execute("SELECT * FROM orders_by_user");

    console.log(`📦 Retrieved ${result.rowLength} rows from Cassandra orders_by_user table`);

    const table = new Table({
      head: [
        "User ID",
        "Order ID",
        "Status",
        "Total",
        "Currency",
        "Description",
        "Created At",
        "Updated At",
      ],
      colWidths: [15, 38, 12, 10, 12, 30, 25, 25],
    });

    result.rows.forEach((row, i) => {
      // Log raw row for debugging
      console.log(`Row ${i}:`, row);

      table.push([
        row.user_id ?? "",
        row.order_id ? row.order_id.toString() : "",
        row.status ?? "",
        row.total_amount ?? "",
        row.currency ?? "",
        row.description ?? "",
        row.created_at ? row.created_at.toISOString() : "",
        row.updated_at ? row.updated_at.toISOString() : "",
      ]);
    });

    console.log("\n📋 Orders by User in Cassandra:");
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
