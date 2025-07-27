// utils/cassandra.ts
import { Client } from "cassandra-driver";

export const cassandraClient = new Client({
  contactPoints: ["127.0.0.1"],
  localDataCenter: "datacenter1",
  keyspace: "ordexa_read",
});

export async function connectCassandra() {
  await cassandraClient.connect();
  console.log("✅ Connected to Cassandra");
}
