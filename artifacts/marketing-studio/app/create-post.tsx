import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { fonts, spacing, radius, platformColors } from "@/constants/theme";
import { createScheduledPost } from "@/lib/api";

const c = Colors.light;

const PLATFORMS = ["LinkedIn", "X/Twitter", "Instagram", "TikTok", "YouTube", "Email"];
const TIMES = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00",
  "17:00", "18:00", "19:00", "20:00",
];

export default function CreatePostScreen() {
  const { date: dateParam } = useLocalSearchParams<{ date: string }>();
  const queryClient = useQueryClient();
  const [platform, setPlatform] = useState("LinkedIn");
  const [content, setContent] = useState("");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [status, setStatus] = useState<"draft" | "ready">("draft");

  const baseDate = dateParam ? new Date(dateParam) : new Date();

  const saveMutation = useMutation({
    mutationFn: () => {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledAt = new Date(baseDate);
      scheduledAt.setHours(hours, minutes, 0, 0);
      return createScheduledPost({
        platform,
        content,
        scheduledAt: scheduledAt.toISOString(),
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.dateChip}>
        <Feather name="calendar" size={14} color={c.tint} />
        <Text style={styles.dateChipText}>
          {baseDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>

      <Text style={styles.label}>Platform</Text>
      <View style={styles.platformGrid}>
        {PLATFORMS.map((p) => (
          <Pressable
            key={p}
            style={[
              styles.platformCard,
              platform === p && styles.platformCardActive,
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
                      : p === "TikTok"
                        ? "music-note"
                        : p === "YouTube"
                          ? "youtube"
                          : "email-outline"
              }
              size={20}
              color={
                platform === p
                  ? c.background
                  : platformColors[p] || c.textSecondary
              }
            />
            <Text
              style={[
                styles.platformCardText,
                platform === p && styles.platformCardTextActive,
              ]}
            >
              {p}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Content</Text>
      <TextInput
        style={[styles.input, styles.contentInput]}
        placeholder="What do you want to post?"
        placeholderTextColor={c.textMuted}
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.label}>Time</Text>
      <View style={styles.timeGrid}>
        {TIMES.map((t) => (
          <Pressable
            key={t}
            style={[
              styles.timeChip,
              selectedTime === t && styles.timeChipActive,
            ]}
            onPress={() => setSelectedTime(t)}
          >
            <Text
              style={[
                styles.timeChipText,
                selectedTime === t && styles.timeChipTextActive,
              ]}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Status</Text>
      <View style={styles.statusRow}>
        {(["draft", "ready"] as const).map((s) => (
          <Pressable
            key={s}
            style={[
              styles.statusChip,
              status === s && styles.statusChipActive,
            ]}
            onPress={() => setStatus(s)}
          >
            <Feather
              name={s === "draft" ? "edit-2" : "check-circle"}
              size={14}
              color={status === s ? c.background : c.textSecondary}
            />
            <Text
              style={[
                styles.statusChipText,
                status === s && styles.statusChipTextActive,
              ]}
            >
              {s === "draft" ? "Draft" : "Ready to Post"}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          pressed && { opacity: 0.8 },
          (!content.trim() || saveMutation.isPending) && { opacity: 0.5 },
        ]}
        onPress={() => saveMutation.mutate()}
        disabled={!content.trim() || saveMutation.isPending}
        testID="save-post"
      >
        {saveMutation.isPending ? (
          <ActivityIndicator size="small" color={c.background} />
        ) : (
          <Feather name="check" size={18} color={c.background} />
        )}
        <Text style={styles.saveButtonText}>
          {saveMutation.isPending ? "Scheduling..." : "Schedule Post"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.surface },
  scrollContent: { padding: spacing.xl, paddingBottom: 40 },
  dateChip: {
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
  dateChipText: { fontFamily: fonts.medium, fontSize: 12, color: c.tint },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  platformGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  platformCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.background,
  },
  platformCardActive: { backgroundColor: c.tint, borderColor: c.tint },
  platformCardText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.textSecondary,
  },
  platformCardTextActive: { color: c.background },
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
  contentInput: { minHeight: 120, paddingTop: spacing.md },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  timeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.background,
  },
  timeChipActive: { backgroundColor: c.tint, borderColor: c.tint },
  timeChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.textSecondary,
  },
  timeChipTextActive: { color: c.background },
  statusRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statusChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.background,
  },
  statusChipActive: { backgroundColor: c.tint, borderColor: c.tint },
  statusChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.textSecondary,
  },
  statusChipTextActive: { color: c.background },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.tint,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  saveButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: c.background,
  },
});
