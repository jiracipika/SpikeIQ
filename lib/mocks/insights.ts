import type { CoachingInsight } from "@/types/domain";

export const mockInsights: CoachingInsight[] = [
  {
    id: "insight_1",
    title: "Early-round utility timing is excellent",
    category: "macro",
    priority: "low",
    description:
      "You are creating space for entries in the first 25 seconds more consistently than your rank average.",
    action: "Keep your current default timings and save one recon/flash for mid-round pivots.",
  },
  {
    id: "insight_2",
    title: "Trade conversion drops on defense",
    category: "consistency",
    priority: "high",
    description:
      "Your first duel success is solid, but follow-up trade rounds are below benchmark on defense halves.",
    action: "Anchor with a tighter crossfire setup and call for instant swing after first contact.",
  },
  {
    id: "insight_3",
    title: "Headshot rate dips in long sessions",
    category: "mechanics",
    priority: "medium",
    description:
      "In sessions over 4 matches, your HS% trends down by around 3 points.",
    action: "Insert a 5-minute warm reset after match 3 to stabilize crosshair discipline.",
  },
];
