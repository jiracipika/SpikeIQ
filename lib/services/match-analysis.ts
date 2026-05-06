import type { MatchAdvancedAnalysis, RoundBuyType, Side } from "@/types/domain";

interface RoundForAnalysis {
  won: boolean;
  side: Side;
  buyType?: RoundBuyType;
  kills: number;
  deaths: number;
  assists: number;
  firstBlood: boolean;
  firstDeath: boolean;
  clutch: boolean;
}

interface MatchForAnalysis {
  scoreFor: number;
  scoreAgainst: number;
  kills: number;
  deaths: number;
  assists: number;
  headshotPercent: number;
  plants: number;
  defuses: number;
}

export function buildMatchAdvancedAnalysis(params: {
  match: MatchForAnalysis;
  rounds: RoundForAnalysis[];
}): MatchAdvancedAnalysis {
  const rounds = params.rounds;
  const totalRounds = Math.max(rounds.length, 1);

  const roundWins = rounds.filter((r) => r.won).length;
  const roundLosses = totalRounds - roundWins;

  const openingWon = rounds.filter((r) => r.firstBlood).length;
  const openingLost = rounds.filter((r) => r.firstDeath).length;
  const openingAttempted = openingWon + openingLost;
  const noContactRounds = Math.max(totalRounds - openingAttempted, 0);

  const openingWinRate = percent(openingWon, Math.max(openingAttempted, 1));
  const winRateAfterFirstBlood = percent(
    rounds.filter((r) => r.firstBlood && r.won).length,
    Math.max(openingWon, 1),
  );
  const winRateAfterFirstDeath = percent(
    rounds.filter((r) => r.firstDeath && r.won).length,
    Math.max(openingLost, 1),
  );

  const multiKillRounds = rounds.filter((r) => r.kills >= 2).length;
  const twoKPlusRounds = multiKillRounds;
  const threeKPlusRounds = rounds.filter((r) => r.kills >= 3).length;
  const fourKPlusRounds = rounds.filter((r) => r.kills >= 4).length;
  const aceRounds = rounds.filter((r) => r.kills >= 5).length;
  const deathlessRounds = rounds.filter((r) => r.deaths === 0).length;
  const zeroKillDeathRounds = rounds.filter((r) => r.kills === 0 && r.deaths > 0).length;

  const assistRounds = rounds.filter((r) => r.assists > 0).length;
  const clutchRounds = rounds.filter((r) => r.clutch).length;
  const tradedDeathRounds = rounds.filter((r) => r.deaths > 0 && r.assists > 0).length;
  const untradedDeathRounds = rounds.filter((r) => r.deaths > 0 && r.assists === 0).length;

  const attackRounds = rounds.filter((r) => r.side === "attack");
  const defenseRounds = rounds.filter((r) => r.side === "defense");

  const attackKills = sum(attackRounds.map((r) => r.kills));
  const attackDeaths = sum(attackRounds.map((r) => r.deaths));
  const defenseKills = sum(defenseRounds.map((r) => r.kills));
  const defenseDeaths = sum(defenseRounds.map((r) => r.deaths));

  const attackOpeningAttempts = attackRounds.filter((r) => r.firstBlood || r.firstDeath);
  const defenseOpeningAttempts = defenseRounds.filter((r) => r.firstBlood || r.firstDeath);

  const killPerRoundSeries = rounds.map((r) => r.kills);
  const impactPerRoundSeries = rounds.map((r) => r.kills + 0.7 * r.assists - r.deaths);
  const avgKillsPerRound = safeDiv(params.match.kills, totalRounds);
  const avgDeathsPerRound = safeDiv(params.match.deaths, totalRounds);
  const avgAssistsPerRound = safeDiv(params.match.assists, totalRounds);
  const impactPerRound = safeDiv(sum(impactPerRoundSeries), totalRounds);

  const closeRoundWins = Math.min(params.match.scoreFor, params.match.scoreAgainst) >= 10 ? roundWins : 0;
  const closeRoundLosses = Math.min(params.match.scoreFor, params.match.scoreAgainst) >= 10 ? roundLosses : 0;

  const streaks = buildStreaks(rounds.map((r) => (r.won ? "W" : "L")));
  const bounceBack = buildBounceBack(rounds.map((r) => (r.won ? "W" : "L")));

  const buyRows = buildBuyProfile(rounds);

  const firstDeathRate = percent(openingLost, totalRounds);
  const openingDeathRate = percent(openingLost, Math.max(openingAttempted, 1));

  const analysis: MatchAdvancedAnalysis = {
    sample: {
      rounds: totalRounds,
    },
    combatVolume: {
      totalKills: params.match.kills,
      totalDeaths: params.match.deaths,
      totalAssists: params.match.assists,
      killsPerRound: round(avgKillsPerRound, 2),
      deathsPerRound: round(avgDeathsPerRound, 2),
      assistsPerRound: round(avgAssistsPerRound, 2),
      impactPerRound: round(impactPerRound, 2),
      killParticipationProxy: percent(params.match.kills + params.match.assists, totalRounds),
    },
    openingDuels: {
      attempted: openingAttempted,
      won: openingWon,
      lost: openingLost,
      noContactRounds,
      winRate: openingWinRate,
      roundWinRateAfterFirstBlood: winRateAfterFirstBlood,
      roundWinRateAfterFirstDeath: winRateAfterFirstDeath,
      conversionDelta: round(winRateAfterFirstBlood - winRateAfterFirstDeath, 1),
    },
    combatConsistency: {
      multiKillRounds,
      multiKillRate: percent(multiKillRounds, totalRounds),
      twoKPlusRounds,
      threeKPlusRounds,
      fourKPlusRounds,
      aceRounds,
      deathlessRounds,
      deathlessRate: percent(deathlessRounds, totalRounds),
      zeroKillDeathRounds,
      zeroKillDeathRate: percent(zeroKillDeathRounds, totalRounds),
      avgKillsPerRound: round(avgKillsPerRound, 2),
      killStdDev: round(stddev(killPerRoundSeries), 2),
      impactStdDev: round(stddev(impactPerRoundSeries), 2),
      highImpactRounds: rounds.filter((r) => r.kills >= 2 || r.assists >= 2 || r.clutch).length,
      lowImpactRounds: rounds.filter((r) => r.kills === 0 && r.assists === 0).length,
    },
    conversion: {
      roundWinRateWhen2PlusKills: percent(
        rounds.filter((r) => r.kills >= 2 && r.won).length,
        Math.max(rounds.filter((r) => r.kills >= 2).length, 1),
      ),
      roundWinRateWhen0Kills: percent(
        rounds.filter((r) => r.kills === 0 && r.won).length,
        Math.max(rounds.filter((r) => r.kills === 0).length, 1),
      ),
      roundWinRateWhenDeathless: percent(
        rounds.filter((r) => r.deaths === 0 && r.won).length,
        Math.max(deathlessRounds, 1),
      ),
      roundWinRateWhenDied: percent(
        rounds.filter((r) => r.deaths > 0 && r.won).length,
        Math.max(rounds.filter((r) => r.deaths > 0).length, 1),
      ),
      closeRoundRecord: `${closeRoundWins}-${closeRoundLosses}`,
    },
    sidePerformance: {
      attackRounds: attackRounds.length,
      attackWinRate: percent(attackRounds.filter((r) => r.won).length, Math.max(attackRounds.length, 1)),
      attackKd: round(safeDiv(attackKills, Math.max(attackDeaths, 1)), 2),
      attackOpeningWinRate: percent(
        attackOpeningAttempts.filter((r) => r.firstBlood).length,
        Math.max(attackOpeningAttempts.length, 1),
      ),
      attackOpeningDeathRate: percent(
        attackOpeningAttempts.filter((r) => r.firstDeath).length,
        Math.max(attackOpeningAttempts.length, 1),
      ),
      defenseRounds: defenseRounds.length,
      defenseWinRate: percent(defenseRounds.filter((r) => r.won).length, Math.max(defenseRounds.length, 1)),
      defenseKd: round(safeDiv(defenseKills, Math.max(defenseDeaths, 1)), 2),
      defenseOpeningWinRate: percent(
        defenseOpeningAttempts.filter((r) => r.firstBlood).length,
        Math.max(defenseOpeningAttempts.length, 1),
      ),
      defenseOpeningDeathRate: percent(
        defenseOpeningAttempts.filter((r) => r.firstDeath).length,
        Math.max(defenseOpeningAttempts.length, 1),
      ),
    },
    buyProfile: buyRows,
    utilityImpact: {
      assists: params.match.assists,
      assistsPerRound: round(avgAssistsPerRound, 2),
      assistRounds,
      assistRoundRate: percent(assistRounds, totalRounds),
      supportRate: percent(rounds.filter((r) => r.assists > 0 || r.clutch).length, totalRounds),
      plants: params.match.plants,
      defuses: params.match.defuses,
      objectiveActions: params.match.plants + params.match.defuses,
    },
    clutchImpact: {
      clutchRounds,
      clutchRate: percent(clutchRounds, totalRounds),
    },
    tradeProxy: {
      tradedDeathRounds,
      tradedDeathRate: percent(tradedDeathRounds, Math.max(tradedDeathRounds + untradedDeathRounds, 1)),
      untradedDeathRounds,
      untradedDeathRate: percent(untradedDeathRounds, Math.max(tradedDeathRounds + untradedDeathRounds, 1)),
    },
    preAimProxy: {
      headshotPercent: round(params.match.headshotPercent, 1),
      firstDeathRate,
      openingDeathRate,
      cleanOpeningRate: percent(rounds.filter((r) => !r.firstDeath && r.kills >= 1).length, totalRounds),
    },
    momentum: {
      longestWinStreak: streaks.longestWin,
      longestLossStreak: streaks.longestLoss,
      bounceBackWins: bounceBack.wins,
      bounceBackChances: bounceBack.chances,
      bounceBackRate: percent(bounceBack.wins, Math.max(bounceBack.chances, 1)),
    },
    tips: buildTips({
      openingAttempted,
      openingWinRate,
      conversionDelta: winRateAfterFirstBlood - winRateAfterFirstDeath,
      firstDeathRate,
      assistRoundRate: percent(assistRounds, totalRounds),
      zeroKillDeathRate: percent(zeroKillDeathRounds, totalRounds),
      attackWinRate: percent(attackRounds.filter((r) => r.won).length, Math.max(attackRounds.length, 1)),
      defenseWinRate: percent(defenseRounds.filter((r) => r.won).length, Math.max(defenseRounds.length, 1)),
      killStdDev: stddev(killPerRoundSeries),
      tradedDeathRate: percent(tradedDeathRounds, Math.max(tradedDeathRounds + untradedDeathRounds, 1)),
    }),
    dataNotes: [
      "Trading is estimated from death+assist timing proxies, not full teammate kill-chain telemetry.",
      "Crosshair placement is inferred from headshot %, opening deaths, and clean-contact rounds.",
      "Utility is measured by impact proxies (assists/objective actions); per-ability cast value is not fully exposed here.",
    ],
  };

  return analysis;
}

function buildBuyProfile(rounds: RoundForAnalysis[]): MatchAdvancedAnalysis["buyProfile"] {
  const rows = summarizeBuyType(rounds);
  return {
    pistolRounds: rows.pistol.total,
    pistolWinRate: percent(rows.pistol.wins, Math.max(rows.pistol.total, 1)),
    ecoRounds: rows.eco.total,
    ecoWinRate: percent(rows.eco.wins, Math.max(rows.eco.total, 1)),
    forceRounds: rows.force.total,
    forceWinRate: percent(rows.force.wins, Math.max(rows.force.total, 1)),
    fullBuyRounds: rows.fullBuy.total,
    fullBuyWinRate: percent(rows.fullBuy.wins, Math.max(rows.fullBuy.total, 1)),
    bonusRounds: rows.bonus.total,
    bonusWinRate: percent(rows.bonus.wins, Math.max(rows.bonus.total, 1)),
  };
}

function summarizeBuyType(rounds: RoundForAnalysis[]) {
  const agg = {
    pistol: { total: 0, wins: 0 },
    eco: { total: 0, wins: 0 },
    force: { total: 0, wins: 0 },
    fullBuy: { total: 0, wins: 0 },
    bonus: { total: 0, wins: 0 },
  };

  for (const round of rounds) {
    if (!round.buyType) continue;
    if (round.buyType === "pistol") {
      agg.pistol.total += 1;
      if (round.won) agg.pistol.wins += 1;
    } else if (round.buyType === "eco") {
      agg.eco.total += 1;
      if (round.won) agg.eco.wins += 1;
    } else if (round.buyType === "force") {
      agg.force.total += 1;
      if (round.won) agg.force.wins += 1;
    } else if (round.buyType === "full-buy") {
      agg.fullBuy.total += 1;
      if (round.won) agg.fullBuy.wins += 1;
    } else if (round.buyType === "bonus") {
      agg.bonus.total += 1;
      if (round.won) agg.bonus.wins += 1;
    }
  }

  return agg;
}

function buildTips(params: {
  openingAttempted: number;
  openingWinRate: number;
  conversionDelta: number;
  firstDeathRate: number;
  assistRoundRate: number;
  zeroKillDeathRate: number;
  attackWinRate: number;
  defenseWinRate: number;
  killStdDev: number;
  tradedDeathRate: number;
}): string[] {
  const tips: string[] = [];

  if (params.firstDeathRate >= 24) {
    tips.push("First deaths are high. Delay first peek timing and pre-aim the top two defender swing lines each round.");
  }

  if (params.openingAttempted >= 4 && params.openingWinRate < 48) {
    tips.push("Opening conversion is weak. Add one utility cue before first contact and force a trade setup.");
  }

  if (params.conversionDelta < 20) {
    tips.push(
      "First blood isn’t converting enough rounds. After opening pick, prioritize regroup and site-anchoring instead of chasing.",
    );
  }

  if (params.assistRoundRate < 22) {
    tips.push("Support impact is low. Build one repeatable setup utility routine per side to boost assist-round rate.");
  }

  if (params.zeroKillDeathRate >= 35) {
    tips.push("Low-impact deaths are frequent. Play one layer deeper off teammate contact to improve trade value.");
  }

  if (params.attackWinRate + 8 < params.defenseWinRate) {
    tips.push("Attack side is lagging. Slow defaults and force rotates before committing.");
  } else if (params.defenseWinRate + 8 < params.attackWinRate) {
    tips.push("Defense side is lagging. Tighten anti-exec spacing and stop isolated repeeks.");
  }

  if (params.killStdDev >= 1.2) {
    tips.push("Round impact is swingy. Aim for one guaranteed high-value play every two rounds to stabilize output.");
  }

  if (params.tradedDeathRate < 45) {
    tips.push("Too many deaths go untraded. Hold closer to teammate timing windows, especially on first-contact rounds.");
  }

  if (tips.length === 0) {
    tips.push("Profile is balanced. Focus on micro-decisions after first contact to squeeze extra round conversion.");
  }

  return tips.slice(0, 6);
}

function buildStreaks(sequence: Array<"W" | "L">): { longestWin: number; longestLoss: number } {
  let longestWin = 0;
  let longestLoss = 0;
  let currentWin = 0;
  let currentLoss = 0;

  for (const result of sequence) {
    if (result === "W") {
      currentWin += 1;
      currentLoss = 0;
      if (currentWin > longestWin) longestWin = currentWin;
    } else {
      currentLoss += 1;
      currentWin = 0;
      if (currentLoss > longestLoss) longestLoss = currentLoss;
    }
  }

  return { longestWin, longestLoss };
}

function buildBounceBack(sequence: Array<"W" | "L">): { wins: number; chances: number } {
  let wins = 0;
  let chances = 0;
  for (let i = 1; i < sequence.length; i += 1) {
    if (sequence[i - 1] === "L") {
      chances += 1;
      if (sequence[i] === "W") wins += 1;
    }
  }
  return { wins, chances };
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = safeDiv(sum(values), values.length);
  const variance = safeDiv(sum(values.map((v) => (v - avg) ** 2)), values.length);
  return Math.sqrt(variance);
}

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

function safeDiv(a: number, b: number): number {
  return b === 0 ? 0 : a / b;
}

function percent(numerator: number, denominator: number): number {
  return round(safeDiv(numerator, denominator) * 100, 1);
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
