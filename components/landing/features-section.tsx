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
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="bg-card shadow-sm border-border/40 transition-colors hover:border-primary/30 hover:bg-muted/10">
            <CardHeader>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
