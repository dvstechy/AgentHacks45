import { getSession } from "@/lib/session";
import { SiteHeader } from "@/components/landing/site-header";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsSection } from "@/components/landing/stats-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { SolutionsSection } from "@/components/landing/solutions-section";
import { CTASection } from "@/components/landing/cta-section";
import { SiteFooter } from "@/components/landing/site-footer";

export default async function Home() {
  const session = await getSession();
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans selection:bg-primary/20">
      <SiteHeader session={session} />
      <main className="flex-1">
        <HeroSection session={session} />
        <StatsSection />
        <FeaturesSection />
        <SolutionsSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  );
}
