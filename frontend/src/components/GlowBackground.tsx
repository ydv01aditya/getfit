import React from "react";
import { View, StyleSheet } from "react-native";

/**
 * Ambient glow background that renders two large blurred color blobs
 * behind the content. This creates the premium "Crystal Glass" ambient
 * gradient effect as per design guidelines (no flat gradient).
 */
export default function GlowBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.blob, styles.blobPrimary]} />
      <View style={[styles.blob, styles.blobSecondary]} />
      <View style={[styles.blob, styles.blobTertiary]} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 380,
    opacity: 0.35,
  },
  blobPrimary: {
    top: -120,
    left: -100,
    backgroundColor: "#4F46E5",
  },
  blobSecondary: {
    top: 220,
    right: -140,
    backgroundColor: "#7C3AED",
    opacity: 0.3,
  },
  blobTertiary: {
    bottom: -160,
    left: -80,
    backgroundColor: "#4338CA",
    opacity: 0.25,
  },
});
