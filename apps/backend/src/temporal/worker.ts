// Temporal worker: hosts the order workflow + activities. Run as a separate
// process (`npm run worker`) alongside a Temporal server. Only needed when
// TEMPORAL_ADDRESS is configured; the API runs fine without it on the
// DB-durable path.
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NativeConnection, Worker } from "@temporalio/worker";
import * as activities from "./activities";
import { config } from "../config/env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const { address, namespace, taskQueue } = config.temporal;

  if (!address) {
    throw new Error("TEMPORAL_ADDRESS is not set — cannot start the Temporal worker.");
  }

  const connection = await NativeConnection.connect({ address });
  const worker = await Worker.create({
    connection,
    namespace,
    taskQueue,
    workflowsPath: path.join(__dirname, "workflows.ts"),
    activities,
  });

  console.log(`🛠️  Temporal worker connected to ${address} (ns=${namespace}, queue=${taskQueue})`);
  await worker.run();
}

run().catch((err) => {
  console.error("❌ Temporal worker failed:", err);
  process.exit(1);
});
