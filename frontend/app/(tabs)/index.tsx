import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Footprints,
  Flame,
  Droplets,
  Plus,
  Minus,
  TrendingUp,
} from "lucide-react-native";
import GlowBackground from "../../src/components/GlowBackground";
import GlassCard from "../../src/components/GlassCard";
import { api } from "../../src/api/client";
import { useAuth } from "../../src/context/AuthContext";

type Stats = {
  steps: number;
  calories: number;
  water_l: number;
  steps_goal: number;
  water_goal_l: number;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const s = await api<Stats>("/stats/today");
      setStats(s);
    } catch {
      /* show nothing */
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const update = async (patch: Partial<Stats>) => {
    if (!stats) return;
    const next = { ...stats, ...patch };
    setStats(next); // optimistic
    try {
      const saved = await api<Stats>("/stats/today", {
        method: "PUT",
        body: patch,
      });
      setStats(saved);
    } catch {
      load();
    }
  };

  const firstName = (user?.name || "there").split(" ")[0];
  const stepsGoal = stats?.steps_goal || 10000;
  const steps = stats?.steps ?? 0;
  const stepsPct = Math.min(steps / stepsGoal, 1);
  const cals = stats?.calories ?? 0;
  const water = stats?.water_l ?? 0;
  const waterGoal = stats?.water_goal_l || 3;

  return (
    <View style={styles.root} testID="home-screen">
      <GlowBackground />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              tintColor="#A78BFA"
              refreshing={loading}
              onRefresh={load}
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.greetingLabel}>
              {new Date()
                .toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })
                .toUpperCase()}
            </Text>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.greetingName}>{firstName}</Text>
          </View>

          {/* Steps card */}
          <GlassCard style={styles.stepsCard} padding={24} testID="steps-card">
            <View style={styles.stepsHeader}>
              <View style={styles.iconBadge}>
                <Footprints size={20} color="#A78BFA" strokeWidth={2.4} />
              </View>
              <Text style={styles.cardLabel}>STEPS</Text>
              <View style={styles.trendPill}>
                <TrendingUp size={12} color="#10B981" strokeWidth={2.5} />
                <Text style={styles.trendText}>Live</Text>
              </View>
            </View>

            <View style={styles.stepsValueRow}>
              <Text style={styles.stepsValue} testID="steps-value">
                {steps.toLocaleString()}
              </Text>
              <Text style={styles.stepsGoal}>
                / {stepsGoal.toLocaleString()}
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <LinearGradient
                colors={["#6366F1", "#A78BFA", "#EC4899"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${stepsPct * 100}%` }]}
              />
            </View>

            <View style={styles.pmRow}>
              <StepButton
                onPress={() =>
                  update({ steps: Math.max(0, steps - 500) })
                }
                icon={<Minus size={16} color="#FFFFFF" strokeWidth={2.6} />}
                testID="steps-minus"
              />
              <Text style={styles.pmHint}>±500 steps</Text>
              <StepButton
                onPress={() => update({ steps: steps + 500 })}
                icon={<Plus size={16} color="#FFFFFF" strokeWidth={2.6} />}
                testID="steps-plus"
              />
            </View>
          </GlassCard>

          {/* Calories + Water */}
          <View style={styles.row}>
            <GlassCard
              style={styles.halfCard}
              padding={18}
              testID="calories-card"
            >
              <View style={[styles.iconBadge, styles.iconBadgeEnergy]}>
                <Flame size={18} color="#F43F5E" strokeWidth={2.4} />
              </View>
              <Text style={styles.cardLabel}>CALORIES</Text>
              <Text style={styles.statBig} testID="calories-value">
                {cals}
              </Text>
              <Text style={styles.statUnit}>kcal burned</Text>
              <View style={styles.pmRowSmall}>
                <StepButton
                  small
                  onPress={() =>
                    update({ calories: Math.max(0, cals - 50) })
                  }
                  icon={<Minus size={13} color="#FFFFFF" strokeWidth={2.6} />}
                  testID="calories-minus"
                />
                <StepButton
                  small
                  onPress={() => update({ calories: cals + 50 })}
                  icon={<Plus size={13} color="#FFFFFF" strokeWidth={2.6} />}
                  testID="calories-plus"
                />
              </View>
            </GlassCard>

            <GlassCard
              style={styles.halfCard}
              padding={18}
              testID="water-card"
            >
              <View style={[styles.iconBadge, styles.iconBadgeWater]}>
                <Droplets size={18} color="#38BDF8" strokeWidth={2.4} />
              </View>
              <Text style={styles.cardLabel}>WATER</Text>
              <Text style={styles.statBig} testID="water-value">
                {water.toFixed(1)}L
              </Text>
              <Text style={styles.statUnit}>of {waterGoal}L goal</Text>
              <View style={styles.pmRowSmall}>
                <StepButton
                  small
                  onPress={() =>
                    update({ water_l: Math.max(0, +(water - 0.25).toFixed(2)) })
                  }
                  icon={<Minus size={13} color="#FFFFFF" strokeWidth={2.6} />}
                  testID="water-minus"
                />
                <StepButton
                  small
                  onPress={() =>
                    update({ water_l: +(water + 0.25).toFixed(2) })
                  }
                  icon={<Plus size={13} color="#FFFFFF" strokeWidth={2.6} />}
                  testID="water-plus"
                />
              </View>
            </GlassCard>
          </View>

          <Text style={styles.footHint}>
            Tap + / − to log. Changes auto-save to your account.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StepButton({
  onPress,
  icon,
  small,
  testID,
}: {
  onPress: () => void;
  icon: React.ReactNode;
  small?: boolean;
  testID?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
      style={[styles.stepBtn, small && styles.stepBtnSmall]}
    >
      {icon}
    </TouchableOpacity>
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
  trendText: { color: "#10B981", fontSize: 11, fontWeight: "700" },

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
    marginBottom: 14,
  },
  progressFill: { height: "100%", borderRadius: 999 },

  pmRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  pmRowSmall: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  pmHint: { color: "#6B7280", fontSize: 12, fontWeight: "500" },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(167, 139, 250, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.35)",
  },
  stepBtnSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },

  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  halfCard: { flex: 1 },

  statBig: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.8,
    marginTop: 12,
  },
  statUnit: { fontSize: 12, color: "#A1A1AA", marginTop: 2, fontWeight: "500" },

  footHint: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 12,
    marginTop: 16,
    fontWeight: "500",
  },
});
