import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { Hero } from "@/components/landing/hero";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { CTA } from "@/components/landing/cta";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        <Hero />
        <section id="preview" className="mx-auto -mt-4 max-w-6xl px-4 pb-20 md:-mt-6 md:px-6">
          <DashboardPreview />
        </section>
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
      <MarketingFooter />
    </div>
  );
}
