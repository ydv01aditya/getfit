import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Footprints,
  Bike,
  Timer,
  Route,
  Plus,
  Trash2,
  X,
} from "lucide-react-native";
import GlowBackground from "../../src/components/GlowBackground";
import GlassCard from "../../src/components/GlassCard";
import { api } from "../../src/api/client";

type Activity = {
  id: string;
  type: "running" | "walking" | "cycling" | "swimming" | "yoga" | "other";
  duration_min: number;
  distance_km: number;
  calories: number;
};

const TYPE_META: Record<
  Activity["type"],
  { label: string; Icon: any; color: string; bg: string; gradient: [string, string] }
> = {
  running: {
    label: "Running",
    Icon: Route,
    color: "#F43F5E",
    bg: "rgba(244, 63, 94, 0.15)",
    gradient: ["#F43F5E", "#FB7185"],
  },
  walking: {
    label: "Walking",
    Icon: Footprints,
    color: "#A78BFA",
    bg: "rgba(167, 139, 250, 0.15)",
    gradient: ["#4F46E5", "#A78BFA"],
  },
  cycling: {
    label: "Cycling",
    Icon: Bike,
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.15)",
    gradient: ["#10B981", "#34D399"],
  },
  swimming: {
    label: "Swimming",
    Icon: Route,
    color: "#38BDF8",
    bg: "rgba(56, 189, 248, 0.15)",
    gradient: ["#0EA5E9", "#38BDF8"],
  },
  yoga: {
    label: "Yoga",
    Icon: Route,
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.15)",
    gradient: ["#F59E0B", "#FCD34D"],
  },
  other: {
    label: "Other",
    Icon: Route,
    color: "#A1A1AA",
    bg: "rgba(161, 161, 170, 0.15)",
    gradient: ["#6B7280", "#A1A1AA"],
  },
};

export default function ActivityScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const list = await api<Activity[]>("/activities");
      setActivities(list);
    } catch {
      /* noop */
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const remove = async (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    try {
      await api(`/activities/${id}`, { method: "DELETE" });
    } catch {
      load();
    }
  };

  const totalMin = activities.reduce((s, a) => s + a.duration_min, 0);
  const totalKm = activities.reduce((s, a) => s + a.distance_km, 0);
  const totalKcal = activities.reduce((s, a) => s + a.calories, 0);

  return (
    <View style={styles.root} testID="activity-screen">
      <GlowBackground />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              tintColor="#A78BFA"
              refreshing={refreshing}
              onRefresh={load}
            />
          }
        >
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Activity</Text>
              <Text style={styles.subtitle}>Today's movement log</Text>
            </View>
            <TouchableOpacity
              onPress={() => setAddOpen(true)}
              style={styles.addBtn}
              activeOpacity={0.85}
              testID="add-activity-btn"
            >
              <Plus size={18} color="#FFFFFF" strokeWidth={2.6} />
            </TouchableOpacity>
          </View>

          <GlassCard style={styles.summary} padding={20} testID="summary-card">
            <View style={styles.summaryRow}>
              <SummaryPill
                icon={<Timer size={16} color="#A78BFA" strokeWidth={2.4} />}
                value={`${totalMin}`}
                unit="min"
                label="ACTIVE"
              />
              <View style={styles.divider} />
              <SummaryPill
                icon={<Route size={16} color="#38BDF8" strokeWidth={2.4} />}
                value={`${totalKm.toFixed(1)}`}
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

          {activities.length === 0 ? (
            <GlassCard style={styles.emptyCard} padding={28}>
              <Text style={styles.emptyTitle}>No activities yet</Text>
              <Text style={styles.emptyBody}>
                Tap + to log your first workout of the day.
              </Text>
            </GlassCard>
          ) : (
            activities.map((a) => {
              const meta = TYPE_META[a.type];
              const goal = a.type === "cycling" ? 10 : 5;
              const pct = Math.min(a.distance_km / goal, 1);
              return (
                <GlassCard
                  key={a.id}
                  style={styles.card}
                  padding={22}
                  testID={`activity-card-${a.id}`}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconBadge, { backgroundColor: meta.bg }]}>
                      <meta.Icon color={meta.color} size={22} strokeWidth={2.4} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={styles.activityTitle}>{meta.label}</Text>
                      <Text style={styles.activityMeta}>
                        {a.duration_min} min · {a.distance_km} km
                      </Text>
                    </View>
                    <View style={styles.kcalPill}>
                      <Text style={styles.kcalValue}>{a.calories}</Text>
                      <Text style={styles.kcalUnit}>kcal</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => remove(a.id)}
                      style={styles.deleteBtn}
                      testID={`delete-activity-${a.id}`}
                    >
                      <Trash2 size={15} color="#F43F5E" strokeWidth={2.2} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.progressTrack}>
                    <LinearGradient
                      colors={meta.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${pct * 100}%` }]}
                    />
                  </View>
                  <Text style={styles.progressGoal}>
                    {Math.round(pct * 100)}% of {goal} km goal
                  </Text>
                </GlassCard>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>

      <AddActivityModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          setAddOpen(false);
          load();
        }}
      />
    </View>
  );
}

// ------- Modal -------
function AddActivityModal({
  visible,
  onClose,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState<Activity["type"]>("running");
  const [duration, setDuration] = useState("30");
  const [distance, setDistance] = useState("3");
  const [calories, setCalories] = useState("280");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setErr(null);
    setLoading(true);
    try {
      await api("/activities", {
        method: "POST",
        body: {
          type,
          duration_min: parseInt(duration || "0", 10),
          distance_km: parseFloat(distance || "0"),
          calories: parseInt(calories || "0", 10),
        },
      });
      onSaved();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const types: Activity["type"][] = ["running", "walking", "cycling", "swimming", "yoga"];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%" }}
        >
          <View style={modalStyles.sheet}>
            <View style={modalStyles.handle} />
            <View style={modalStyles.headerRow}>
              <Text style={modalStyles.title}>Log Activity</Text>
              <TouchableOpacity
                onPress={onClose}
                style={modalStyles.closeBtn}
                testID="close-activity-modal"
              >
                <X size={18} color="#A1A1AA" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            <Text style={modalStyles.label}>Type</Text>
            <View style={modalStyles.chipsRow}>
              {types.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  style={[
                    modalStyles.chip,
                    type === t && modalStyles.chipActive,
                  ]}
                  testID={`type-chip-${t}`}
                >
                  <Text
                    style={[
                      modalStyles.chipText,
                      type === t && modalStyles.chipTextActive,
                    ]}
                  >
                    {TYPE_META[t].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={modalStyles.grid}>
              <FieldNum
                label="Duration (min)"
                value={duration}
                onChange={setDuration}
                testID="input-duration"
              />
              <FieldNum
                label="Distance (km)"
                value={distance}
                onChange={setDistance}
                testID="input-distance"
              />
              <FieldNum
                label="Calories"
                value={calories}
                onChange={setCalories}
                testID="input-calories"
              />
            </View>

            {err && <Text style={modalStyles.err}>{err}</Text>}

            <TouchableOpacity
              onPress={save}
              disabled={loading}
              activeOpacity={0.9}
              testID="save-activity-btn"
            >
              <LinearGradient
                colors={["#6366F1", "#A78BFA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={modalStyles.saveBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={modalStyles.saveText}>Save Activity</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function FieldNum({
  label,
  value,
  onChange,
  testID,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  testID?: string;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={modalStyles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholderTextColor="#6B7280"
        style={modalStyles.input}
        testID={testID}
      />
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

  header: {
    marginTop: 8,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
  },
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
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(167, 139, 250, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  summary: { marginBottom: 20 },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pill: { flex: 1, alignItems: "center" },
  pillValue: {
    fontSize: 22,
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

  emptyCard: { alignItems: "center" },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptyBody: {
    color: "#A1A1AA",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },

  card: { marginBottom: 14 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  activityTitle: {
    fontSize: 17,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    marginRight: 8,
  },
  kcalValue: { fontSize: 13, color: "#FFFFFF", fontWeight: "800" },
  kcalUnit: { fontSize: 9, color: "#A1A1AA", fontWeight: "700", letterSpacing: 1 },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244, 63, 94, 0.1)",
  },

  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 999 },
  progressGoal: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 8,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#0F0F1A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "center",
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  label: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  chipActive: {
    backgroundColor: "rgba(167, 139, 250, 0.2)",
    borderColor: "rgba(167, 139, 250, 0.45)",
  },
  chipText: { color: "#A1A1AA", fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#FFFFFF" },
  grid: { flexDirection: "row", gap: 10, marginBottom: 16 },
  fieldLabel: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  err: { color: "#F43F5E", marginBottom: 10, fontSize: 13 },
  saveBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
