import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  REGIONS,
  VALORANT_TIER_NAMES,
  lookupPlayer,
  type LookupResponse,
  type RiotRegion,
  type ValorantMatchSummary,
} from "@/lib/api";

const COLORS = {
  bg: "#0a0a0f",
  panel: "#15161d",
  panelMuted: "#1d1f29",
  border: "#2a2c38",
  text: "#e8e8f0",
  textMuted: "#8a8c9a",
  accent: "#ff4655",
  accentSoft: "rgba(255, 70, 85, 0.12)",
  win: "#4ade80",
  loss: "#f87171",
  acs: "#fbbf24",
  rank: "#a78bfa",
};

export function PlayerLookupScreen() {
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [region, setRegion] = useState<RiotRegion>("NA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<LookupResponse | null>(null);

  const handleSearch = async () => {
    if (!gameName.trim()) {
      setError("Enter a player name");
      return;
    }
    setLoading(true);
    setError("");
    setData(null);
    try {
      const result = await lookupPlayer(gameName.trim(), tagLine.trim(), region);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>SpikeIQ</Text>
          <Text style={styles.subheading}>Look up your VALORANT stats</Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>Player name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Tenz"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              value={gameName}
              onChangeText={setGameName}
              editable={!loading}
            />

            <Text style={styles.label}>Tag</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. NA1"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={5}
              value={tagLine}
              onChangeText={setTagLine}
              editable={!loading}
            />

            <Text style={styles.label}>Region</Text>
            <View style={styles.regionRow}>
              {REGIONS.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setRegion(r)}
                  style={[
                    styles.regionChip,
                    region === r && styles.regionChipActive,
                  ]}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.regionChipText,
                      region === r && styles.regionChipTextActive,
                    ]}
                  >
                    {r}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.searchButton,
                pressed && styles.searchButtonPressed,
                loading && styles.searchButtonDisabled,
              ]}
              onPress={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </Pressable>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {data ? <ResultsCard data={data} region={region} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ResultsCard({ data, region }: { data: LookupResponse; region: RiotRegion }) {
  const { player, matches } = data;
  const decided = matches.filter((m) => m.won !== null);
  const wins = decided.filter((m) => m.won).length;
  const avgAcs = matches.length
    ? Math.round(matches.reduce((s, m) => s + m.acs, 0) / matches.length)
    : 0;
  const avgKda = matches.length
    ? matches.reduce(
        (s, m) =>
          s + (m.deaths === 0 ? m.kills + m.assists : (m.kills + m.assists) / m.deaths),
        0,
      ) / matches.length
    : 0;
  const topTier = matches.find((m) => m.competitiveTier > 0)?.competitiveTier ?? 0;

  return (
    <View style={styles.resultCard}>
      <View style={styles.playerHeader}>
        <View style={styles.flex}>
          <Text style={styles.playerName}>
            {player.gameName}
            <Text style={styles.playerTag}>#{player.tagLine}</Text>
          </Text>
          <Text style={styles.playerMeta}>
            {region} · Account Lvl {player.summonerLevel}
          </Text>
        </View>
      </View>

      {matches.length === 0 ? (
        <Text style={styles.emptyText}>No recent VALORANT matches found.</Text>
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatChip
              label={`Last ${matches.length}`}
              value={decided.length ? `${wins}W ${decided.length - wins}L` : "–"}
            />
            <StatChip label="Avg ACS" value={String(avgAcs)} valueColor={COLORS.acs} />
            <StatChip label="Avg KDA" value={avgKda.toFixed(2)} />
            {topTier > 0 ? (
              <StatChip
                label="Rank"
                value={VALORANT_TIER_NAMES[topTier] ?? `T${topTier}`}
                valueColor={COLORS.rank}
              />
            ) : null}
          </View>

          <FlatList
            data={matches}
            keyExtractor={(m) => m.matchId}
            renderItem={({ item }) => <MatchRow m={item} />}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
            style={{ marginTop: 12 }}
          />
        </>
      )}
    </View>
  );
}

function StatChip({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.statChip}>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MatchRow({ m }: { m: ValorantMatchSummary }) {
  const date = new Date(m.gameStartMillis).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const resultColor =
    m.won === null ? COLORS.textMuted : m.won ? COLORS.win : COLORS.loss;

  return (
    <View style={styles.matchRow}>
      <Text style={[styles.matchResult, { color: resultColor }]}>
        {m.won === null ? "–" : m.won ? "W" : "L"}
      </Text>
      <View style={styles.flex}>
        <Text style={styles.matchMap}>
          {m.map} <Text style={styles.matchAgent}>· {m.agent}</Text>
        </Text>
        <Text style={styles.matchSubline}>
          {m.roundsWon}–{m.roundsLost} · {m.kills}/{m.deaths}/{m.assists} · {date}
        </Text>
      </View>
      <Text style={styles.matchAcs}>{m.acs}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  heading: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  subheading: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: COLORS.panel,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.panelMuted,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  regionRow: { flexDirection: "row", gap: 8 },
  regionChip: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: COLORS.panelMuted,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  regionChipActive: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accent,
  },
  regionChipText: { color: COLORS.textMuted, fontWeight: "600" },
  regionChipTextActive: { color: COLORS.accent },
  searchButton: {
    marginTop: 16,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  searchButtonPressed: { opacity: 0.85 },
  searchButtonDisabled: { opacity: 0.6 },
  searchButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  errorText: { color: COLORS.loss, marginTop: 10, fontSize: 13 },
  resultCard: {
    marginTop: 16,
    backgroundColor: COLORS.panel,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  playerHeader: { flexDirection: "row", alignItems: "center" },
  playerName: { color: COLORS.text, fontSize: 18, fontWeight: "700" },
  playerTag: { color: COLORS.textMuted, fontWeight: "500" },
  playerMeta: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  emptyText: { color: COLORS.textMuted, marginTop: 12, fontSize: 13 },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  statChip: {
    flex: 1,
    minWidth: 70,
    backgroundColor: COLORS.panelMuted,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  statLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.panelMuted,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  matchResult: { fontWeight: "800", fontSize: 16, width: 18, textAlign: "center" },
  matchMap: { color: COLORS.text, fontWeight: "600", fontSize: 14 },
  matchAgent: { color: COLORS.textMuted, fontWeight: "400" },
  matchSubline: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  matchAcs: { color: COLORS.acs, fontWeight: "700", fontSize: 14 },
});
