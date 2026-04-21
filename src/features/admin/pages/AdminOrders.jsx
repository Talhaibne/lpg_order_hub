import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  CalendarIcon,
  CheckCircle2,
  Download,
  Filter,
  Pencil,
  XCircle,
  X,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AdminLayout from "@/features/admin/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { fetchAllOrders, completeOrders, cancelOrder } from "@/features/admin/api/orders";
import { PaginationBar, usePagination } from "@/features/admin/components/PaginationBar";
import EditOrderDialog from "@/features/admin/components/EditOrderDialog";

function formatItems(order) {
  return (order.items || []).map((i) => `${i.name} × ${i.qty}`).join(", ");
}

function fullAddress(order) {
  const a = order.address || {};
  return [a.house, a.road, a.area, a.city].filter(Boolean).join(", ") || "—";
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [editing, setEditing] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [confirmComplete, setConfirmComplete] = useState(false);

  const load = () => {
    setLoading(true);
    fetchAllOrders()
      .then((all) => setOrders(all.filter((o) => o.status === "incomplete")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = "Admin · Orders";
    load();
  }, []);

  const blocks = useMemo(() => {
    const set = new Set();
    orders.forEach((o) => o.block && set.add(o.block));
    return Array.from(set).sort();
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (blockFilter !== "all" && o.block !== blockFilter) return false;
      if (dateFilter) {
        const d = new Date(o.deliveryDate);
        if (
          d.getFullYear() !== dateFilter.getFullYear() ||
          d.getMonth() !== dateFilter.getMonth() ||
          d.getDate() !== dateFilter.getDate()
        )
          return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${o.customerName || ""} ${o.block || ""} ${o.houseNumber || ""} ${formatItems(o)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, blockFilter, dateFilter, search]);

  const pagination = usePagination(filtered, 10);
  const { pageItems } = pagination;

  const allOnPageSelected =
    pageItems.length > 0 && pageItems.every((o) => selected.has(o.id));
  const someOnPageSelected = pageItems.some((o) => selected.has(o.id));

  const togglePageAll = () => {
    const next = new Set(selected);
    if (allOnPageSelected) {
      pageItems.forEach((o) => next.delete(o.id));
    } else {
      pageItems.forEach((o) => next.add(o.id));
    }
    setSelected(next);
  };

  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectAllFiltered = () => {
    setSelected(new Set(filtered.map((o) => o.id)));
  };

  const clearFilters = () => {
    setBlockFilter("all");
    setDateFilter(null);
    setSearch("");
  };

  const handleComplete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    try {
      await completeOrders(ids);
      toast.success(`${ids.length} order(s) marked complete`);
      setSelected(new Set());
      setConfirmComplete(false);
      load();
    } catch (e) {
      toast.error(e.message || "Failed to complete orders");
    }
  };

  const handleCancel = async () => {
    if (!confirmCancel) return;
    try {
      await cancelOrder(confirmCancel.id);
      toast.success("Order cancelled");
      setConfirmCancel(null);
      load();
    } catch (e) {
      toast.error(e.message || "Failed to cancel");
    }
  };

  const handleExportPdf = () => {
    if (filtered.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Orders Report", 14, 14);
    doc.setFontSize(9);
    const subtitleParts = [`Generated: ${format(new Date(), "PPp")}`];
    if (blockFilter !== "all") subtitleParts.push(`Block: ${blockFilter}`);
    if (dateFilter) subtitleParts.push(`Delivery: ${format(dateFilter, "PP")}`);
    doc.text(subtitleParts.join("  ·  "), 14, 20);

    autoTable(doc, {
      startY: 25,
      head: [["Delivery Date", "Product", "Customer", "Address", "Block", "Number"]],
      body: filtered.map((o) => [
        o.deliveryDate ? format(new Date(o.deliveryDate), "PP") : "—",
        formatItems(o),
        o.customerName || "—",
        fullAddress(o),
        o.block || "—",
        o.houseNumber || "—",
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 124] },
    });
    doc.save(`orders-${format(new Date(), "yyyy-MM-dd-HHmm")}.pdf`);
    toast.success("PDF exported");
  };

  return (
    <AdminLayout title="Orders">
      <div className="rounded-xl border border-border bg-card shadow-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder="Search customer, block, item…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Button
              variant="default"
              size="sm"
              disabled={selected.size === 0}
              onClick={() => setConfirmComplete(true)}
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete ({selected.size})
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={blockFilter} onValueChange={setBlockFilter}>
                <SelectTrigger className="h-9 w-[140px]">
                  <SelectValue placeholder="Block" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All blocks</SelectItem>
                  {blocks.map((b) => (
                    <SelectItem key={b} value={b}>
                      Block {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("h-9", !dateFilter && "text-muted-foreground")}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {dateFilter ? format(dateFilter, "PP") : "Delivery date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={dateFilter || undefined}
                  onSelect={(d) => setDateFilter(d || null)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {(blockFilter !== "all" || dateFilter || search) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleExportPdf}>
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Select-all-filtered banner */}
        {selected.size > 0 && selected.size < filtered.length && allOnPageSelected && (
          <div className="border-b border-border bg-primary/5 px-4 py-2 text-center text-xs text-foreground">
            {selected.size} on this page selected.{" "}
            <button onClick={selectAllFiltered} className="font-medium text-primary hover:underline">
              Select all {filtered.length} filtered orders
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allOnPageSelected ? true : someOnPageSelected ? "indeterminate" : false}
                    onCheckedChange={togglePageAll}
                    aria-label="Select all on page"
                  />
                </TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Block</TableHead>
                <TableHead>Number</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                    No orders match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((o) => (
                  <TableRow key={o.id} data-state={selected.has(o.id) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(o.id)}
                        onCheckedChange={() => toggleOne(o.id)}
                        aria-label={`Select order ${o.id}`}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {o.deliveryDate ? format(new Date(o.deliveryDate), "PP") : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex flex-col gap-0.5">
                        {(o.items || []).map((i, idx) => (
                          <span key={idx} className="text-foreground">
                            {i.name} <span className="text-muted-foreground">× {i.qty}</span>
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{o.customerName || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fullAddress(o)}</TableCell>
                    <TableCell className="text-sm">{o.block || "—"}</TableCell>
                    <TableCell className="text-sm">{o.houseNumber || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditing(o)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setConfirmCancel(o)}
                          aria-label="Cancel"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <PaginationBar {...pagination} />
      </div>

      <EditOrderDialog
        order={editing}
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        onSaved={load}
      />

      <AlertDialog open={!!confirmCancel} onOpenChange={(o) => !o && setConfirmCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              Order #{confirmCancel?.id} will be moved to Cancelled Orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive hover:bg-destructive/90">
              Cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmComplete} onOpenChange={setConfirmComplete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete {selected.size} order(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Selected orders will be moved to Order History.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete}>Complete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
