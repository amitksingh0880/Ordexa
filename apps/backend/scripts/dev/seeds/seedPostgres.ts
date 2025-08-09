import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Sample users (could be replaced with your actual user IDs)
  const users = ['user-1', 'user-2'];

  for (const userId of users) {
    // Create an order
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'Created',
        totalAmount: 120.50,
        currency: 'USD',
        description: `Test order for ${userId}`,
      },
    });

    // Create an OutboxEvent for the order
    await prisma.outboxEvent.create({
      data: {
        aggregateId: order.id,
        aggregateType: 'Order',
        eventType: 'OrderCreated',
        payload: {
          orderId: order.id,
          userId: order.userId,
          status: order.status,
          totalAmount: order.totalAmount,
          currency: order.currency,
          createdAt: order.createdAt,
        },
        processed: false,
      },
    });

    console.log(`✅ Created order & outbox event for ${userId}`);
  }

  console.log('🌱 Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
