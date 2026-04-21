import { api, USE_MOCK } from "@/api/client";
import * as mock from "@/api/mockDb";

export async function fetchAllOrders() {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 150));
    return mock.listAllOrders();
  }
  const { data } = await api.get("/admin/orders");
  return data;
}

export async function completeOrders(ids) {
  if (USE_MOCK) return mock.completeOrders(ids);
  const { data } = await api.post("/admin/orders/complete", { ids });
  return data;
}

export async function updateOrder(id, patch) {
  if (USE_MOCK) return mock.updateOrder(id, patch);
  const { data } = await api.put(`/admin/orders/${id}`, patch);
  return data;
}

export async function cancelOrder(id) {
  if (USE_MOCK) return mock.cancelOrder(id);
  const { data } = await api.post(`/admin/orders/${id}/cancel`);
  return data;
}
