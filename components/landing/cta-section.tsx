import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -z-10"></div>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center gap-8 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to optimize your inventory?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Join thousands of businesses that trust IMS to manage their
            stock efficiently. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base rounded-full shadow-lg shadow-primary/20">
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="#">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base rounded-full">
                Contact Sales
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
