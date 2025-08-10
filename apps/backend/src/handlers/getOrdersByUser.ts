
import { SELECT_ORDERS_BY_USER } from '../cassandra/queries';
import type { Request, Response } from 'express';
import { cassandraClient } from '../kafka/utils/cassandra';

export async function getOrdersByUserHandler(ctx: any) {
  const { request, response } = ctx;
  const userId = ctx.request.params.userId;
  const limit = Math.min(100, Number(ctx.request.query.limit ?? 25));
  const pagingState = ctx.request.query.pagingState;

  if (!userId || typeof userId !== 'string') {
    return { status: 400, body: { error: 'Invalid userId' } };
  }

  try {
    await cassandraClient.connect();

    const queryOptions: any = { prepare: true, fetchSize: limit };
    if (pagingState) queryOptions.pageState = Buffer.from(pagingState, 'base64');

    const result = await cassandraClient.execute(SELECT_ORDERS_BY_USER, [userId], queryOptions);

    const nextPagingState = result.pageState ? Buffer.from(result.pageState).toString('base64') : undefined;

    const orders = result.rows.map(r => ({
      orderId: r.order_id?.toString(),
      userId: r.user_id,
      status: r.status,
      totalAmount: r.total_amount,
      createdAt: r.created_at,
    }));

    return {
      status: 200,
      body: { orders, pagingState: nextPagingState, limit },
    };
  } catch (err) {
    console.error('Cassandra read error', err);
    return { status: 500, body: { error: 'Internal Server Error' } };
  }
}