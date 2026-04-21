import { useEffect, useState } from "react";
import { format } from "date-fns";
import AdminLayout from "@/features/admin/components/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAllOrders } from "@/features/admin/api/orders";
import { PaginationBar, usePagination } from "@/features/admin/components/PaginationBar";

function formatItems(order) {
  return (order.items || []).map((i) => `${i.name} × ${i.qty}`).join(", ");
}
function fullAddress(order) {
  const a = order.address || {};
  return [a.house, a.road, a.area, a.city].filter(Boolean).join(", ") || "—";
}

export default function CancelledOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Admin · Cancelled Orders";
    fetchAllOrders()
      .then((all) => {
        const cancelled = all
          .filter((o) => o.status === "cancelled")
          .sort((a, b) => new Date(b.cancelledAt || 0) - new Date(a.cancelledAt || 0));
        setOrders(cancelled);
      })
      .finally(() => setLoading(false));
  }, []);

  const pagination = usePagination(orders, 10);

  return (
    <AdminLayout title="Cancelled Orders">
      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cancelled</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : pagination.pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    No cancelled orders.
                  </TableCell>
                </TableRow>
              ) : (
                pagination.pageItems.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {o.cancelledAt ? format(new Date(o.cancelledAt), "PP") : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {o.deliveryDate ? format(new Date(o.deliveryDate), "PP") : "—"}
                    </TableCell>
                    <TableCell className="text-sm">{formatItems(o)}</TableCell>
                    <TableCell className="text-sm">{o.customerName || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fullAddress(o)}</TableCell>
                    <TableCell className="text-sm">{o.block || "—"}</TableCell>
                    <TableCell className="text-sm">{o.houseNumber || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <PaginationBar {...pagination} />
      </div>
    </AdminLayout>
  );
}
