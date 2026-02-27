import { ArrowRight, CheckCircle2, Handshake, ScanLine, Workflow } from "lucide-react";

const steps = [
  {
    icon: ScanLine,
    title: "Capture",
    description: "Scan inbound stock and validate quantity at source.",
  },
  {
    icon: Workflow,
    title: "Route",
    description: "Auto-assign putaway and transfer tasks to the right team.",
  },
  {
    icon: CheckCircle2,
    title: "Confirm",
    description: "Close moves with full auditability and realtime status updates.",
  },
];

export function SolutionsSection() {
  return (
    <section id="solutions" className="bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto grid max-w-6xl gap-10 px-4 md:px-6 lg:grid-cols-2 lg:items-center">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Why teams choose IMS</p>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Built for operational flow, not spreadsheet patchwork
          </h2>
          <p className="text-base text-muted-foreground md:text-lg">
            Standardize receiving, picking, and delivery with one reliable process layer that scales.
          </p>

          <div className="space-y-3 pt-2">
            <Benefit text="Faster receiving and dispatch cycles" />
            <Benefit text="Reduced stock variance and reconciliation work" />
            <Benefit text="Higher team accountability with clear ownership" />
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-xl md:p-8">
          <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Operational Workflow</p>
              <p className="text-sm text-muted-foreground">From inbound to outbound</p>
            </div>
          </div>

          <div className="space-y-4">
            {steps.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
            See your full process in one system
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm md:text-base">
      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
      <span>{text}</span>
    </div>
  );
}
