import React from "react";
import { Tabs } from "expo-router";
import { StyleSheet, View, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Home, Activity, UtensilsCrossed, User } from "lucide-react-native";

/**
 * Bottom tab navigation with a BlurView background to match the
 * glassmorphism aesthetic defined in design_guidelines.json.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#A78BFA",
        tabBarInactiveTintColor: "#6B7280",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.5,
          marginTop: -2,
        },
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView
              tint="dark"
              intensity={60}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.tabBarTint} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size - 2} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, size }) => (
            <Activity color={color} size={size - 2} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="diet"
        options={{
          title: "Diet",
          tabBarIcon: ({ color, size }) => (
            <UtensilsCrossed color={color} size={size - 2} strokeWidth={2.2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size - 2} strokeWidth={2.2} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "transparent",
    elevation: 0,
    height: Platform.OS === "ios" ? 84 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
  },
  tabBarTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 5, 10, 0.7)",
  },
});
