import {
  BarChart3,
  Box,
  Globe,
  ShieldCheck,
  Truck,
  Warehouse,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Warehouse,
    title: "Multi-warehouse control",
    description:
      "Model sites, zones, and bins with clean hierarchy so operators always pick from the right location.",
    accent: "text-sky-600 bg-sky-500/10",
  },
  {
    icon: Box,
    title: "Product traceability",
    description:
      "Track lots, serials, and variants with fast lookup across inbound, storage, and outbound flow.",
    accent: "text-emerald-600 bg-emerald-500/10",
  },
  {
    icon: Truck,
    title: "Automated transfers",
    description:
      "Route receipts, deliveries, and internal movements with less manual coordination.",
    accent: "text-amber-600 bg-amber-500/10",
  },
  {
    icon: BarChart3,
    title: "Realtime analytics",
    description:
      "See turn rate, aging stock, and valuation metrics in one operational command view.",
    accent: "text-indigo-600 bg-indigo-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Role-based security",
    description:
      "Give each team the right permissions and keep an audit trail for every stock mutation.",
    accent: "text-rose-600 bg-rose-500/10",
  },
  {
    icon: Globe,
    title: "Global-ready setup",
    description:
      "Scale to new regions with configurable units, taxes, and localized workflows.",
    accent: "text-cyan-600 bg-cyan-500/10",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="container mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Features</p>
        <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          Tools designed for modern inventory teams
        </h2>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">
          Clear workflows, reliable data, and less manual effort across your operations.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {features.map(({ icon: Icon, title, description, accent }) => (
          <Card key={title} className="border-border/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
