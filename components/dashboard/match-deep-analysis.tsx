import {
  BarChart3,
  Crosshair,
  Flame,
  Gauge,
  GitBranch,
  Layers,
  Repeat2,
  Shield,
  Sparkles,
  Swords,
  Wrench,
} from "lucide-react";
import type { MatchAdvancedAnalysis } from "@/types/domain";
import { formatPercent } from "@/lib/utils";

interface MatchDeepAnalysisProps {
  analysis: MatchAdvancedAnalysis;
}

export function MatchDeepAnalysis({ analysis }: MatchDeepAnalysisProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          icon={Flame}
          title="Combat volume"
          rows={[
            `K/D/A: ${analysis.combatVolume.totalKills}/${analysis.combatVolume.totalDeaths}/${analysis.combatVolume.totalAssists}`,
            `KPR ${analysis.combatVolume.killsPerRound.toFixed(2)} · DPR ${analysis.combatVolume.deathsPerRound.toFixed(2)}`,
            `APR ${analysis.combatVolume.assistsPerRound.toFixed(2)} · IPR ${analysis.combatVolume.impactPerRound.toFixed(2)}`,
            `Participation proxy: ${formatPercent(analysis.combatVolume.killParticipationProxy)}`,
          ]}
        />
        <MetricCard
          icon={Swords}
          title="Opening duels"
          rows={[
            `Attempted: ${analysis.openingDuels.attempted} (${analysis.openingDuels.won}W/${analysis.openingDuels.lost}L)`,
            `Opening WR: ${formatPercent(analysis.openingDuels.winRate)}`,
            `Round WR after FB/FD: ${formatPercent(analysis.openingDuels.roundWinRateAfterFirstBlood)} / ${formatPercent(analysis.openingDuels.roundWinRateAfterFirstDeath)}`,
            `Conversion delta: ${analysis.openingDuels.conversionDelta.toFixed(1)} pts`,
          ]}
        />
        <MetricCard
          icon={Gauge}
          title="Consistency"
          rows={[
            `2K+/3K+/4K+/Ace: ${analysis.combatConsistency.twoKPlusRounds}/${analysis.combatConsistency.threeKPlusRounds}/${analysis.combatConsistency.fourKPlusRounds}/${analysis.combatConsistency.aceRounds}`,
            `Deathless: ${analysis.combatConsistency.deathlessRounds} (${formatPercent(analysis.combatConsistency.deathlessRate)})`,
            `0K+death: ${analysis.combatConsistency.zeroKillDeathRounds} (${formatPercent(analysis.combatConsistency.zeroKillDeathRate)})`,
            `Std dev K/Impact: ${analysis.combatConsistency.killStdDev.toFixed(2)} / ${analysis.combatConsistency.impactStdDev.toFixed(2)}`,
          ]}
        />
        <MetricCard
          icon={BarChart3}
          title="Round conversion"
          rows={[
            `WR with 2+ kills: ${formatPercent(analysis.conversion.roundWinRateWhen2PlusKills)}`,
            `WR with 0 kills: ${formatPercent(analysis.conversion.roundWinRateWhen0Kills)}`,
            `WR deathless / died: ${formatPercent(analysis.conversion.roundWinRateWhenDeathless)} / ${formatPercent(analysis.conversion.roundWinRateWhenDied)}`,
            `Close rounds: ${analysis.conversion.closeRoundRecord}`,
          ]}
        />
        <MetricCard
          icon={Shield}
          title="Side profile"
          rows={[
            `Attack WR/KD: ${formatPercent(analysis.sidePerformance.attackWinRate)} / ${analysis.sidePerformance.attackKd.toFixed(2)}`,
            `Defense WR/KD: ${formatPercent(analysis.sidePerformance.defenseWinRate)} / ${analysis.sidePerformance.defenseKd.toFixed(2)}`,
            `Atk open win/death: ${formatPercent(analysis.sidePerformance.attackOpeningWinRate)} / ${formatPercent(analysis.sidePerformance.attackOpeningDeathRate)}`,
            `Def open win/death: ${formatPercent(analysis.sidePerformance.defenseOpeningWinRate)} / ${formatPercent(analysis.sidePerformance.defenseOpeningDeathRate)}`,
          ]}
        />
        <MetricCard
          icon={Layers}
          title="Buy profile"
          rows={[
            `Pistol: ${analysis.buyProfile.pistolRounds} (${formatPercent(analysis.buyProfile.pistolWinRate)})`,
            `Eco/Force: ${analysis.buyProfile.ecoRounds}/${analysis.buyProfile.forceRounds} (${formatPercent(analysis.buyProfile.ecoWinRate)} / ${formatPercent(analysis.buyProfile.forceWinRate)})`,
            `Full-buy: ${analysis.buyProfile.fullBuyRounds} (${formatPercent(analysis.buyProfile.fullBuyWinRate)})`,
            `Bonus: ${analysis.buyProfile.bonusRounds} (${formatPercent(analysis.buyProfile.bonusWinRate)})`,
          ]}
        />
        <MetricCard
          icon={Wrench}
          title="Utility & support"
          rows={[
            `Assists: ${analysis.utilityImpact.assists} (${analysis.utilityImpact.assistsPerRound.toFixed(2)}/round)`,
            `Assist round rate: ${formatPercent(analysis.utilityImpact.assistRoundRate)}`,
            `Support rate: ${formatPercent(analysis.utilityImpact.supportRate)}`,
            `Plants/Defuses: ${analysis.utilityImpact.plants}/${analysis.utilityImpact.defuses}`,
          ]}
        />
        <MetricCard
          icon={GitBranch}
          title="Trade proxy"
          rows={[
            `Traded deaths: ${analysis.tradeProxy.tradedDeathRounds} (${formatPercent(analysis.tradeProxy.tradedDeathRate)})`,
            `Untraded deaths: ${analysis.tradeProxy.untradedDeathRounds} (${formatPercent(analysis.tradeProxy.untradedDeathRate)})`,
          ]}
        />
        <MetricCard
          icon={Crosshair}
          title="Aim pressure proxy"
          rows={[
            `Headshot %: ${formatPercent(analysis.preAimProxy.headshotPercent)}`,
            `First-death rate: ${formatPercent(analysis.preAimProxy.firstDeathRate)}`,
            `Opening-death rate: ${formatPercent(analysis.preAimProxy.openingDeathRate)}`,
            `Clean opening rate: ${formatPercent(analysis.preAimProxy.cleanOpeningRate)}`,
          ]}
        />
        <MetricCard
          icon={Repeat2}
          title="Momentum"
          rows={[
            `Longest win/loss streak: ${analysis.momentum.longestWinStreak}/${analysis.momentum.longestLossStreak}`,
            `Bounce-back wins: ${analysis.momentum.bounceBackWins}/${analysis.momentum.bounceBackChances}`,
            `Bounce-back rate: ${formatPercent(analysis.momentum.bounceBackRate)}`,
          ]}
        />
        <MetricCard
          icon={Sparkles}
          title="Clutch impact"
          rows={[
            `Clutch rounds: ${analysis.clutchImpact.clutchRounds}`,
            `Clutch rate: ${formatPercent(analysis.clutchImpact.clutchRate)}`,
            `Sample rounds: ${analysis.sample.rounds}`,
            `No-contact rounds: ${analysis.openingDuels.noContactRounds}`,
          ]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Coaching tips</p>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground">
            {analysis.tips.map((tip) => (
              <li key={tip}>· {tip}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Data coverage notes
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            {analysis.dataNotes.map((note) => (
              <li key={note}>· {note}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  rows,
}: {
  icon: typeof Shield;
  title: string;
  rows: string[];
}) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
        <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
      </div>
      <div className="space-y-1.5">
        {rows.map((row) => (
          <p key={row} className="text-sm text-foreground">
            {row}
          </p>
        ))}
      </div>
    </div>
  );
}
