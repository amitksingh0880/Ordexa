import { Client } from 'cassandra-driver';

const contactPoints = process.env.CASSANDRA_CONTACTPOINTS?.split(',') ?? ['127.0.0.1'];
const localDataCenter = process.env.CASSANDRA_DATACENTER ?? 'datacenter1';
const keyspace = process.env.CASSANDRA_KEYSPACE ?? 'ordexa_read';

export const cassandraClient = new Client({
  contactPoints,
  localDataCenter,
  keyspace,
  queryOptions: { prepare: true },
});

export async function connectCassandra() {
  if (!cassandraClient.connect  ) {
    await cassandraClient.connect();
  }
}

export async function shutdownCassandra() {
  await cassandraClient.shutdown();
}