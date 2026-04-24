import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { BlurView } from "expo-blur";

/**
 * Reusable glassmorphism card with a blurred dark background,
 * 1px translucent border and soft shadow — matches design guidelines.
 */
type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  padding?: number;
  testID?: string;
};

export default function GlassCard({
  children,
  style,
  intensity = 30,
  padding = 20,
  testID,
}: Props) {
  return (
    <View style={[styles.wrapper, style]} testID={testID}>
      <BlurView
        tint="dark"
        intensity={intensity}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.tintOverlay} />
      <View style={[styles.content, { padding }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 5,
  },
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  content: {
    position: "relative",
  },
});
