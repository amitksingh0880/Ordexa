// scripts/dev/checkSeed.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import Table from 'cli-table3';
import chalk from 'chalk';

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany();
  const outboxEvents = await prisma.outboxEvent.findMany();

  // Orders table
  const ordersTable = new Table({
    head: ['ID', 'User ID', 'Status', 'Total Amount', 'Currency', 'Description', 'Created At'],
    colWidths: [38, 10, 10, 14, 10, 25, 25]
  });

  orders.forEach(o => {
    ordersTable.push([
      o.id,
      o.userId,
      o.status,
      o.totalAmount.toString(),
      (o as any).currency || '',
      (o as any).description || '',
      o.createdAt.toISOString()
    ]);
  });

  // OutboxEvents table
  const eventsTable = new Table({
    head: ['ID', 'Aggregate ID', 'Type', 'Event Type', 'Processed', 'Retries', 'Created At'],
    colWidths: [38, 38, 10, 15, 12, 8, 25]
  });

  outboxEvents.forEach(e => {
    const processedCell = e.processed
      ? chalk.green('Yes')
      : chalk.red.bold('No');

    const retriesCell =
      (e as any).retries > 0
        ? chalk.yellow((e as any).retries)
        : chalk.white((e as any).retries ?? '0');

    let row = [
      e.id,
      e.aggregateId,
      e.aggregateType,
      e.eventType,
      processedCell,
      retriesCell,
      e.createdAt.toISOString()
    ];

    // 🚨 Highlight entire row if needs attention
    if (!e.processed && (e as any).retries > 0) {
      row = row.map(cell => chalk.red.bold(cell));
    }

    eventsTable.push(row);
  });

  console.log('\n' + chalk.cyan.bold('Orders:') + '\n');
  console.log(ordersTable.toString());

  console.log('\n' + chalk.cyan.bold('OutboxEvents:') + '\n');
  console.log(eventsTable.toString());

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
