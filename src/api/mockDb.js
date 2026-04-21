// Tiny localStorage-backed mock to keep the app fully usable
// until the Laravel/MySQL backend is wired in.

const KEYS = {
  users: "blpg_users",
  session: "blpg_session",
  orders: "blpg_orders",
  products: "blpg_products",
  seeded: "blpg_seeded_v2",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------- Default product seed ----------
const DEFAULT_PRODUCTS = [
  { id: 1, name: "12 KG LPG CYLINDER", description: "Standard household LPG cylinder", price: 1940, unit: "cylinder" },
  { id: 2, name: "30 KG LPG CYLINDER", description: "Commercial / restaurant use", price: 0, unit: "cylinder" },
  { id: 3, name: "45 KG LPG CYLINDER", description: "Industrial size cylinder", price: 0, unit: "cylinder" },
];

// ---------- Seeding ----------
function ensureSeeded() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEYS.seeded)) return;

  // Seed admin user if not present
  const users = read(KEYS.users, []);
  const adminEmail = "admin@blpg.test";
  if (!users.some((u) => u.email.toLowerCase() === adminEmail)) {
    users.push({
      id: 1,
      fullName: "Admin User",
      email: adminEmail,
      phone: "0000000000",
      password: "admin123",
      role: "admin",
      address: { house: "—", road: "—", block: "—", area: "—", city: "—" },
    });
    write(KEYS.users, users);
  }

  // Seed products (force refresh on version bump)
  write(KEYS.products, DEFAULT_PRODUCTS);

  localStorage.setItem(KEYS.seeded, "1");
}
ensureSeeded();

export const DELIVERY_CHARGE = 100;

// ---------- Products ----------
export function listProducts() {
  ensureSeeded();
  return read(KEYS.products, DEFAULT_PRODUCTS);
}
export function createProduct(payload) {
  const products = listProducts();
  const id = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
  const product = {
    id,
    name: payload.name,
    description: payload.description || "",
    price: Number(payload.price) || 0,
    unit: payload.unit || "piece",
  };
  products.push(product);
  write(KEYS.products, products);
  return product;
}
export function updateProduct(id, patch) {
  const products = listProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Product not found.");
  products[idx] = { ...products[idx], ...patch, price: Number(patch.price ?? products[idx].price) };
  write(KEYS.products, products);
  return products[idx];
}
export function deleteProduct(id) {
  const products = listProducts().filter((p) => p.id !== id);
  write(KEYS.products, products);
}

// Re-export for backward compatibility
export const PRODUCTS = listProducts();

// ---------- Auth / Users ----------
export function listUsers() {
  ensureSeeded();
  return read(KEYS.users, []);
}
export function findUser(email) {
  return listUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}
export function createUser(payload) {
  const users = listUsers();
  if (users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  const user = { id: Date.now(), role: "user", ...payload };
  users.push(user);
  write(KEYS.users, users);
  return user;
}
export function setSession(user) {
  const session = { userId: user.id, token: `mock-${user.id}-${Date.now()}` };
  write(KEYS.session, session);
  localStorage.setItem("blpg_token", session.token);
  return session;
}
export function getSessionUser() {
  const session = read(KEYS.session, null);
  if (!session) return null;
  return listUsers().find((u) => u.id === session.userId) || null;
}
export function clearSession() {
  localStorage.removeItem(KEYS.session);
  localStorage.removeItem("blpg_token");
}
export function updateUser(userId, patch) {
  const users = listUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("User not found.");
  if (patch.email) {
    const conflict = users.find(
      (u) => u.id !== userId && u.email.toLowerCase() === patch.email.toLowerCase()
    );
    if (conflict) throw new Error("That email is already in use.");
  }
  users[idx] = {
    ...users[idx],
    ...patch,
    address: { ...users[idx].address, ...(patch.address || {}) },
  };
  write(KEYS.users, users);
  return users[idx];
}

// ---------- Orders ----------
// status: "incomplete" | "completed" | "cancelled"
// Legacy "ongoing" treated as "incomplete".
function normalizeStatus(s) {
  if (s === "completed" || s === "cancelled") return s;
  return "incomplete";
}

export function listOrders(userId) {
  return read(KEYS.orders, [])
    .filter((o) => o.userId === userId)
    .map((o) => ({ ...o, status: normalizeStatus(o.status) }));
}

export function listAllOrders() {
  return read(KEYS.orders, []).map((o) => ({ ...o, status: normalizeStatus(o.status) }));
}

export function createOrder(order) {
  const orders = read(KEYS.orders, []);
  const newOrder = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    status: "incomplete",
    ...order,
  };
  orders.unshift(newOrder);
  write(KEYS.orders, orders);
  return newOrder;
}

export function updateOrder(id, patch) {
  const orders = read(KEYS.orders, []);
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error("Order not found.");
  orders[idx] = { ...orders[idx], ...patch };
  write(KEYS.orders, orders);
  return orders[idx];
}

export function completeOrders(ids) {
  const orders = read(KEYS.orders, []);
  const now = new Date().toISOString();
  const idSet = new Set(ids);
  const updated = orders.map((o) =>
    idSet.has(o.id) ? { ...o, status: "completed", completedAt: now } : o
  );
  write(KEYS.orders, updated);
  return updated.filter((o) => idSet.has(o.id));
}

export function cancelOrder(id) {
  return updateOrder(id, { status: "cancelled", cancelledAt: new Date().toISOString() });
}
