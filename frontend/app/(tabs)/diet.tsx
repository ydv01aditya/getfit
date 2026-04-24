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
import { Plus, Trash2, X, Sparkles } from "lucide-react-native";
import GlowBackground from "../../src/components/GlowBackground";
import GlassCard from "../../src/components/GlassCard";
import { api } from "../../src/api/client";

type Meal = {
  id: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

const MEAL_COLORS: Record<Meal["meal_type"], string> = {
  breakfast: "#F59E0B",
  lunch: "#A78BFA",
  dinner: "#38BDF8",
  snack: "#10B981",
};

export default function DietScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [prefill, setPrefill] = useState<Partial<Meal> | null>(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const list = await api<Meal[]>("/meals");
      setMeals(list);
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
    setMeals((p) => p.filter((m) => m.id !== id));
    try {
      await api(`/meals/${id}`, { method: "DELETE" });
    } catch {
      load();
    }
  };

  const totalCals = meals.reduce((s, m) => s + m.calories, 0);
  const totalP = meals.reduce((s, m) => s + m.protein_g, 0);
  const totalC = meals.reduce((s, m) => s + m.carbs_g, 0);
  const totalF = meals.reduce((s, m) => s + m.fat_g, 0);

  return (
    <View style={styles.root} testID="diet-screen">
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
              <Text style={styles.title}>Diet</Text>
              <Text style={styles.subtitle}>Today's meals & macros</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setPrefill(null);
                setAddOpen(true);
              }}
              style={styles.addBtn}
              activeOpacity={0.85}
              testID="add-meal-btn"
            >
              <Plus size={18} color="#FFFFFF" strokeWidth={2.6} />
            </TouchableOpacity>
          </View>

          {/* Totals */}
          <GlassCard style={styles.totals} padding={20} testID="totals-card">
            <Text style={styles.cardLabel}>DAILY TOTALS</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalCals}>{totalCals}</Text>
              <Text style={styles.totalUnit}>kcal / 2000</Text>
            </View>
            <View style={styles.macroRow}>
              <MacroDot color="#A78BFA" label="Protein" value={`${totalP.toFixed(0)}g`} />
              <MacroDot color="#38BDF8" label="Carbs" value={`${totalC.toFixed(0)}g`} />
              <MacroDot color="#F59E0B" label="Fat" value={`${totalF.toFixed(0)}g`} />
            </View>
          </GlassCard>

          {/* AI Suggest */}
          <AISuggestCard
            onSuggested={(m) => {
              setPrefill(m);
              setAddOpen(true);
            }}
          />

          {meals.length === 0 ? (
            <GlassCard style={styles.emptyCard} padding={28}>
              <Text style={styles.emptyTitle}>No meals logged yet</Text>
              <Text style={styles.emptyBody}>
                Tap + to log a meal or use AI Suggest above.
              </Text>
            </GlassCard>
          ) : (
            meals.map((m) => (
              <GlassCard
                key={m.id}
                style={styles.mealCard}
                padding={18}
                testID={`meal-card-${m.id}`}
              >
                <View style={styles.mealRow}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.mealType,
                        { color: MEAL_COLORS[m.meal_type] },
                      ]}
                    >
                      {m.meal_type.toUpperCase()}
                    </Text>
                    <Text style={styles.mealName}>{m.name}</Text>
                  </View>
                  <View style={styles.kcalBox}>
                    <Text style={styles.kcalBig}>{m.calories}</Text>
                    <Text style={styles.kcalLabel}>kcal</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => remove(m.id)}
                    style={styles.deleteBtn}
                    testID={`delete-meal-${m.id}`}
                  >
                    <Trash2 size={15} color="#F43F5E" strokeWidth={2.2} />
                  </TouchableOpacity>
                </View>
                <View style={styles.macrosGrid}>
                  <MacroBlock label="Protein" value={`${m.protein_g}g`} />
                  <MacroBlock label="Carbs" value={`${m.carbs_g}g`} />
                  <MacroBlock label="Fat" value={`${m.fat_g}g`} />
                </View>
              </GlassCard>
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      <AddMealModal
        visible={addOpen}
        prefill={prefill}
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          setAddOpen(false);
          load();
        }}
      />
    </View>
  );
}

// -------- AI suggest card --------
function AISuggestCard({
  onSuggested,
}: {
  onSuggested: (m: Partial<Meal>) => void;
}) {
  const [goal, setGoal] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const suggest = async () => {
    setErr(null);
    setLoading(true);
    try {
      const r = await api<any>("/ai/meal-suggest", {
        method: "POST",
        body: {
          goal: goal || "balanced nutrition",
          ingredients: ingredients || "",
          meal_type: "lunch",
        },
      });
      onSuggested({
        meal_type: (r.meal_type || "lunch") as Meal["meal_type"],
        name: r.name,
        calories: r.calories,
        protein_g: r.protein_g,
        carbs_g: r.carbs_g,
        fat_g: r.fat_g,
      });
    } catch (e: any) {
      setErr(e.message || "AI request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard style={styles.aiCard} padding={18} testID="ai-suggest-card">
      <View style={styles.aiHeader}>
        <View style={styles.aiIconBadge}>
          <Sparkles size={18} color="#A78BFA" strokeWidth={2.4} />
        </View>
        <Text style={styles.aiTitle}>AI Meal Suggest</Text>
      </View>
      <Text style={styles.aiBody}>
        Tell the AI your goal & ingredients — get a meal with macros, ready to
        log.
      </Text>
      <TextInput
        placeholder="Goal (e.g. lose weight)"
        placeholderTextColor="#6B7280"
        style={styles.aiInput}
        value={goal}
        onChangeText={setGoal}
        testID="ai-goal"
      />
      <TextInput
        placeholder="Ingredients (optional)"
        placeholderTextColor="#6B7280"
        style={styles.aiInput}
        value={ingredients}
        onChangeText={setIngredients}
        testID="ai-ingredients"
      />
      {err && <Text style={styles.aiErr}>{err}</Text>}
      <TouchableOpacity
        onPress={suggest}
        disabled={loading}
        activeOpacity={0.9}
        testID="ai-suggest-btn"
      >
        <LinearGradient
          colors={["#6366F1", "#A78BFA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aiBtn}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.aiBtnText}>Suggest with AI</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </GlassCard>
  );
}

// -------- Add meal modal --------
function AddMealModal({
  visible,
  prefill,
  onClose,
  onSaved,
}: {
  visible: boolean;
  prefill: Partial<Meal> | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [mealType, setMealType] = useState<Meal["meal_type"]>(
    (prefill?.meal_type as Meal["meal_type"]) || "lunch"
  );
  const [name, setName] = useState(prefill?.name || "");
  const [cals, setCals] = useState(String(prefill?.calories ?? ""));
  const [p, setP] = useState(String(prefill?.protein_g ?? ""));
  const [c, setC] = useState(String(prefill?.carbs_g ?? ""));
  const [f, setF] = useState(String(prefill?.fat_g ?? ""));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Sync prefill each time modal opens
  React.useEffect(() => {
    if (visible) {
      setMealType((prefill?.meal_type as Meal["meal_type"]) || "lunch");
      setName(prefill?.name || "");
      setCals(String(prefill?.calories ?? ""));
      setP(String(prefill?.protein_g ?? ""));
      setC(String(prefill?.carbs_g ?? ""));
      setF(String(prefill?.fat_g ?? ""));
      setErr(null);
    }
  }, [visible, prefill]);

  const save = async () => {
    setErr(null);
    setLoading(true);
    try {
      await api("/meals", {
        method: "POST",
        body: {
          meal_type: mealType,
          name: name.trim() || "Meal",
          calories: parseInt(cals || "0", 10),
          protein_g: parseFloat(p || "0"),
          carbs_g: parseFloat(c || "0"),
          fat_g: parseFloat(f || "0"),
        },
      });
      onSaved();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const types: Meal["meal_type"][] = ["breakfast", "lunch", "dinner", "snack"];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={mStyles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%" }}
        >
          <View style={mStyles.sheet}>
            <View style={mStyles.handle} />
            <View style={mStyles.headerRow}>
              <Text style={mStyles.title}>Log Meal</Text>
              <TouchableOpacity
                onPress={onClose}
                style={mStyles.closeBtn}
                testID="close-meal-modal"
              >
                <X size={18} color="#A1A1AA" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            <Text style={mStyles.label}>Meal</Text>
            <View style={mStyles.chipsRow}>
              {types.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setMealType(t)}
                  style={[mStyles.chip, mealType === t && mStyles.chipActive]}
                  testID={`meal-type-${t}`}
                >
                  <Text
                    style={[
                      mStyles.chipText,
                      mealType === t && mStyles.chipTextActive,
                    ]}
                  >
                    {t[0].toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={mStyles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Grilled chicken bowl"
              placeholderTextColor="#6B7280"
              style={mStyles.input}
              testID="input-meal-name"
            />

            <View style={{ height: 12 }} />

            <View style={mStyles.grid}>
              <Field
                label="Calories"
                value={cals}
                onChange={setCals}
                testID="input-meal-cal"
              />
              <Field
                label="Protein (g)"
                value={p}
                onChange={setP}
                testID="input-meal-p"
              />
            </View>
            <View style={mStyles.grid}>
              <Field
                label="Carbs (g)"
                value={c}
                onChange={setC}
                testID="input-meal-c"
              />
              <Field
                label="Fat (g)"
                value={f}
                onChange={setF}
                testID="input-meal-f"
              />
            </View>

            {err && <Text style={mStyles.err}>{err}</Text>}

            <TouchableOpacity
              onPress={save}
              disabled={loading}
              activeOpacity={0.9}
              testID="save-meal-btn"
            >
              <LinearGradient
                colors={["#6366F1", "#A78BFA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={mStyles.saveBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={mStyles.saveText}>Save Meal</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function Field({
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
      <Text style={mStyles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholderTextColor="#6B7280"
        style={mStyles.input}
        testID={testID}
      />
    </View>
  );
}

function MacroDot({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.macroDotWrap}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View>
        <Text style={styles.macroDotValue}>{value}</Text>
        <Text style={styles.macroDotLabel}>{label}</Text>
      </View>
    </View>
  );
}
function MacroBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.macroBlock}>
      <Text style={styles.macroBlockValue}>{value}</Text>
      <Text style={styles.macroBlockLabel}>{label}</Text>
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
  subtitle: { fontSize: 14, color: "#A1A1AA", marginTop: 4, fontWeight: "500" },
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

  totals: { marginBottom: 14 },
  cardLabel: {
    fontSize: 11,
    color: "#A1A1AA",
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 8,
    marginBottom: 18,
  },
  totalCals: {
    fontSize: 40,
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: -1.2,
    lineHeight: 44,
  },
  totalUnit: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 10,
    marginBottom: 6,
    fontWeight: "500",
  },
  macroRow: { flexDirection: "row", justifyContent: "space-between" },
  macroDotWrap: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 10 },
  macroDotValue: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  macroDotLabel: {
    color: "#A1A1AA",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 1,
  },

  aiCard: { marginBottom: 16 },
  aiHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  aiIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "rgba(167, 139, 250, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  aiTitle: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
  aiBody: {
    color: "#A1A1AA",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  aiInput: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    color: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 10,
    fontSize: 14,
  },
  aiErr: { color: "#F43F5E", fontSize: 12, marginBottom: 8 },
  aiBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  aiBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.3,
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

  mealCard: { marginBottom: 12 },
  mealRow: { flexDirection: "row", alignItems: "center" },
  mealType: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  mealName: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  kcalBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    marginRight: 8,
  },
  kcalBig: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  kcalLabel: {
    color: "#A1A1AA",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244, 63, 94, 0.1)",
  },
  macrosGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingTop: 12,
    marginTop: 14,
  },
  macroBlock: { alignItems: "flex-start", flex: 1 },
  macroBlockValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  macroBlockLabel: {
    color: "#A1A1AA",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginTop: 2,
  },
});

const mStyles = StyleSheet.create({
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
  grid: { flexDirection: "row", gap: 10, marginBottom: 12 },
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
