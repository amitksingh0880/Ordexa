import { connectCassandra } from "../../utils/cassandra";
import { insertOrderIntoCassandra } from "../../utils/insert";
import { v4 as uuidv4 } from "uuid";

async function testInsert() {
  await connectCassandra();
  await insertOrderIntoCassandra({
    orderId: uuidv4(),
    userId: uuidv4(),
    status: "created",
    totalAmount: 100.50,
    createdAt: new Date().toISOString(),
  });
  console.log("✅ Test insert complete");
}

testInsert().catch(console.error);
