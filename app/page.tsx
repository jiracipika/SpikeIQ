import Link from "next/link";
import { ArrowRight, BarChart3, BrainCircuit, Crosshair, LineChart } from "lucide-react";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: LineChart,
    title: "Win rate trends",
    text: "Spot confidence spikes and consistency drops across your latest sessions.",
  },
  {
    icon: Crosshair,
    title: "Agent + map mastery",
    text: "Understand what to lock, where to queue, and where your edge really is.",
  },
  {
    icon: BrainCircuit,
    title: "Coaching-style insights",
    text: "Actionable tips that translate data into better decisions in ranked.",
  },
  {
    icon: BarChart3,
    title: "Serious dashboard",
    text: "Structured for players who want measurable improvement, not vanity stats.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader />
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 md:px-6 md:pt-24">
        <Badge className="mb-6 w-fit">Built for ranked grinders</Badge>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
          Performance analytics for VALORANT players who want to improve with intent.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          ValorLab helps you turn match history into clear priorities: win rate momentum, agent strengths, map weaknesses,
          and coaching-style insights.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/sign-in">
            <Button size="lg">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              View demo dashboard
            </Button>
          </Link>
        </div>
      </section>

      <section id="features" className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 md:grid-cols-2 md:px-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="bg-card/70">
              <CardHeader>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/20 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.text}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section id="preview" className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
        <Card className="border-primary/20 bg-gradient-to-br from-card to-background">
          <CardHeader>
            <CardTitle>Why this foundation is built for fast iteration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
            <p>Mock-first architecture so UI and flows ship now, data plumbing later.</p>
            <p>Service abstraction keeps Supabase and Riot integrations isolated.</p>
            <p>Modular components make visual refinement in v0 straightforward.</p>
          </CardContent>
        </Card>
      </section>

      <footer id="faq" className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        Foundation build with Next.js App Router, TypeScript, Tailwind, and Recharts.
      </footer>
    </div>
  );
}
