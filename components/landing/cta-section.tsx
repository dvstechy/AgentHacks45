import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section id="contact" className="py-16 md:py-20">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-emerald-500/10 via-background to-sky-500/10 p-8 text-center shadow-xl md:p-12">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight md:text-4xl">
            Ready to simplify your inventory operations?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Launch quickly, onboard your teams, and start running daily stock movements with less manual effort.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="h-11 w-full gap-2 rounded-xl px-7 sm:w-auto">
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="h-11 w-full rounded-xl px-7 sm:w-auto">
                Talk to your workspace
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required. Setup takes less than 10 minutes.
          </p>
        </div>
      </div>
    </section>
  );
}
