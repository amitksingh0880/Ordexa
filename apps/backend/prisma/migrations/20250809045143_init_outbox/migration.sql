/*
  Warnings:

  - You are about to drop the column `userId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `aggregateId` on the `OutboxEvent` table. All the data in the column will be lost.
  - You are about to drop the column `aggregateType` on the `OutboxEvent` table. All the data in the column will be lost.
  - You are about to drop the column `eventType` on the `OutboxEvent` table. All the data in the column will be lost.
  - You are about to drop the column `processed` on the `OutboxEvent` table. All the data in the column will be lost.
  - Added the required column `customerId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic` to the `OutboxEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `OutboxEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "userId",
ADD COLUMN     "customerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OutboxEvent" DROP COLUMN "aggregateId",
DROP COLUMN "aggregateType",
DROP COLUMN "eventType",
DROP COLUMN "processed",
ADD COLUMN     "key" TEXT,
ADD COLUMN     "retries" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "topic" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "OutboxDlq" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "key" TEXT,
    "payload" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutboxDlq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutboxEvent_status_idx" ON "OutboxEvent"("status");
