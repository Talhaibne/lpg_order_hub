import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { format } from "date-fns";
import { CalendarIcon, Minus, Plus, ShoppingCart, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/features/auth/context/AuthContext";
import { fetchProducts, getDeliveryCharge } from "@/features/order/api/products";
import { placeOrder } from "@/features/order/api/orders";

const addressSchema = Yup.object({
  house: Yup.string().trim().required("Required"),
  road: Yup.string().trim().required("Required"),
  block: Yup.string().trim().required("Required"),
  area: Yup.string().trim().required("Required"),
  city: Yup.string().trim().required("Required"),
});

const schema = Yup.object({
  customerName: Yup.string().trim().required("Customer name is required"),
  deliveryDate: Yup.date().required("Pick a delivery date").nullable(),
  sameAsProfile: Yup.boolean(),
  address: addressSchema,
});

export default function Order() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const deliveryCharge = getDeliveryCharge();

  useEffect(() => {
    document.title = "Place an Order — Bashundhara LP Gas";
    fetchProducts()
      .then(setProducts)
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const p = products.find((x) => x.id === Number(id));
          return p ? { ...p, qty } : null;
        })
        .filter(Boolean),
    [cart, products]
  );

  const itemsTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const subtotal = itemsTotal + (cartItems.length ? deliveryCharge : 0);
  const MAX_CYLINDERS = 2;
  const totalCylinders = cartItems.reduce((s, i) => s + i.qty, 0);

  const updateQty = (id, delta) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (delta > 0) {
        const otherTotal = Object.entries(prev).reduce(
          (s, [pid, q]) => (Number(pid) === id ? s : s + q),
          0
        );
        if (otherTotal + next > MAX_CYLINDERS) {
          toast.error(`Maximum ${MAX_CYLINDERS} cylinders per order (Bashundhara R/A policy).`);
          return prev;
        }
      }
      const copy = { ...prev };
      if (next === 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  };
  const addToCart = (id) => updateQty(id, 1);
  const removeItem = (id) => setCart((p) => { const c = {...p}; delete c[id]; return c; });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      customerName: user?.fullName || "",
      deliveryDate: null,
      sameAsProfile: false,
      address: { house: "", road: "", block: "", area: "", city: "" },
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (cartItems.length === 0) {
        toast.error("Your cart is empty.");
        setSubmitting(false);
        return;
      }
      try {
        await placeOrder({
          userId: user.id,
          customerName: values.customerName,
          deliveryDate: values.deliveryDate.toISOString(),
          block: values.address.block,
          houseNumber: values.address.house,
          address: values.address,
          items: cartItems.map((i) => ({
            productId: i.id,
            name: i.name,
            qty: i.qty,
            price: i.price,
          })),
          itemsTotal,
          deliveryCharge,
          subtotal,
          paymentMethod,
        });
        toast.success("Order placed successfully!");
        resetForm();
        setCart({});
        navigate("/orders");
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message || "Failed to place order");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (formik.values.sameAsProfile && user?.address) {
      formik.setFieldValue("address", { ...user.address });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.sameAsProfile]);

  const err = (path) => {
    const parts = path.split(".");
    let touched = formik.touched;
    let errors = formik.errors;
    for (const p of parts) {
      touched = touched?.[p];
      errors = errors?.[p];
    }
    return touched && errors ? errors : null;
  };
  const val = (path) => path.split(".").reduce((v, p) => v?.[p], formik.values);

  const renderAddr = (name, label) => (
    <div className="space-y-1" key={name}>
      <FloatingInput
        id={name}
        name={name}
        label={label}
        value={val(name) || ""}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        disabled={formik.values.sameAsProfile}
        error={!!err(name)}
        aria-invalid={!!err(name)}
      />
      {err(name) && <p className="text-xs text-destructive">{err(name)}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/40">
      <Topbar />
      <main className="container-page py-8 md:py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Place an Order</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose your products, schedule delivery, and confirm your address.
            </p>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} className="grid gap-6 lg:grid-cols-3" noValidate>
          <div className="order-1 space-y-0 lg:col-span-2">
            <div className="rounded-xl border border-border bg-card shadow-card divide-y divide-border">
              {/* Customer + Delivery */}
              <section className="p-5 sm:p-6">
                <h2 className="text-base font-semibold text-foreground">Delivery date</h2>
                <p className="text-xs text-muted-foreground">When should we deliver?</p>
                <div className="mt-3">
                  <Popover open={deliveryOpen} onOpenChange={setDeliveryOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "relative flex h-10 w-full items-center rounded-md border border-input bg-background px-3 pt-3 pb-1 text-left text-sm transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                          err("deliveryDate") && "border-destructive"
                        )}
                      >
                        <span className="pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-background px-1 text-xs text-muted-foreground">
                          Delivery date
                        </span>
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className={cn(!formik.values.deliveryDate && "text-muted-foreground")}>
                          {formik.values.deliveryDate
                            ? format(formik.values.deliveryDate, "PPP")
                            : "Pick a date"}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formik.values.deliveryDate || undefined}
                        onSelect={(d) => {
                          formik.setFieldValue("deliveryDate", d || null);
                          setDeliveryOpen(false);
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  {err("deliveryDate") && (
                    <p className="mt-1 text-xs text-destructive">{err("deliveryDate")}</p>
                  )}
                </div>
              </section>

              {/* Products */}
              <section>
                <div className="flex items-center justify-between p-5 sm:px-6 sm:py-5">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Available products</h2>
                    <p className="text-xs text-muted-foreground">
                      Tap Add to put items in your cart. Max {MAX_CYLINDERS} cylinders per order.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {totalCylinders}/{MAX_CYLINDERS}
                  </span>
                </div>
                <ul className="divide-y divide-border border-t border-border">
                  {loading && (
                    <li className="p-6 text-sm text-muted-foreground">Loading products…</li>
                  )}
                  {!loading && products.map((p) => {
                    const inCart = cart[p.id] || 0;
                    return (
                      <li key={p.id} className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold sm:h-12 sm:w-12">
                          {p.name.match(/(\d+)/)?.[0] || "LP"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{p.description}</p>
                          <p className="mt-1 text-sm font-semibold text-primary">
                            ৳{p.price.toLocaleString()}{" "}
                            <span className="text-xs font-normal text-muted-foreground">/ {p.unit}</span>
                          </p>
                        </div>
                        {inCart > 0 ? (
                          <div className="flex shrink-0 items-center gap-1 rounded-md border border-border bg-background p-0.5">
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQty(p.id, -1)}>
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-7 text-center text-sm font-medium">{inCart}</span>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQty(p.id, 1)}>
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <Button type="button" size="sm" className="shrink-0" onClick={() => addToCart(p.id)}>
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* Address */}
              <section className="p-5 sm:p-6">
                <h2 className="text-base font-semibold text-foreground">Delivery address</h2>
                <label className="mt-3 flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={formik.values.sameAsProfile}
                    onCheckedChange={(v) => formik.setFieldValue("sameAsProfile", !!v)}
                  />
                  <span>Same as profile address</span>
                </label>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <FloatingInput
                      id="customerName"
                      name="customerName"
                      label="Customer name"
                      value={formik.values.customerName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={!!err("customerName")}
                      aria-invalid={!!err("customerName")}
                    />
                    {err("customerName") && (
                      <p className="text-xs text-destructive">{err("customerName")}</p>
                    )}
                  </div>
                  {renderAddr("address.house", "House")}
                  {renderAddr("address.road", "Road")}
                  {renderAddr("address.block", "Block")}
                  {renderAddr("address.area", "Area")}
                  <div className="sm:col-span-2">
                    {renderAddr("address.city", "City")}
                  </div>
                </div>
              </section>
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-6 hidden w-full bg-primary hover:bg-primary/90 lg:inline-flex"
              disabled={formik.isSubmitting}
            >
              <CheckCircle2 className="h-4 w-4" />
              {formik.isSubmitting ? "Placing order…" : `Place Order • ৳${subtotal.toLocaleString()}`}
            </Button>
          </div>

          <aside className="order-2 lg:col-span-1">
            <div className="rounded-xl border border-border bg-card shadow-card lg:sticky lg:top-20">
              <div className="flex items-center gap-2 border-b border-border p-5">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Your cart</h2>
                <span className="ml-auto text-xs text-muted-foreground">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="max-h-[420px] overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Your cart is empty. Add products to get started.
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {cartItems.map((i) => (
                      <li key={i.id} className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{i.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ৳{i.price.toLocaleString()} × {i.qty}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            ৳{(i.price * i.qty).toLocaleString()}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center gap-1 rounded-md border border-border bg-background p-0.5">
                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQty(i.id, -1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-xs font-medium">{i.qty}</span>
                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQty(i.id, 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button type="button" variant="ghost" size="sm" className="ml-auto h-7 px-2 text-muted-foreground hover:text-destructive" onClick={() => removeItem(i.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="border-t border-border p-5">
                  <p className="mb-2 text-sm font-medium text-foreground">Payment method</p>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-2.5 text-sm hover:bg-secondary/40">
                      <RadioGroupItem value="cod" id="pm-cod" />
                      <span>Cash on delivery</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-2.5 text-sm hover:bg-secondary/40">
                      <RadioGroupItem value="pocket" id="pm-pocket" />
                      <span>Pocket</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-2.5 text-sm hover:bg-secondary/40">
                      <RadioGroupItem value="bkash" id="pm-bkash" />
                      <span>Bkash</span>
                    </label>
                  </RadioGroup>
                </div>
              )}

              <div className="space-y-2 border-t border-border bg-secondary/40 p-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items total</span>
                  <span className="font-medium">৳{itemsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery charge</span>
                  <span className="font-medium">
                    {cartItems.length ? `৳${deliveryCharge.toLocaleString()}` : "—"}
                  </span>
                </div>
                <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-bold text-foreground">
                  <span>Subtotal</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </aside>

          <Button
            type="submit"
            size="lg"
            className="order-3 w-full bg-primary hover:bg-primary/90 lg:hidden"
            disabled={formik.isSubmitting}
          >
            <CheckCircle2 className="h-4 w-4" />
            {formik.isSubmitting ? "Placing order…" : `Place Order • ৳${subtotal.toLocaleString()}`}
          </Button>
        </form>
      </main>
    </div>
  );
}
