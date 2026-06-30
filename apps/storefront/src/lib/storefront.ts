import { apiHttp } from "./http";
import { STOREFRONT_ENDPOINTS } from "../constants/app";

export interface StorefrontConfig {
  brand: string;
  tagline: string;
  currency: string;
  shipping: {
    flatRate: number;
    freeThreshold: number;
    methods: { id: string; label: string; cost: number; etaDays: number }[];
  };
}

export const storefrontApi = {
  async config(): Promise<StorefrontConfig> {
    const { data } = await apiHttp.get<{ data: StorefrontConfig }>(STOREFRONT_ENDPOINTS.config);
    return data.data;
  },
};
