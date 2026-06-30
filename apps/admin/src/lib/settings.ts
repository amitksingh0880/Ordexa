import { paymentsHttp } from "./http";

export interface ShippingMethod {
  id: string;
  label: string;
  cost: number;
  etaDays: number;
}

export interface PlatformConfig {
  razorpay: { enabled: boolean; keyId: string | null };
  shipping: { currency: string; freeThreshold: number; methods: ShippingMethod[] };
}

export const settingsApi = {
  async config(): Promise<PlatformConfig> {
    const { data } = await paymentsHttp.get<{ data: PlatformConfig }>("/config");
    return data.data;
  },
};
