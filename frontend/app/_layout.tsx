import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { View, ActivityIndicator, Platform } from "react-native";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, exchangeGoogleSession } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // --- Web: detect Google OAuth callback in URL hash (#session_id=...) ---
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof window === "undefined") return;
    const hash = window.location.hash || "";
    const m = hash.match(/session_id=([^&]+)/);
    if (m) {
      const sid = decodeURIComponent(m[1]);
      // strip the hash so re-renders don't re-process
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      exchangeGoogleSession(sid)
        .then(() => router.replace("/"))
        .catch(() => router.replace("/login"));
    }
  }, []);

  useEffect(() => {
    if (user === undefined) return; // still loading
    const inAuth =
      segments[0] === "login" || segments[0] === "auth-callback";
    if (!user && !inAuth) {
      router.replace("/login");
    } else if (user && inAuth) {
      router.replace("/");
    }
  }, [user, segments]);

  if (user === undefined) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#05050A",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="#A78BFA" size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
          </Stack>
        </AuthGate>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
