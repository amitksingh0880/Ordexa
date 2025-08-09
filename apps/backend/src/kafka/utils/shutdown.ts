// src/kafka/utils/shutdown.ts
export function gracefulShutdown(cleanupFn: () => Promise<void>) {
  const signals = ["SIGINT", "SIGTERM"];

  for (const signal of signals) {
    process.on(signal, () => {
      console.log(`🛑 Received ${signal}`);
      cleanupFn().catch((e) => {
        console.error("Failed during shutdown:", e);
        process.exit(1);
      });
    });
  }
}
