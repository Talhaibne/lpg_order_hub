import { api, USE_MOCK } from "@/api/client";
import { listProducts, DELIVERY_CHARGE } from "@/api/mockDb";

export async function fetchProducts() {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 250));
    return listProducts();
  }
  const { data } = await api.get("/products");
  return data;
}

export function getDeliveryCharge() {
  return DELIVERY_CHARGE;
}
