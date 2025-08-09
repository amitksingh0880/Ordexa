import { Client } from 'cassandra-driver';

export const cassandra = new Client({
  contactPoints: process.env.CASSANDRA_CONTACT_POINTS?.split(',') || ['127.0.0.1'],
  localDataCenter: process.env.CASSANDRA_DATACENTER || 'datacenter1',
  keyspace: process.env.CASSANDRA_KEYSPACE || 'ordexa_read'
});

export async function initCassandra() {
  try {
    await cassandra.connect();
    console.log('[Cassandra] Connected to cluster:', cassandra.hosts.keys());
  } catch (err) {
    console.error('[Cassandra] Connection error:', err);
    process.exit(1);
  }
}
