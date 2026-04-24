import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronRight,
  Ruler,
  Weight,
  Target,
  UserCog,
  Bell,
  Settings as SettingsIcon,
  Shield,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import GlowBackground from "../../src/components/GlowBackground";
import GlassCard from "../../src/components/GlassCard";
import { useAuth } from "../../src/context/AuthContext";
import { api } from "../../src/api/client";

const SETTINGS = [
  { id: "account", label: "Account", Icon: UserCog },
  { id: "goals", label: "Goals & Targets", Icon: Target },
  { id: "notifications", label: "Notifications", Icon: Bell },
  { id: "preferences", label: "Preferences", Icon: SettingsIcon },
  { id: "privacy", label: "Privacy & Security", Icon: Shield },
  { id: "help", label: "Help & Support", Icon: HelpCircle },
];

export default function ProfileScreen() {
  const { user, signOut, updateUser } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  const pic =
    user?.picture ||
    "https://images.unsplash.com/photo-1604071112261-71e084bc6d57?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMG1hbiUyMHJ1bm5lciUyMHBvcnRyYWl0JTIwZGFyayUyMGxpZ2h0aW5nfGVufDB8fHx8MTc3NzA1ODIzMHww&ixlib=rb-4.1.0&q=85";

  const height = user?.height_cm ?? 175;
  const weight = user?.weight_kg ?? 70;
  const target = user?.target_weight_kg ?? 65;
  const goalText = user?.goal || `Lose ${(weight - target).toFixed(0)} kg`;
  const progressPct = Math.min(
    Math.max(((weight - target) / Math.max(weight - target + 2, 1)) * 0.5, 0),
    1
  );

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

          <View style={styles.avatarWrap}>
            <View style={styles.avatarRing}>
              <Image
                source={{ uri: pic }}
                style={styles.avatar}
                testID="profile-avatar"
              />
            </View>
            <Text style={styles.name} testID="profile-name">
              {user?.name || "Your Name"}
            </Text>
            <Text style={styles.tagline}>
              {user?.email}
              {user?.auth_provider === "google" ? " · Google" : ""}
            </Text>
          </View>

          <GlassCard style={styles.statsCard} padding={20} testID="stats-card">
            <View style={styles.statsRow}>
              <StatBlock
                icon={<Ruler size={16} color="#A78BFA" strokeWidth={2.4} />}
                value={`${Math.round(height)}`}
                unit="cm"
                label="HEIGHT"
              />
              <View style={styles.vDivider} />
              <StatBlock
                icon={<Weight size={16} color="#38BDF8" strokeWidth={2.4} />}
                value={`${Math.round(weight)}`}
                unit="kg"
                label="WEIGHT"
              />
              <View style={styles.vDivider} />
              <StatBlock
                icon={<Target size={16} color="#10B981" strokeWidth={2.4} />}
                value={`${Math.round(target - weight)}`}
                unit="kg"
                label="GOAL"
              />
            </View>
          </GlassCard>

          <GlassCard style={styles.goalCard} padding={20} testID="goal-card">
            <Text style={styles.cardLabel}>ACTIVE GOAL</Text>
            <Text style={styles.goalTitle}>{goalText}</Text>
            <Text style={styles.goalSub}>Target: {target} kg</Text>
            <View style={styles.goalBarTrack}>
              <View
                style={[
                  styles.goalBarFill,
                  { width: `${progressPct * 100}%` },
                ]}
              />
            </View>
            <TouchableOpacity
              onPress={() => setEditOpen(true)}
              activeOpacity={0.85}
              testID="edit-profile-btn"
            >
              <LinearGradient
                colors={["#6366F1", "#A78BFA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.editBtn}
              >
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>

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

          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.7}
            onPress={signOut}
            testID="logout-btn"
          >
            <LogOut size={16} color="#F43F5E" strokeWidth={2.4} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Get Fit Faster · v1.1.0</Text>
        </ScrollView>
      </SafeAreaView>

      <EditProfileModal
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        initial={{
          name: user?.name || "",
          height_cm: height,
          weight_kg: weight,
          target_weight_kg: target,
          goal: goalText,
        }}
        onSaved={(u) => {
          updateUser(u);
          setEditOpen(false);
        }}
      />
    </View>
  );
}

// ---------- Edit modal ----------
function EditProfileModal({
  visible,
  onClose,
  onSaved,
  initial,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: (u: any) => void;
  initial: {
    name: string;
    height_cm: number;
    weight_kg: number;
    target_weight_kg: number;
    goal: string;
  };
}) {
  const [name, setName] = useState(initial.name);
  const [height, setHeight] = useState(String(initial.height_cm));
  const [weight, setWeight] = useState(String(initial.weight_kg));
  const [target, setTarget] = useState(String(initial.target_weight_kg));
  const [goal, setGoal] = useState(initial.goal);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  React.useEffect(() => {
    if (visible) {
      setName(initial.name);
      setHeight(String(initial.height_cm));
      setWeight(String(initial.weight_kg));
      setTarget(String(initial.target_weight_kg));
      setGoal(initial.goal);
      setErr(null);
    }
  }, [visible, initial]);

  const save = async () => {
    setErr(null);
    setLoading(true);
    try {
      const u = await api("/profile", {
        method: "PUT",
        body: {
          name: name.trim(),
          height_cm: parseFloat(height || "0"),
          weight_kg: parseFloat(weight || "0"),
          target_weight_kg: parseFloat(target || "0"),
          goal: goal.trim(),
        },
      });
      onSaved(u);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={mStyles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%" }}
        >
          <View style={mStyles.sheet}>
            <View style={mStyles.handle} />
            <View style={mStyles.headerRow}>
              <Text style={mStyles.title}>Edit Profile</Text>
              <TouchableOpacity
                onPress={onClose}
                style={mStyles.closeBtn}
                testID="close-profile-modal"
              >
                <X size={18} color="#A1A1AA" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            <Label text="Name" />
            <TextInput
              value={name}
              onChangeText={setName}
              style={mStyles.input}
              placeholderTextColor="#6B7280"
              testID="edit-name"
            />
            <View style={{ height: 12 }} />

            <View style={mStyles.grid}>
              <Field label="Height (cm)" value={height} onChange={setHeight} testID="edit-height" />
              <Field label="Weight (kg)" value={weight} onChange={setWeight} testID="edit-weight" />
            </View>
            <View style={mStyles.grid}>
              <Field
                label="Target wt (kg)"
                value={target}
                onChange={setTarget}
                testID="edit-target"
              />
              <View style={{ flex: 1 }}>
                <Label text="Goal" />
                <TextInput
                  value={goal}
                  onChangeText={setGoal}
                  style={mStyles.input}
                  placeholderTextColor="#6B7280"
                  testID="edit-goal"
                />
              </View>
            </View>

            {err && <Text style={mStyles.err}>{err}</Text>}

            <TouchableOpacity
              onPress={save}
              disabled={loading}
              activeOpacity={0.9}
              testID="save-profile-btn"
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
                  <Text style={mStyles.saveText}>Save Changes</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={mStyles.fieldLabel}>{text}</Text>;
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
      <Label text={label} />
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
    marginBottom: 16,
    overflow: "hidden",
  },
  goalBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 999,
  },
  editBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.3,
  },

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
