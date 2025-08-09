import { Client } from "cassandra-driver";

export const cassandraClient = new Client({
  contactPoints: ['127.0.0.1'], // or your container IP
  localDataCenter: 'datacenter1', // adjust if needed
  keyspace: 'ordexa_read',         // <-- set your keyspace here
});

export async function connectCassandra() {
  await cassandraClient.connect();
  console.log("Connected to Cassandra");
}
