import { useEffect, useState } from "react";
import { Info, MapPin, Package, Clock, Truck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "blpg.policyAcknowledged.v1";

const policies = [
  {
    icon: MapPin,
    title: "Service area",
    text: "Currently available only inside Bashundhara R/A. Nationwide delivery is not offered yet.",
  },
  {
    icon: Package,
    title: "Order limit per flat",
    text: "Maximum 2 cylinders or refills per home delivery order.",
  },
  {
    icon: Clock,
    title: "Delivery hours",
    text: "Home delivery operates from 8:00 AM to 10:00 PM.",
  },
  {
    icon: Truck,
    title: "Delivery time",
    text: "Your order will be delivered within 3 hours of being received.",
  },
];

export default function PolicyModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // small delay so it doesn't slam open on first paint
        const t = setTimeout(() => setOpen(true), 400);
        return () => clearTimeout(t);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  const handleAcknowledge = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : handleAcknowledge())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Info className="h-5 w-5" />
          </div>
          <DialogTitle className="text-center">Before you order</DialogTitle>
          <DialogDescription className="text-center">
            A few things to know about our home delivery service.
          </DialogDescription>
        </DialogHeader>

        <ul className="mt-2 space-y-3">
          {policies.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <DialogFooter className="mt-2">
          <Button onClick={handleAcknowledge} className="w-full sm:w-auto">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
