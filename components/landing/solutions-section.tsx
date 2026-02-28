import { ArrowRight, CheckCircle2, Handshake, ScanLine, Workflow } from "lucide-react";

const steps = [
  {
    icon: ScanLine,
    step: "01",
    title: "Capture",
    description: "Scan inbound stock and validate quantity at source.",
  },
  {
    icon: Workflow,
    step: "02",
    title: "Route",
    description: "Auto-assign putaway and transfer tasks to the right team.",
  },
  {
    icon: CheckCircle2,
    step: "03",
    title: "Confirm",
    description: "Close moves with full auditability and realtime status updates.",
  },
];

const benefits = [
  "Faster receiving and dispatch cycles",
  "Reduced stock variance and reconciliation work",
  "Higher team accountability with clear ownership",
];

export function SolutionsSection() {
  return (
    <section id="solutions" className="bg-muted/30 py-14 md:py-20">
      <div className="container mx-auto grid max-w-6xl gap-10 px-4 md:px-6 lg:grid-cols-2 lg:items-center">
        {/* Left — copy */}
        <div className="space-y-5">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Why teams choose IMS
          </p>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Built for operational flow,{" "}
            <span className="text-primary">not spreadsheet patchwork</span>
          </h2>
          <p className="text-base text-muted-foreground md:text-lg">
            Standardize receiving, picking, and delivery with one reliable
            process layer that scales.
          </p>

          <ul className="space-y-2.5 pt-1">
            {benefits.map((text) => (
              <li key={text} className="flex items-start gap-2.5 text-sm md:text-base">
                <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-500" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — workflow card */}
        <div className="rounded-2xl border bg-card p-5 shadow-xl md:p-7">
          {/* Header */}
          <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold leading-tight">Operational Workflow</p>
              <p className="text-sm text-muted-foreground">From inbound to outbound</p>
            </div>
          </div>

          {/* Steps */}
          <div className="relative space-y-3">
            {/* Connector line */}
            <div className="absolute left-[22px] top-8 h-[calc(100%-4rem)] w-px bg-border/60" />

            {steps.map(({ icon: Icon, step, title, description }) => (
              <div
                key={title}
                className="group relative flex items-start gap-4 rounded-xl border border-border/60 bg-background/70 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-background"
              >
                {/* Step number circle */}
                <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{title}</p>
                    <span className="text-[10px] font-mono text-muted-foreground/60">{step}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline cursor-pointer">
            See your full process in one system
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
