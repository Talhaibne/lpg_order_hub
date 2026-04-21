import { api, USE_MOCK } from "@/api/client";
import * as mock from "@/api/mockDb";

export async function signup(payload) {
  if (USE_MOCK) {
    const user = mock.createUser(payload);
    mock.setSession(user);
    return { user };
  }
  const { data } = await api.post("/auth/register", payload);
  if (data.token) localStorage.setItem("blpg_token", data.token);
  return data;
}

export async function login({ email, password }) {
  if (USE_MOCK) {
    const user = mock.findUser(email);
    if (!user || user.password !== password) {
      throw new Error("Invalid email or password.");
    }
    mock.setSession(user);
    return { user };
  }
  const { data } = await api.post("/auth/login", { email, password });
  if (data.token) localStorage.setItem("blpg_token", data.token);
  return data;
}

export async function me() {
  if (USE_MOCK) return mock.getSessionUser();
  const { data } = await api.get("/auth/me");
  return data;
}

export async function updateProfile(userId, patch) {
  if (USE_MOCK) {
    return mock.updateUser(userId, patch);
  }
  const { data } = await api.put("/auth/me", patch);
  return data;
}

export async function logout() {
  if (USE_MOCK) {
    mock.clearSession();
    return;
  }
  try { await api.post("/auth/logout"); } catch {}
  localStorage.removeItem("blpg_token");
}
