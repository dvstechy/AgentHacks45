import Link from "next/link";
import { ArrowRight, CheckCircle2, Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const perks = [
  { icon: CheckCircle2, text: "No credit card required" },
  { icon: Clock, text: "Setup in under 10 minutes" },
  { icon: Lock, text: "Enterprise-grade security" },
];

export function CTASection() {
  return (
    <section id="contact" className="py-14 md:py-20">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center shadow-sm md:p-12">
          {/* Background pattern */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          </div>

          {/* Label */}
          <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Get started today
          </p>

          <h2 className="text-balance text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
            Ready to simplify your inventory operations?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Launch quickly, onboard your teams, and start running daily stock
            movements with less manual effort.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="h-11 w-full gap-2 rounded-xl px-8 shadow-md sm:w-auto"
              >
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                variant="outline"
                size="lg"
                className="h-11 w-full rounded-xl px-8 sm:w-auto"
              >
                Sign in to workspace
              </Button>
            </Link>
          </div>

          {/* Trust perks row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
