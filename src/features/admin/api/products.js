import { api, USE_MOCK } from "@/api/client";
import * as mock from "@/api/mockDb";

export async function fetchAdminProducts() {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 150));
    return mock.listProducts();
  }
  const { data } = await api.get("/admin/products");
  return data;
}

export async function createProduct(payload) {
  if (USE_MOCK) return mock.createProduct(payload);
  const { data } = await api.post("/admin/products", payload);
  return data;
}

export async function updateProduct(id, patch) {
  if (USE_MOCK) return mock.updateProduct(id, patch);
  const { data } = await api.put(`/admin/products/${id}`, patch);
  return data;
}

export async function deleteProduct(id) {
  if (USE_MOCK) return mock.deleteProduct(id);
  await api.delete(`/admin/products/${id}`);
}
