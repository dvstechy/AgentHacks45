import { Warehouse, Boxes, Gauge, Clock3 } from "lucide-react";

const stats = [
  { value: "99.9%", label: "System uptime", icon: Gauge },
  { value: "50k+", label: "Products tracked", icon: Boxes },
  { value: "120+", label: "Warehouse lanes", icon: Warehouse },
  { value: "24/7", label: "Ops monitoring", icon: Clock3 },
];

export function StatsSection() {
  return (
    <section id="results" className="border-y bg-muted/40">
      <div className="container mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="rounded-xl border bg-background/80 p-4 text-center">
              <Icon className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-2xl font-extrabold text-foreground md:text-3xl">{value}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground md:text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
