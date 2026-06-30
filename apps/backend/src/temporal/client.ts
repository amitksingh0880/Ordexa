import { Client, Connection } from "@temporalio/client";
import { config } from "../config/env";

// Temporal is OFF unless TEMPORAL_ADDRESS is set (see config.temporal.enabled).
// On Render's free tier we run the DB-durable in-process path instead (see
// orderOrchestrator). Locally, set TEMPORAL_ADDRESS=localhost:7233 to drive
// orders via Temporal.
export function isTemporalEnabled(): boolean {
  return config.temporal.enabled;
}

let clientPromise: Promise<Client> | null = null;

export async function getTemporalClient(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const connection = await Connection.connect({ address: config.temporal.address });
      return new Client({ connection, namespace: config.temporal.namespace });
    })();
  }
  return clientPromise;
}
