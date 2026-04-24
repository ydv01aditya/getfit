import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import GlowBackground from "../../src/components/GlowBackground";
import GlassCard from "../../src/components/GlassCard";

// Static demo meals
const MEALS = [
  {
    id: "breakfast",
    title: "Breakfast",
    time: "8:00 AM",
    name: "Oats & Mixed Berries",
    image:
      "https://images.unsplash.com/photo-1714423126086-3c5009fcd09a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwYnJlYWtmYXN0JTIwb2F0cyUyMGJlcnJpZXMlMjBkYXJrJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzcwNTgyMzB8MA&ixlib=rb-4.1.0&q=85",
    calories: 420,
    protein: 18,
    carbs: 62,
    fat: 10,
  },
  {
    id: "lunch",
    title: "Lunch",
    time: "1:30 PM",
    name: "Grilled Chicken Salad",
    image:
      "https://images.unsplash.com/photo-1761315600943-d8a5bb0c499f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzF8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwY2hpY2tlbiUyMHNhbGFkJTIwbHVuY2glMjBkYXJrJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzcwNTgyNDB8MA&ixlib=rb-4.1.0&q=85",
    calories: 580,
    protein: 42,
    carbs: 38,
    fat: 22,
  },
  {
    id: "dinner",
    title: "Dinner",
    time: "7:30 PM",
    name: "Salmon & Quinoa",
    image:
      "https://images.pexels.com/photos/10506640/pexels-photo-10506640.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    calories: 640,
    protein: 48,
    carbs: 52,
    fat: 24,
  },
];

/**
 * Diet Screen — image-backed glass meal cards with macro breakdowns.
 */
export default function DietScreen() {
  const totalCals = MEALS.reduce((s, m) => s + m.calories, 0);
  const totalProtein = MEALS.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = MEALS.reduce((s, m) => s + m.carbs, 0);
  const totalFat = MEALS.reduce((s, m) => s + m.fat, 0);

  return (
    <View style={styles.root} testID="diet-screen">
      <GlowBackground />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Diet</Text>
            <Text style={styles.subtitle}>Today's meals & macros</Text>
          </View>

          {/* Daily totals */}
          <GlassCard style={styles.totals} padding={20} testID="totals-card">
            <Text style={styles.cardLabel}>DAILY TOTALS</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalCals}>{totalCals}</Text>
              <Text style={styles.totalUnit}>kcal / 2000</Text>
            </View>
            <View style={styles.macroRow}>
              <MacroDot color="#A78BFA" label="Protein" value={`${totalProtein}g`} />
              <MacroDot color="#38BDF8" label="Carbs" value={`${totalCarbs}g`} />
              <MacroDot color="#F59E0B" label="Fat" value={`${totalFat}g`} />
            </View>
          </GlassCard>

          {/* Meals */}
          {MEALS.map((m) => (
            <View
              key={m.id}
              style={styles.mealCard}
              testID={`meal-card-${m.id}`}
            >
              <ImageBackground
                source={{ uri: m.image }}
                style={styles.mealImage}
                imageStyle={styles.mealImageStyle}
              >
                <LinearGradient
                  colors={[
                    "rgba(5, 5, 10, 0.1)",
                    "rgba(5, 5, 10, 0.6)",
                    "rgba(5, 5, 10, 0.95)",
                  ]}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.mealTopRow}>
                  <View style={styles.mealTimePill}>
                    <Text style={styles.mealTimeText}>{m.time}</Text>
                  </View>
                </View>

                <View style={styles.mealBottom}>
                  <Text style={styles.mealLabel}>{m.title.toUpperCase()}</Text>
                  <Text style={styles.mealName}>{m.name}</Text>

                  <View style={styles.macrosGrid}>
                    <MacroBlock label="Cal" value={`${m.calories}`} unit="kcal" />
                    <MacroBlock label="Protein" value={`${m.protein}g`} />
                    <MacroBlock label="Carbs" value={`${m.carbs}g`} />
                    <MacroBlock label="Fat" value={`${m.fat}g`} />
                  </View>
                </View>
              </ImageBackground>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
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

function MacroBlock({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <View style={styles.macroBlock}>
      <Text style={styles.macroBlockValue}>{value}</Text>
      <Text style={styles.macroBlockLabel}>
        {label}
        {unit ? ` · ${unit}` : ""}
      </Text>
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

  totals: { marginBottom: 20 },
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
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
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

  mealCard: {
    height: 240,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  mealImage: { flex: 1, justifyContent: "space-between", padding: 18 },
  mealImageStyle: { borderRadius: 24 },

  mealTopRow: { flexDirection: "row", justifyContent: "flex-end" },
  mealTimePill: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  mealTimeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  mealBottom: {},
  mealLabel: {
    color: "#A78BFA",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  mealName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 4,
    marginBottom: 14,
  },
  macrosGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
    paddingTop: 12,
  },
  macroBlock: { alignItems: "flex-start", flex: 1 },
  macroBlockValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  macroBlockLabel: {
    color: "#D4D4D8",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
    marginTop: 2,
  },
});
