import { CURRENCY } from "../constants/app";

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
  }).format(amount);

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString();
