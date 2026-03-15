import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { fonts, spacing, radius, platformColors } from "@/constants/theme";
import { aiGenerateDraft, createContent } from "@/lib/api";

const c = Colors.light;

const PLATFORMS = ["LinkedIn", "X/Twitter", "Instagram", "Email"];
const TONES = ["Professional", "Casual", "Witty", "Inspirational", "Educational"];

export default function CreateContentScreen() {
  const { type = "social" } = useLocalSearchParams<{ type: string }>();
  const queryClient = useQueryClient();
  const [platform, setPlatform] = useState("LinkedIn");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");

  const saveMutation = useMutation({
    mutationFn: () =>
      createContent({ type, platform, title, body, status: "draft" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    },
  });

  const aiMutation = useMutation({
    mutationFn: () =>
      aiGenerateDraft({ type, platform, topic, tone }),
    onSuccess: (data: { draft: string; suggestions: string[] }) => {
      setBody(data.draft);
      if (!title) setTitle(topic);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const handleCopy = async () => {
    const text = `${title}\n\n${body}`;
    if (Platform.OS === "web") {
      await navigator.clipboard.writeText(text);
    } else {
      await Clipboard.setStringAsync(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert("Copied", "Content copied to clipboard");
  };

  const handleShare = async () => {
    const text = `${title}\n\n${body}`;
    if (Platform.OS === "web") {
      if (navigator.share) {
        await navigator.share({ title, text });
      } else {
        await navigator.clipboard.writeText(text);
        Alert.alert("Copied", "Content copied to clipboard (sharing not available on this browser)");
      }
    } else {
      await Share.share({ title, message: text });
    }
  };

  const typeLabel =
    type === "social"
      ? "Social Post"
      : type === "newsletter"
        ? "Newsletter"
        : type === "caption"
          ? "Caption"
          : "Blog Post";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.typeChip}>
        <Feather name="file-text" size={14} color={c.tint} />
        <Text style={styles.typeChipText}>{typeLabel}</Text>
      </View>

      <Text style={styles.label}>Platform</Text>
      <View style={styles.platformRow}>
        {PLATFORMS.map((p) => (
          <Pressable
            key={p}
            style={[
              styles.platformChip,
              platform === p && styles.platformChipActive,
            ]}
            onPress={() => setPlatform(p)}
          >
            <MaterialCommunityIcons
              name={
                p === "LinkedIn"
                  ? "linkedin"
                  : p === "X/Twitter"
                    ? "twitter"
                    : p === "Instagram"
                      ? "instagram"
                      : "email-outline"
              }
              size={16}
              color={
                platform === p
                  ? c.background
                  : platformColors[p] || c.textSecondary
              }
            />
            <Text
              style={[
                styles.platformChipText,
                platform === p && styles.platformChipTextActive,
              ]}
            >
              {p}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.aiSection}>
        <View style={styles.aiHeader}>
          <MaterialCommunityIcons name="robot-outline" size={18} color={c.tint} />
          <Text style={styles.aiTitle}>AI Draft Assistant</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="What should the content be about?"
          placeholderTextColor={c.textMuted}
          value={topic}
          onChangeText={setTopic}
        />
        <Text style={styles.label}>Tone</Text>
        <View style={styles.toneRow}>
          {TONES.map((t) => (
            <Pressable
              key={t}
              style={[
                styles.toneChip,
                tone === t && styles.toneChipActive,
              ]}
              onPress={() => setTone(t)}
            >
              <Text
                style={[
                  styles.toneChipText,
                  tone === t && styles.toneChipTextActive,
                ]}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.aiButton,
            pressed && { opacity: 0.8 },
            (!topic.trim() || aiMutation.isPending) && { opacity: 0.5 },
          ]}
          onPress={() => aiMutation.mutate()}
          disabled={!topic.trim() || aiMutation.isPending}
          testID="ai-generate"
        >
          {aiMutation.isPending ? (
            <ActivityIndicator size="small" color={c.tint} />
          ) : (
            <MaterialCommunityIcons name="auto-fix" size={16} color={c.tint} />
          )}
          <Text style={styles.aiButtonText}>
            {aiMutation.isPending ? "Generating..." : "Generate Draft"}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Give your content a title"
        placeholderTextColor={c.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Content</Text>
      <TextInput
        style={[styles.input, styles.bodyInput]}
        placeholder="Write your content here..."
        placeholderTextColor={c.textMuted}
        value={body}
        onChangeText={setBody}
        multiline
        textAlignVertical="top"
      />

      {body.trim() !== "" && (
        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleCopy}
            testID="copy-content"
          >
            <Feather name="copy" size={16} color={c.tint} />
            <Text style={styles.actionButtonText}>Copy</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleShare}
            testID="share-content"
          >
            <Feather name="share-2" size={16} color={c.tint} />
            <Text style={styles.actionButtonText}>Share</Text>
          </Pressable>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          pressed && { opacity: 0.8 },
          (!title.trim() || !body.trim() || saveMutation.isPending) && {
            opacity: 0.5,
          },
        ]}
        onPress={() => saveMutation.mutate()}
        disabled={!title.trim() || !body.trim() || saveMutation.isPending}
        testID="save-content"
      >
        {saveMutation.isPending ? (
          <ActivityIndicator size="small" color={c.background} />
        ) : (
          <Feather name="check" size={18} color={c.background} />
        )}
        <Text style={styles.saveButtonText}>
          {saveMutation.isPending ? "Saving..." : "Save Draft"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.surface },
  scrollContent: { padding: spacing.xl, paddingBottom: 40 },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    backgroundColor: c.tint + "15",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
  },
  typeChipText: { fontFamily: fonts.medium, fontSize: 12, color: c.tint },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  platformRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  platformChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.background,
  },
  platformChipActive: { backgroundColor: c.tint, borderColor: c.tint },
  platformChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.textSecondary,
  },
  platformChipTextActive: { color: c.background },
  aiSection: {
    backgroundColor: c.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: c.tint + "30",
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  aiTitle: { fontFamily: fonts.semibold, fontSize: 15, color: c.tint },
  toneRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  toneChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: c.border,
  },
  toneChipActive: { backgroundColor: c.tint + "20", borderColor: c.tint },
  toneChipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.textMuted,
  },
  toneChipTextActive: { color: c.tint },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.tint,
    marginTop: spacing.lg,
  },
  aiButtonText: { fontFamily: fonts.semibold, fontSize: 14, color: c.tint },
  input: {
    backgroundColor: c.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: c.text,
    borderWidth: 1,
    borderColor: c.border,
  },
  bodyInput: {
    minHeight: 160,
    paddingTop: spacing.md,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.tint,
    backgroundColor: c.background,
  },
  actionButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: c.tint,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.tint,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  saveButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: c.background,
  },
});
