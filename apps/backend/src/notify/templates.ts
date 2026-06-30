import { DEFAULT_TENANT } from "../constants/arn";
import type { Email } from "./mailer";

interface OrderLine {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderEmailData {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  customerName?: string | null;
  customerEmail?: string | null;
  items?: unknown;
}

const brand = DEFAULT_TENANT.name;

const linesTable = (items: unknown): string => {
  const lines = Array.isArray(items) ? (items as OrderLine[]) : [];
  return lines
    .map((l) => `<tr><td>${l.name}</td><td>×${l.quantity}</td><td>${l.price}</td></tr>`)
    .join("");
};

const shell = (heading: string, body: string): string =>
  `<div style="font-family:sans-serif;max-width:480px"><h2>${heading}</h2>${body}<p style="color:#888">— ${brand}</p></div>`;

export const orderConfirmationEmail = (order: OrderEmailData): Email => ({
  to: order.customerEmail ?? "",
  subject: `Your ${brand} order is confirmed`,
  html: shell(
    `Thanks${order.customerName ? `, ${order.customerName}` : ""}!`,
    `<p>Order <strong>#${order.id.slice(0, 8)}</strong> is confirmed.</p>
     <table>${linesTable(order.items)}</table>
     <p><strong>Total:</strong> ${order.totalAmount} ${order.currency}</p>`,
  ),
});

export const orderStatusEmail = (order: OrderEmailData): Email => ({
  to: order.customerEmail ?? "",
  subject: `Your ${brand} order is ${order.status.toLowerCase()}`,
  html: shell(
    `Order update`,
    `<p>Order <strong>#${order.id.slice(0, 8)}</strong> is now <strong>${order.status}</strong>.</p>`,
  ),
});
