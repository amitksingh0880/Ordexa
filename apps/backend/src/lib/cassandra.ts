import { Client } from "cassandra-driver";

export const cassandra = new Client({
  contactPoints: ["localhost"],
  localDataCenter: "dc1",
  keyspace: "ordexa_read",
});
