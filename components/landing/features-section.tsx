import {
  BarChart3,
  Box,
  Globe,
  ShieldCheck,
  Truck,
  Warehouse,
} from "lucide-react";

const features = [
  {
    icon: Warehouse,
    title: "Multi-warehouse control",
    description:
      "Model sites, zones, and bins with clean hierarchy so operators always pick from the right location.",
  },
  {
    icon: Box,
    title: "Product traceability",
    description:
      "Track lots, serials, and variants with fast lookup across inbound, storage, and outbound flow.",
  },
  {
    icon: Truck,
    title: "Automated transfers",
    description:
      "Route receipts, deliveries, and internal movements with less manual coordination.",
  },
  {
    icon: BarChart3,
    title: "Realtime analytics",
    description:
      "See turn rate, aging stock, and valuation metrics in one operational command view.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based security",
    description:
      "Give each team the right permissions and keep an audit trail for every stock mutation.",
  },
  {
    icon: Globe,
    title: "Global-ready setup",
    description:
      "Scale to new regions with configurable units, taxes, and localized workflows.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="container mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      {/* Section header */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          Features
        </p>
        <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          Tools designed for modern inventory teams
        </h2>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">
          Clear workflows, reliable data, and less manual effort across your operations.
        </p>
      </div>

      {/* Feature cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
        {features.map(({ icon: Icon, title, description }, i) => (
          <div
            key={title}
            className="group flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Icon */}
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/20">
              <Icon className="h-5 w-5" />
            </div>

            <div>
              <h3 className="mb-1.5 font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
