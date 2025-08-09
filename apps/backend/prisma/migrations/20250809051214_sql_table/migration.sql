-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "OutboxEvent" ADD COLUMN     "lastError" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "retries" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "OutboxEvent_aggregateId_idx" ON "OutboxEvent"("aggregateId");

-- CreateIndex
CREATE INDEX "OutboxEvent_processed_idx" ON "OutboxEvent"("processed");
