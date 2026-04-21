import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Truck, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import Topbar from "@/components/Topbar";
import heroImg from "@/assets/cylinders-transparent.png";
import bgImg from "@/assets/hero-cylinders.jpg";

const ABOUT_TEXT = `Bashundhara LP Gas Ltd. is an enterprise of the pioneering business conglomerate of the country, Sanvir Bashundhara Group. Bashundhara LP Gas is the first LP Gas importer, cylinder distributor, cylinder manufacture and marketing company of the country in the private sector. Their first plant was established adjacent to the Mongla Port. Subsequently, Sundarban Industrial Complex Ltd., a sister concern of Bashundhara LP Gas, the largest cylinder manufacturing plant in the country was established in 2011. Over the years, they continued to consolidate their position through quality and safe products, the scale of production, after-sales service, and a huge distribution network.`;

const FEATURES = [
  { icon: ShieldCheck, title: "Safe & Certified", desc: "Quality LPG cylinders meeting strict safety standards." },
  { icon: Truck, title: "Bashundhara R/A Delivery", desc: "Fast home delivery within Bashundhara R/A — order received to doorstep in 3 hours." },
  { icon: Factory, title: "Largest Manufacturer", desc: "Sundarban Industrial Complex — largest plant in the country." },
];

export default function Landing() {
  const { user } = useAuth();
  const orderHref = user ? "/order" : "/signup";

  return (
    <div className="min-h-screen bg-background">
      <Topbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero">
        {/* Vague cylinder background */}
        <div className="absolute inset-0" aria-hidden="true">
          <img
            src={bgImg}
            alt=""
            className="h-full w-full object-cover opacity-20 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-hero via-hero/85 to-hero/40" />
        </div>

        <div className="container-page relative py-10 sm:py-16 md:py-24 lg:py-28">
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
            {/* TEXT COLUMN */}
            <div className="flex flex-col animate-fade-in">
              <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-primary sm:mb-4 sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Trusted LPG Provider
              </span>

              {/* Mobile: heading + small image side-by-side */}
              <div className="flex items-center gap-3 md:block">
                <h1 className="flex-1 text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl md:text-5xl lg:text-6xl">
                  Safe, reliable LPG <br className="hidden sm:block" />
                  delivered to your door.
                </h1>
                <img
                  src={heroImg}
                  alt="Bashundhara LP Gas cylinders"
                  className="h-24 w-auto shrink-0 drop-shadow-xl sm:h-32 md:hidden"
                  loading="eager"
                />
              </div>

              <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base md:mt-6 md:text-lg">
                {ABOUT_TEXT}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-8">
                <Button
                  asChild
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-elevated"
                >
                  <Link to={orderHref}>
                    Order Now <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                {!user && (
                  <Button asChild size="lg" variant="outline">
                    <Link to="/login">I already have an account</Link>
                  </Button>
                )}
              </div>
            </div>

            {/* IMAGE COLUMN — desktop/tablet only */}
            <div className="relative hidden items-center justify-center md:flex">
              <div className="absolute inset-0 -z-10 mx-auto h-72 w-72 rounded-full bg-primary/10 blur-3xl sm:h-96 sm:w-96" aria-hidden="true" />
              <img
                src={heroImg}
                alt="Bashundhara LP Gas cylinders in 12kg, 28kg and 37.8kg sizes"
                className="relative h-auto w-full max-w-md drop-shadow-2xl"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-page py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-elevated"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container-page text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Bashundhara LP Gas Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
