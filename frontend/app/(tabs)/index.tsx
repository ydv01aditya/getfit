import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Footprints, Flame, Droplets, TrendingUp } from "lucide-react-native";
import GlowBackground from "../../src/components/GlowBackground";
import GlassCard from "../../src/components/GlassCard";

const { width } = Dimensions.get("window");

/**
 * Home Dashboard — greeting + bento-style stat cards
 * Steps (wide feature) with a glowing progress bar, and
 * Calories + Water side-by-side below.
 */
export default function HomeScreen() {
  const stepsGoal = 10000;
  const stepsCurrent = 6540;
  const stepsPct = Math.min(stepsCurrent / stepsGoal, 1);

  return (
    <View style={styles.root} testID="home-screen">
      <GlowBackground />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting header */}
          <View style={styles.header} testID="home-header">
            <Text style={styles.greetingLabel}>MONDAY · FEB 10</Text>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.greetingName}>User</Text>
          </View>

          {/* Featured Steps card (full width) */}
          <GlassCard style={styles.stepsCard} padding={24} testID="steps-card">
            <View style={styles.stepsHeader}>
              <View style={styles.iconBadge}>
                <Footprints size={20} color="#A78BFA" strokeWidth={2.4} />
              </View>
              <Text style={styles.cardLabel}>STEPS</Text>
              <View style={styles.trendPill}>
                <TrendingUp size={12} color="#10B981" strokeWidth={2.5} />
                <Text style={styles.trendText}>+12%</Text>
              </View>
            </View>

            <View style={styles.stepsValueRow}>
              <Text style={styles.stepsValue} testID="steps-value">
                6,540
              </Text>
              <Text style={styles.stepsGoal}>/ {stepsGoal.toLocaleString()}</Text>
            </View>

            {/* Glowing progress bar */}
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={["#6366F1", "#A78BFA", "#EC4899"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${stepsPct * 100}%` }]}
              />
            </View>
            <Text style={styles.progressHint}>
              {Math.round((1 - stepsPct) * stepsGoal).toLocaleString()} steps to goal
            </Text>
          </GlassCard>

          {/* Two small cards side-by-side */}
          <View style={styles.row}>
            <GlassCard style={styles.halfCard} padding={18} testID="calories-card">
              <View style={[styles.iconBadge, styles.iconBadgeEnergy]}>
                <Flame size={18} color="#F43F5E" strokeWidth={2.4} />
              </View>
              <Text style={styles.cardLabel}>CALORIES</Text>
              <Text style={styles.statBig} testID="calories-value">
                320
              </Text>
              <Text style={styles.statUnit}>kcal burned</Text>
              <View style={styles.miniTrack}>
                <View
                  style={[
                    styles.miniFill,
                    { width: "64%", backgroundColor: "#F43F5E" },
                  ]}
                />
              </View>
            </GlassCard>

            <GlassCard style={styles.halfCard} padding={18} testID="water-card">
              <View style={[styles.iconBadge, styles.iconBadgeWater]}>
                <Droplets size={18} color="#38BDF8" strokeWidth={2.4} />
              </View>
              <Text style={styles.cardLabel}>WATER</Text>
              <Text style={styles.statBig} testID="water-value">
                2.5L
              </Text>
              <Text style={styles.statUnit}>of 3.0L goal</Text>
              <View style={styles.miniTrack}>
                <View
                  style={[
                    styles.miniFill,
                    { width: "83%", backgroundColor: "#38BDF8" },
                  ]}
                />
              </View>
            </GlassCard>
          </View>

          {/* Weekly insight card */}
          <GlassCard style={styles.insightCard} padding={22} testID="insight-card">
            <Text style={styles.cardLabel}>WEEKLY INSIGHT</Text>
            <Text style={styles.insightTitle}>
              You're 23% more active than last week
            </Text>
            <Text style={styles.insightBody}>
              Keep this pace up and you'll reach your monthly goal 4 days early.
            </Text>

            {/* Mini bar chart */}
            <View style={styles.chartRow}>
              {[0.4, 0.55, 0.3, 0.75, 0.6, 0.9, 0.7].map((v, i) => (
                <View key={i} style={styles.chartBarWrap}>
                  <LinearGradient
                    colors={["#4F46E5", "#A78BFA"]}
                    style={[styles.chartBar, { height: 80 * v }]}
                  />
                  <Text style={styles.chartDay}>
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#05050A" },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 120, paddingTop: 8 },

  header: { marginTop: 8, marginBottom: 28 },
  greetingLabel: {
    fontSize: 11,
    color: "#A1A1AA",
    fontWeight: "600",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  greeting: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "400",
    letterSpacing: -0.8,
  },
  greetingName: {
    fontSize: 36,
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: -4,
  },

  stepsCard: { marginBottom: 16 },
  stepsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(167, 139, 250, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.25)",
  },
  iconBadgeEnergy: {
    backgroundColor: "rgba(244, 63, 94, 0.15)",
    borderColor: "rgba(244, 63, 94, 0.25)",
  },
  iconBadgeWater: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    borderColor: "rgba(56, 189, 248, 0.25)",
  },
  cardLabel: {
    fontSize: 11,
    color: "#A1A1AA",
    fontWeight: "700",
    letterSpacing: 1.5,
    marginLeft: 12,
    flex: 1,
  },
  trendPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  trendText: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "700",
  },

  stepsValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  stepsValue: {
    fontSize: 48,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  stepsGoal: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 8,
    marginBottom: 8,
    fontWeight: "500",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: { height: "100%", borderRadius: 999 },
  progressHint: {
    fontSize: 12,
    color: "#A1A1AA",
    fontWeight: "500",
  },

  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  halfCard: { flex: 1 },

  statBig: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.8,
    marginTop: 12,
  },
  statUnit: { fontSize: 12, color: "#A1A1AA", marginTop: 2, fontWeight: "500" },
  miniTrack: {
    height: 4,
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  miniFill: { height: "100%", borderRadius: 999 },

  insightCard: { marginBottom: 16 },
  insightTitle: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: -0.5,
    marginTop: 12,
    lineHeight: 26,
  },
  insightBody: {
    fontSize: 14,
    color: "#A1A1AA",
    marginTop: 8,
    lineHeight: 20,
  },
  chartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 20,
    height: 100,
  },
  chartBarWrap: { alignItems: "center", flex: 1 },
  chartBar: {
    width: (width - 100) / 12,
    borderRadius: 8,
    minHeight: 8,
  },
  chartDay: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 8,
  },
});
