import type { CoachingInsight } from "@/types/domain";

export const mockInsights: CoachingInsight[] = [
  {
    id: "insight_1",
    title: "You lose more rounds on defense",
    category: "macro",
    priority: "high",
    description:
      "Your defense-side round win rate is 46%, compared to 54% on attack. Retake conversion is where you bleed the most.",
    action: "Drill 1 anchor setup per map and rehearse a default retake with teammates before ranked sessions.",
  },
  {
    id: "insight_2",
    title: "First-death rate is high on entry rounds",
    category: "mechanics",
    priority: "high",
    description:
      "You are the first player to die in 22% of rounds, ~6 points above your rank benchmark on initiator.",
    action: "Hold timing cross-ups tighter: wait for flash confirmation before swinging long angles.",
  },
  {
    id: "insight_3",
    title: "You perform best on Sova",
    category: "consistency",
    priority: "medium",
    description:
      "Sova has your highest ACS (241) and 60.6% win rate across 33 matches — clear skill advantage.",
    action: "Queue Sova first when a map pool fit exists. Keep Skye as backup for double-initiator comps.",
  },
  {
    id: "insight_4",
    title: "Win rate drops after 3 consecutive losses",
    category: "mindset",
    priority: "medium",
    description:
      "Your ACS drops ~18 points and win rate drops below 40% when you continue queueing after a 3-loss streak.",
    action: "Set a hard queue cap at three losses. Take a 15-minute break and review one clip before re-queueing.",
  },
  {
    id: "insight_5",
    title: "Headshot rate dips in long sessions",
    category: "mechanics",
    priority: "low",
    description: "After match 3 in a session, your HS% drops by ~3 points on average.",
    action: "Insert a 5-minute aim reset (short DM or tracking routine) between matches 3 and 4.",
  },
];
