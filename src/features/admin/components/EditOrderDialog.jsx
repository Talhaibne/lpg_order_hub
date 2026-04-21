import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { updateOrder as apiUpdateOrder } from "@/features/admin/api/orders";

const DELIVERY_CHARGE = 100;

export default function EditOrderDialog({ order, open, onOpenChange, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  useEffect(() => {
    if (order) {
      setForm({
        customerName: order.customerName || "",
        deliveryDate: order.deliveryDate ? new Date(order.deliveryDate) : null,
        block: order.block || "",
        houseNumber: order.houseNumber || "",
        address: { ...(order.address || {}) },
        items: (order.items || []).map((i) => ({ ...i })),
      });
    }
  }, [order]);

  if (!order || !form) return null;

  const setItemQty = (productId, qty) => {
    setForm((f) => ({
      ...f,
      items: f.items
        .map((i) => (i.productId === productId ? { ...i, qty: Math.max(0, qty) } : i))
        .filter((i) => i.qty > 0),
    }));
  };

  const itemsTotal = form.items.reduce((s, i) => s + i.price * i.qty, 0);
  const subtotal = itemsTotal + (form.items.length ? DELIVERY_CHARGE : 0);

  const handleSave = async () => {
    if (!form.customerName.trim()) return toast.error("Customer name is required");
    if (!form.deliveryDate) return toast.error("Delivery date is required");
    if (!form.block.trim()) return toast.error("Block is required");
    if (!form.houseNumber.trim()) return toast.error("House number is required");
    if (form.items.length === 0) return toast.error("Order must have at least one item");

    setSaving(true);
    try {
      const updated = await apiUpdateOrder(order.id, {
        customerName: form.customerName.trim(),
        deliveryDate: form.deliveryDate.toISOString(),
        block: form.block.trim(),
        houseNumber: form.houseNumber.trim(),
        address: form.address,
        items: form.items,
        itemsTotal,
        deliveryCharge: DELIVERY_CHARGE,
        subtotal,
      });
      toast.success("Order updated");
      onSaved?.(updated);
      onOpenChange(false);
    } catch (e) {
      toast.error(e.message || "Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit order #{order.id}</DialogTitle>
          <DialogDescription>Update delivery info and item quantities.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FloatingInput
                label="Customer name"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Delivery date</Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.deliveryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.deliveryDate ? format(form.deliveryDate, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.deliveryDate || undefined}
                    onSelect={(d) => {
                      setForm({ ...form, deliveryDate: d || null });
                      setDateOpen(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <FloatingInput
                label="Block"
                value={form.block}
                onChange={(e) => setForm({ ...form, block: e.target.value })}
              />
            </div>
            <div>
              <FloatingInput
                label="House number"
                value={form.houseNumber}
                onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Items</Label>
            {form.items.length === 0 ? (
              <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
                No items.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-md border border-border">
                {form.items.map((i) => (
                  <li key={i.productId} className="flex items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">৳{i.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setItemQty(i.productId, i.qty - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{i.qty}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setItemQty(i.productId, i.qty + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setItemQty(i.productId, 0)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex justify-end gap-4 text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-semibold">৳{subtotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
