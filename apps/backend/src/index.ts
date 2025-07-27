import path from "node:path";
import express from "express";
import OpenAPIBackend from "openapi-backend";
import type { Request as OpenAPIRequest } from "openapi-backend";
import { createOrderHandler } from "./handlers/order";
import { getOrdersHandler } from "./handlers/orders/getOrder";
import { startKafkaConsumer } from "./kafka/consumer/index";
import { connectConsumer } from "./kafka/consumer";
import { connectProducer } from "./kafka/producer";
const app = express();
app.use(express.json());

connectProducer();
connectConsumer();

const api = new OpenAPIBackend({
  definition: path.join(__dirname, "../spec/index.yml"),
  handlers: {
    createOrder: createOrderHandler,
    getOrdersByUser: getOrdersHandler,
    notFound: (_c, _req, res) => res.status(404).json({ error: "Not found" }),
    validationFail: (c, _req, res) =>
      res.status(400).json({ error: c.validation.errors }),
  },
});


api.init();

app.use((req, res) => api.handleRequest(req as OpenAPIRequest, req, res));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});