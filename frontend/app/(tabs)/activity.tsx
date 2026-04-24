import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Footprints, Bike, Timer, Route } from "lucide-react-native";
import GlowBackground from "../../src/components/GlowBackground";
import GlassCard from "../../src/components/GlassCard";

// Static demo activities as per spec
const ACTIVITIES = [
  {
    id: "running",
    title: "Running",
    duration: "30 mins",
    distance: "3 km",
    calories: 280,
    progress: 0.6,
    goalLabel: "5 km goal",
    Icon: Route,
    gradient: ["#F43F5E", "#FB7185"] as const,
    accent: "#F43F5E",
    accentBg: "rgba(244, 63, 94, 0.15)",
  },
  {
    id: "walking",
    title: "Walking",
    duration: "45 mins",
    distance: "4 km",
    calories: 180,
    progress: 0.8,
    goalLabel: "5 km goal",
    Icon: Footprints,
    gradient: ["#4F46E5", "#A78BFA"] as const,
    accent: "#A78BFA",
    accentBg: "rgba(167, 139, 250, 0.15)",
  },
  {
    id: "cycling",
    title: "Cycling",
    duration: "20 mins",
    distance: "5 km",
    calories: 220,
    progress: 0.5,
    goalLabel: "10 km goal",
    Icon: Bike,
    gradient: ["#10B981", "#34D399"] as const,
    accent: "#10B981",
    accentBg: "rgba(16, 185, 129, 0.15)",
  },
];

/**
 * Activity Screen — vertical list of glass cards with progress indicators.
 */
export default function ActivityScreen() {
  const totalMinutes = 95;
  const totalKm = 12;
  const totalKcal = 680;

  return (
    <View style={styles.root} testID="activity-screen">
      <GlowBackground />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Activity</Text>
            <Text style={styles.subtitle}>Today's movement log</Text>
          </View>

          {/* Summary strip */}
          <GlassCard style={styles.summary} padding={20} testID="summary-card">
            <View style={styles.summaryRow}>
              <SummaryPill
                icon={<Timer size={16} color="#A78BFA" strokeWidth={2.4} />}
                value={`${totalMinutes}`}
                unit="min"
                label="ACTIVE"
              />
              <View style={styles.divider} />
              <SummaryPill
                icon={<Route size={16} color="#38BDF8" strokeWidth={2.4} />}
                value={`${totalKm}`}
                unit="km"
                label="DISTANCE"
              />
              <View style={styles.divider} />
              <SummaryPill
                icon={<Footprints size={16} color="#F43F5E" strokeWidth={2.4} />}
                value={`${totalKcal}`}
                unit="kcal"
                label="BURNED"
              />
            </View>
          </GlassCard>

          {/* Activity cards */}
          {ACTIVITIES.map((a) => (
            <GlassCard
              key={a.id}
              style={styles.card}
              padding={22}
              testID={`activity-card-${a.id}`}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[styles.iconBadge, { backgroundColor: a.accentBg }]}
                >
                  <a.Icon color={a.accent} size={22} strokeWidth={2.4} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.activityTitle}>{a.title}</Text>
                  <Text style={styles.activityMeta}>
                    {a.duration} · {a.distance}
                  </Text>
                </View>
                <View style={styles.kcalPill}>
                  <Text style={styles.kcalValue}>{a.calories}</Text>
                  <Text style={styles.kcalUnit}>kcal</Text>
                </View>
              </View>

              {/* Glowing progress bar */}
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={a.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressFill,
                    { width: `${a.progress * 100}%` },
                  ]}
                />
              </View>
              <View style={styles.progressFooter}>
                <Text style={styles.progressPct}>
                  {Math.round(a.progress * 100)}%
                </Text>
                <Text style={styles.progressGoal}>{a.goalLabel}</Text>
              </View>
            </GlassCard>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function SummaryPill({
  icon,
  value,
  unit,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  unit: string;
  label: string;
}) {
  return (
    <View style={styles.pill}>
      {icon}
      <View style={{ marginTop: 8, flexDirection: "row", alignItems: "flex-end" }}>
        <Text style={styles.pillValue}>{value}</Text>
        <Text style={styles.pillUnit}>{unit}</Text>
      </View>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#05050A" },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 120, paddingTop: 8 },

  header: { marginTop: 8, marginBottom: 24 },
  title: {
    fontSize: 36,
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: "#A1A1AA",
    marginTop: 4,
    fontWeight: "500",
  },

  summary: { marginBottom: 20 },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pill: { flex: 1, alignItems: "center" },
  pillValue: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  pillUnit: {
    fontSize: 12,
    color: "#A1A1AA",
    marginLeft: 3,
    marginBottom: 3,
    fontWeight: "600",
  },
  pillLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "700",
    letterSpacing: 1.2,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginHorizontal: 4,
  },

  card: { marginBottom: 14 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  activityTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  activityMeta: {
    fontSize: 13,
    color: "#A1A1AA",
    marginTop: 2,
    fontWeight: "500",
  },
  kcalPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
  },
  kcalValue: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  kcalUnit: {
    fontSize: 10,
    color: "#A1A1AA",
    fontWeight: "700",
    letterSpacing: 1,
  },

  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 999 },
  progressFooter: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressPct: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  progressGoal: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
  },
});
