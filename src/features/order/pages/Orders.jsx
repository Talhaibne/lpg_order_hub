import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Package } from "lucide-react";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { fetchOrders } from "@/features/order/api/orders";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "ongoing", label: "Ongoing" },
  { key: "past", label: "Past" },
];

function isPast(order) {
  if (order.status === "delivered" || order.status === "cancelled") return true;
  // Treat orders with delivery date in the past as past as well
  if (order.deliveryDate && new Date(order.deliveryDate) < new Date(new Date().setHours(0,0,0,0))) {
    return true;
  }
  return false;
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ongoing");

  useEffect(() => {
    document.title = "My Orders — Bashundhara LP Gas";
    if (!user) return;
    fetchOrders(user.id)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    return orders.filter((o) => (tab === "past" ? isPast(o) : !isPast(o)));
  }, [orders, tab]);

  return (
    <div className="min-h-screen bg-secondary/40">
      <Topbar />
      <main className="container-page py-8 md:py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">View ongoing deliveries and your order history.</p>
        </div>

        {/* Toggle */}
        <div className="mb-4 inline-flex rounded-lg border border-border bg-card p-1 shadow-card">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card shadow-card">
          {loading ? (
            <div className="p-8 text-sm text-muted-foreground">Loading orders…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-medium text-foreground">No {tab} orders</p>
              <p className="text-xs text-muted-foreground">
                {tab === "ongoing" ? "You don't have any ongoing orders." : "Past orders will show here."}
              </p>
              {tab === "ongoing" && (
                <Button asChild size="sm" className="mt-4">
                  <a href="/order">Place an order</a>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Order ID</th>
                    <th className="px-4 py-3 text-left">Placed</th>
                    <th className="px-4 py-3 text-left">Delivery</th>
                    <th className="px-4 py-3 text-left">Items</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((o) => (
                    <tr key={o.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{o.id}</td>
                      <td className="px-4 py-3">{format(new Date(o.createdAt), "PP")}</td>
                      <td className="px-4 py-3">{format(new Date(o.deliveryDate), "PP")}</td>
                      <td className="px-4 py-3">
                        <span className="text-foreground">
                          {o.items.reduce((s, i) => s + i.qty, 0)} items
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({o.items.map((i) => `${i.qty}× ${i.name.split(" ").slice(0,3).join(" ")}`).join(", ")})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">৳{o.subtotal.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            isPast(o)
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {isPast(o) ? (o.status === "cancelled" ? "Cancelled" : "Delivered") : "Ongoing"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
