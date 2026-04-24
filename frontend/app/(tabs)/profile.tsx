import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronRight,
  Ruler,
  Weight,
  Target,
  UserCog,
  Bell,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
} from "lucide-react-native";
import GlowBackground from "../../src/components/GlowBackground";
import GlassCard from "../../src/components/GlassCard";

const SETTINGS = [
  { id: "account", label: "Account", Icon: UserCog },
  { id: "goals", label: "Goals & Targets", Icon: Target },
  { id: "notifications", label: "Notifications", Icon: Bell },
  { id: "preferences", label: "Preferences", Icon: Settings },
  { id: "privacy", label: "Privacy & Security", Icon: Shield },
  { id: "help", label: "Help & Support", Icon: HelpCircle },
];

/**
 * Profile Screen — avatar, user stats, and settings-style list.
 */
export default function ProfileScreen() {
  return (
    <View style={styles.root} testID="profile-screen">
      <GlowBackground />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
          </View>

          {/* Avatar + name */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatarRing}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1604071112261-71e084bc6d57?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMG1hbiUyMHJ1bm5lciUyMHBvcnRyYWl0JTIwZGFyayUyMGxpZ2h0aW5nfGVufDB8fHx8MTc3NzA1ODIzMHww&ixlib=rb-4.1.0&q=85",
                }}
                style={styles.avatar}
                testID="profile-avatar"
              />
            </View>
            <Text style={styles.name} testID="profile-name">
              John Doe
            </Text>
            <Text style={styles.tagline}>Premium Member · Since 2024</Text>
          </View>

          {/* Stats row */}
          <GlassCard style={styles.statsCard} padding={20} testID="stats-card">
            <View style={styles.statsRow}>
              <StatBlock
                icon={<Ruler size={16} color="#A78BFA" strokeWidth={2.4} />}
                value="175"
                unit="cm"
                label="HEIGHT"
              />
              <View style={styles.vDivider} />
              <StatBlock
                icon={<Weight size={16} color="#38BDF8" strokeWidth={2.4} />}
                value="70"
                unit="kg"
                label="WEIGHT"
              />
              <View style={styles.vDivider} />
              <StatBlock
                icon={<Target size={16} color="#10B981" strokeWidth={2.4} />}
                value="-5"
                unit="kg"
                label="GOAL"
              />
            </View>
          </GlassCard>

          {/* Goal banner */}
          <GlassCard style={styles.goalCard} padding={20} testID="goal-card">
            <Text style={styles.cardLabel}>ACTIVE GOAL</Text>
            <Text style={styles.goalTitle}>Lose 5 kg</Text>
            <Text style={styles.goalSub}>Target: 65 kg by May 2026</Text>
            <View style={styles.goalBarTrack}>
              <View style={[styles.goalBarFill, { width: "42%" }]} />
            </View>
            <View style={styles.goalFooter}>
              <Text style={styles.goalPct}>42% complete</Text>
              <Text style={styles.goalRemaining}>2.9 kg to go</Text>
            </View>
          </GlassCard>

          {/* Settings list */}
          <Text style={styles.sectionLabel}>SETTINGS</Text>
          <GlassCard style={styles.settingsList} padding={0} testID="settings-list">
            {SETTINGS.map((s, i) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.settingsRow,
                  i !== SETTINGS.length - 1 && styles.settingsRowBorder,
                ]}
                activeOpacity={0.6}
                testID={`settings-row-${s.id}`}
              >
                <View style={styles.settingsIcon}>
                  <s.Icon size={18} color="#A78BFA" strokeWidth={2.2} />
                </View>
                <Text style={styles.settingsLabel}>{s.label}</Text>
                <ChevronRight size={18} color="#6B7280" strokeWidth={2.4} />
              </TouchableOpacity>
            ))}
          </GlassCard>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.7}
            testID="logout-btn"
          >
            <LogOut size={16} color="#F43F5E" strokeWidth={2.4} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Get Fit Faster · v1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StatBlock({
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
    <View style={styles.statBlock}>
      {icon}
      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#05050A" },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingBottom: 120, paddingTop: 8 },

  header: { marginTop: 8, marginBottom: 12 },
  title: {
    fontSize: 36,
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: -1,
  },

  avatarWrap: { alignItems: "center", marginTop: 16, marginBottom: 24 },
  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 120,
    padding: 3,
    borderWidth: 2,
    borderColor: "rgba(167, 139, 250, 0.4)",
    backgroundColor: "rgba(167, 139, 250, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  avatar: { width: "100%", height: "100%", borderRadius: 120 },
  name: {
    fontSize: 26,
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: -0.6,
    marginTop: 14,
  },
  tagline: {
    fontSize: 13,
    color: "#A1A1AA",
    marginTop: 4,
    fontWeight: "500",
  },

  statsCard: { marginBottom: 14 },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statBlock: { flex: 1, alignItems: "center" },
  statValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 8,
  },
  statValue: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statUnit: {
    fontSize: 12,
    color: "#A1A1AA",
    marginLeft: 3,
    marginBottom: 3,
    fontWeight: "600",
  },
  statLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "700",
    letterSpacing: 1.2,
    marginTop: 4,
  },
  vDivider: {
    width: 1,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },

  goalCard: { marginBottom: 24 },
  cardLabel: {
    fontSize: 11,
    color: "#A78BFA",
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  goalTitle: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: -0.6,
    marginTop: 8,
  },
  goalSub: {
    fontSize: 13,
    color: "#A1A1AA",
    marginTop: 2,
    fontWeight: "500",
  },
  goalBarTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginTop: 16,
    overflow: "hidden",
  },
  goalBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 999,
  },
  goalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  goalPct: { color: "#10B981", fontSize: 13, fontWeight: "700" },
  goalRemaining: { color: "#A1A1AA", fontSize: 12, fontWeight: "500" },

  sectionLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  settingsList: { marginBottom: 24 },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(167, 139, 250, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.25)",
    backgroundColor: "rgba(244, 63, 94, 0.08)",
  },
  logoutText: {
    color: "#F43F5E",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  version: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 20,
    letterSpacing: 0.5,
  },
});
