// utils/cassandra.ts
import { Client } from "cassandra-driver";

export const cassandraClient = new Client({
  contactPoints: ["localhost"],
  localDataCenter: "datacenter1",
  keyspace: "ordexa_read",
});

export async function connectCassandra() {
  await cassandraClient.connect();
  console.log("✅ Connected to Cassandra");
}
