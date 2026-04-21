import { api, USE_MOCK } from "@/api/client";
import * as mock from "@/api/mockDb";

export async function placeOrder(payload) {
  if (USE_MOCK) {
    return mock.createOrder(payload);
  }
  const { data } = await api.post("/orders", payload);
  return data;
}

export async function fetchOrders(userId) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return mock.listOrders(userId);
  }
  const { data } = await api.get("/orders");
  return data;
}
