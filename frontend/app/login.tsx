import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, Lock, User as UserIcon, Zap } from "lucide-react-native";
import GlowBackground from "../src/components/GlowBackground";
import GlassCard from "../src/components/GlassCard";
import { useAuth } from "../src/context/AuthContext";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) throw new Error("Please enter your name");
        await signUp(email.trim(), password, name.trim());
      } else {
        await signIn(email.trim(), password);
      }
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS,
    // THIS BREAKS THE AUTH.
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const redirectUrl = window.location.origin + "/";
      window.location.href =
        "https://auth.emergentagent.com/?redirect=" +
        encodeURIComponent(redirectUrl);
    } else {
      setErr(
        "Google Sign-In requires the web preview. Use email/password here."
      );
    }
  };

  return (
    <View style={styles.root}>
      <GlowBackground />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoWrap}>
              <View style={styles.logoRing}>
                <Zap color="#FFFFFF" size={26} strokeWidth={2.5} />
              </View>
              <Text style={styles.brand}>Get Fit Faster</Text>
              <Text style={styles.tagline}>
                {mode === "login"
                  ? "Welcome back. Let's crush today."
                  : "Start your fitness journey today."}
              </Text>
            </View>

            <GlassCard style={styles.card} padding={22}>
              {/* Mode toggle */}
              <View style={styles.tabs}>
                <TouchableOpacity
                  onPress={() => setMode("login")}
                  style={[styles.tab, mode === "login" && styles.tabActive]}
                  testID="tab-login"
                >
                  <Text
                    style={[
                      styles.tabText,
                      mode === "login" && styles.tabTextActive,
                    ]}
                  >
                    Log In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setMode("signup")}
                  style={[styles.tab, mode === "signup" && styles.tabActive]}
                  testID="tab-signup"
                >
                  <Text
                    style={[
                      styles.tabText,
                      mode === "signup" && styles.tabTextActive,
                    ]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              {mode === "signup" && (
                <InputRow
                  icon={<UserIcon size={18} color="#A1A1AA" strokeWidth={2.2} />}
                  placeholder="Full name"
                  value={name}
                  onChangeText={setName}
                  testID="input-name"
                />
              )}
              <InputRow
                icon={<Mail size={18} color="#A1A1AA" strokeWidth={2.2} />}
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                testID="input-email"
              />
              <InputRow
                icon={<Lock size={18} color="#A1A1AA" strokeWidth={2.2} />}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                testID="input-password"
              />

              {err && <Text style={styles.err} testID="auth-error">{err}</Text>}

              <TouchableOpacity
                onPress={submit}
                disabled={loading}
                activeOpacity={0.9}
                testID="submit-btn"
              >
                <LinearGradient
                  colors={["#6366F1", "#A78BFA"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryBtn}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      {mode === "login" ? "Log In" : "Create Account"}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleBtn}
                onPress={googleSignIn}
                activeOpacity={0.8}
                testID="google-btn"
              >
                <Image
                  source={{
                    uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/512px-Google_%22G%22_logo.svg.png",
                  }}
                  style={{ width: 18, height: 18 }}
                />
                <Text style={styles.googleBtnText}>
                  Continue with Google
                </Text>
              </TouchableOpacity>
            </GlassCard>

            <Text style={styles.footerHint}>
              {mode === "login"
                ? "By continuing, you agree to our Terms & Privacy Policy."
                : "We'll never share your info. Your data stays yours."}
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function InputRow({
  icon,
  testID,
  ...props
}: {
  icon: React.ReactNode;
  testID?: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences";
  keyboardType?: "default" | "email-address";
}) {
  return (
    <View style={styles.inputRow}>
      <View style={styles.inputIcon}>{icon}</View>
      <TextInput
        {...props}
        placeholderTextColor="#6B7280"
        style={styles.input}
        testID={testID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#05050A" },
  scroll: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },

  logoWrap: { alignItems: "center", marginBottom: 28 },
  logoRing: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "rgba(167, 139, 250, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  brand: {
    fontSize: 26,
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: "#A1A1AA",
    marginTop: 6,
    fontWeight: "500",
    textAlign: "center",
  },

  card: { marginBottom: 16 },
  tabs: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: { backgroundColor: "rgba(167, 139, 250, 0.15)" },
  tabText: { color: "#6B7280", fontWeight: "700", fontSize: 13 },
  tabTextActive: { color: "#FFFFFF" },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    paddingVertical: 14,
  },

  err: {
    color: "#F43F5E",
    fontSize: 13,
    marginBottom: 10,
    fontWeight: "500",
  },

  primaryBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.3,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    paddingHorizontal: 12,
  },

  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  googleBtnText: {
    color: "#18181B",
    fontSize: 14,
    fontWeight: "700",
  },

  footerHint: {
    color: "#6B7280",
    fontSize: 11,
    textAlign: "center",
    marginTop: 10,
  },
});
