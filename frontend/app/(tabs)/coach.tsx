import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Send } from "lucide-react-native";
import GlowBackground from "../../src/components/GlowBackground";
import GlassCard from "../../src/components/GlassCard";
import { api } from "../../src/api/client";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How do I lose 5 kg safely?",
  "Best pre-workout meal?",
  "How many steps per day?",
  "Plan my week",
];

export default function CoachScreen() {
  const sessionId = useRef<string>(`chat_${Date.now()}`).current;
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm Coach Ace — ask me anything about fitness, nutrition, or your goals. I'll keep it practical.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = useCallback(
    async (text?: string) => {
      const msg = (text ?? input).trim();
      if (!msg || sending) return;
      setInput("");
      setMessages((prev) => [...prev, { role: "user", content: msg }]);
      setSending(true);
      try {
        const r = await api<{ reply: string }>("/ai/coach", {
          method: "POST",
          body: { session_id: sessionId, message: msg },
        });
        setMessages((prev) => [...prev, { role: "assistant", content: r.reply }]);
      } catch (e: any) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sorry, I hit a snag reaching my brain. Try again in a moment.",
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [input, sending, sessionId]
  );

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  }, [messages]);

  return (
    <View style={styles.root} testID="coach-screen">
      <GlowBackground />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={70}
        >
          <View style={styles.header}>
            <View style={styles.avatarRing}>
              <Sparkles color="#FFFFFF" size={20} strokeWidth={2.4} />
            </View>
            <View>
              <Text style={styles.title}>Coach Ace</Text>
              <Text style={styles.subtitle}>AI fitness & nutrition coach</Text>
            </View>
          </View>

          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((m, i) => (
              <View
                key={i}
                style={[
                  styles.bubbleWrap,
                  m.role === "user" ? styles.bubbleRight : styles.bubbleLeft,
                ]}
                testID={`msg-${m.role}-${i}`}
              >
                {m.role === "assistant" ? (
                  <GlassCard style={styles.bubbleAssist} padding={14}>
                    <Text style={styles.assistText}>{m.content}</Text>
                  </GlassCard>
                ) : (
                  <LinearGradient
                    colors={["#6366F1", "#A78BFA"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.bubbleUser}
                  >
                    <Text style={styles.userText}>{m.content}</Text>
                  </LinearGradient>
                )}
              </View>
            ))}
            {sending && (
              <View style={[styles.bubbleWrap, styles.bubbleLeft]}>
                <GlassCard style={styles.bubbleAssist} padding={14}>
                  <ActivityIndicator color="#A78BFA" />
                </GlassCard>
              </View>
            )}

            {messages.length <= 1 && (
              <View style={styles.suggestionsWrap}>
                <Text style={styles.suggestionsLabel}>QUICK PROMPTS</Text>
                <View style={styles.suggestionsRow}>
                  {SUGGESTIONS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={styles.suggestion}
                      onPress={() => send(s)}
                      testID={`suggestion-${s}`}
                    >
                      <Text style={styles.suggestionText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputBarWrap}>
            <View style={styles.inputBar}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask Coach Ace anything..."
                placeholderTextColor="#6B7280"
                style={styles.input}
                onSubmitEditing={() => send()}
                returnKeyType="send"
                testID="coach-input"
              />
              <TouchableOpacity
                onPress={() => send()}
                disabled={sending || !input.trim()}
                activeOpacity={0.85}
                testID="coach-send-btn"
              >
                <LinearGradient
                  colors={
                    input.trim() && !sending
                      ? ["#6366F1", "#A78BFA"]
                      : ["#2A2A3A", "#2A2A3A"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sendBtn}
                >
                  <Send size={16} color="#FFFFFF" strokeWidth={2.4} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#05050A" },
  safe: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 14,
  },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(167, 139, 250, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 12, color: "#A1A1AA", fontWeight: "500" },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  bubbleWrap: { marginBottom: 10, maxWidth: "85%" },
  bubbleLeft: { alignSelf: "flex-start" },
  bubbleRight: { alignSelf: "flex-end" },
  bubbleAssist: {},
  assistText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  bubbleUser: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 6,
  },
  userText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },

  suggestionsWrap: { marginTop: 18 },
  suggestionsLabel: {
    color: "#6B7280",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  suggestionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestion: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  suggestionText: { color: "#E4E4E7", fontSize: 13, fontWeight: "600" },

  inputBarWrap: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 90 : 76,
    paddingTop: 8,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 8,
    paddingLeft: 20,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    paddingVertical: 10,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
