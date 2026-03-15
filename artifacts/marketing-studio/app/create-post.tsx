import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import type { ColorPalette } from "@/constants/colors";
import { fonts, spacing, radius, platformColors } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import {
  createScheduledPost,
  updateScheduledPost,
  deleteScheduledPost,
  fetchScheduledPost,
  fetchSocialAccountStatus,
  publishPost,
  validatePostContent,
} from "@/lib/api";

const PLATFORMS = ["LinkedIn", "X/Twitter", "Instagram", "TikTok", "YouTube", "Email"];
const TIMES = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00",
  "17:00", "18:00", "19:00", "20:00",
];

export default function CreatePostScreen() {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const { date: dateParam, postId } = useLocalSearchParams<{ date?: string; postId?: string }>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const isEditing = !!postId;
  const numericPostId = postId ? Number(postId) : undefined;

  const [platform, setPlatform] = useState("LinkedIn");
  const [content, setContent] = useState("");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [status, setStatus] = useState<"draft" | "ready">("draft");
  const [isInitialized, setIsInitialized] = useState(!isEditing);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { data: platformStatus } = useQuery({
    queryKey: ["social-account-status", platform],
    queryFn: () => fetchSocialAccountStatus(platform),
    enabled: platform !== "Email",
  });

  const isConnected = platformStatus?.connected === true;

  const { data: existingPost, isLoading: isLoadingPost } = useQuery({
    queryKey: ["scheduled-post", numericPostId],
    queryFn: () => fetchScheduledPost(numericPostId!),
    enabled: isEditing,
  });

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? "Edit Post" : "Schedule Post",
    });
  }, [isEditing, navigation]);

  useEffect(() => {
    if (existingPost && !isInitialized) {
      setPlatform(existingPost.platform);
      setContent(existingPost.content);
      const postDate = new Date(existingPost.scheduledAt);
      const hours = postDate.getHours().toString().padStart(2, "0");
      const minutes = postDate.getMinutes().toString().padStart(2, "0");
      setSelectedTime(`${hours}:${minutes}`);
      setStatus(existingPost.status === "ready" ? "ready" : "draft");
      setIsInitialized(true);
    }
  }, [existingPost, isInitialized]);

  const baseDate = isEditing && existingPost
    ? new Date(existingPost.scheduledAt)
    : dateParam
      ? new Date(dateParam)
      : new Date();

  const saveMutation = useMutation({
    mutationFn: () => {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledAt = new Date(baseDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      if (isEditing && numericPostId) {
        return updateScheduledPost(numericPostId, {
          platform,
          content,
          scheduledAt: scheduledAt.toISOString(),
          status,
        });
      }
      return createScheduledPost({
        platform,
        content,
        scheduledAt: scheduledAt.toISOString(),
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ["scheduled-post", numericPostId] });
      }
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteScheduledPost(numericPostId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const validation = await validatePostContent(platform, content);
      if (!validation.valid) {
        throw new Error(validation.errors.join("; "));
      }

      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledAt = new Date(baseDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      let postIdToPublish = numericPostId;
      if (!isEditing) {
        const created = await createScheduledPost({
          platform,
          content,
          scheduledAt: scheduledAt.toISOString(),
          status: "ready",
        });
        postIdToPublish = created.id;
      }

      return publishPost(platform, content, postIdToPublish);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
        if (isEditing) {
          queryClient.invalidateQueries({ queryKey: ["scheduled-post", numericPostId] });
        }
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Published!", `Your post has been published to ${platform}.`);
        router.back();
      } else {
        Alert.alert("Publish Failed", result.error || "Could not publish to the platform.");
      }
    },
    onError: (error: Error) => {
      Alert.alert("Publish Error", error.message);
    },
  });

  useEffect(() => {
    if (content.trim() && platform !== "Email") {
      const CHAR_LIMITS: Record<string, number> = {
        "X/Twitter": 280,
        LinkedIn: 3000,
        Instagram: 2200,
        TikTok: 2200,
        YouTube: 5000,
      };
      const limit = CHAR_LIMITS[platform];
      if (limit && content.length > limit) {
        setValidationErrors([`${platform} posts cannot exceed ${limit} characters (currently ${content.length})`]);
      } else {
        setValidationErrors([]);
      }
    } else {
      setValidationErrors([]);
    }
  }, [content, platform]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this scheduled post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  if (isEditing && isLoadingPost) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={c.tint} />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

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

      {validationErrors.length > 0 && (
        <View style={styles.validationErrors}>
          {validationErrors.map((err, i) => (
            <View key={i} style={styles.validationErrorRow}>
              <Feather name="alert-circle" size={14} color={c.error} />
              <Text style={styles.validationErrorText}>{err}</Text>
            </View>
          ))}
        </View>
      )}

      {isConnected && platform !== "Email" && (
        <View style={styles.connectionBadge}>
          <Feather name="check-circle" size={14} color={c.success} />
          <Text style={styles.connectionBadgeText}>
            {platform} connected{platformStatus?.username ? ` as ${platformStatus.username}` : ""}
          </Text>
        </View>
      )}

      {existingPost?.googleCalendarEventId && (
        <View style={styles.syncBadge}>
          <Feather name="calendar" size={14} color={c.success} />
          <Text style={styles.syncBadgeText}>Synced with Google Calendar</Text>
        </View>
      )}

      {isConnected && platform !== "Email" && (
        <Pressable
          style={({ pressed }) => [
            styles.publishButton,
            pressed && { opacity: 0.8 },
            (!content.trim() || publishMutation.isPending || validationErrors.length > 0) && { opacity: 0.5 },
          ]}
          onPress={() => publishMutation.mutate()}
          disabled={!content.trim() || publishMutation.isPending || validationErrors.length > 0}
          testID="publish-post"
        >
          {publishMutation.isPending ? (
            <ActivityIndicator size="small" color={c.background} />
          ) : (
            <Feather name="send" size={18} color={c.background} />
          )}
          <Text style={styles.publishButtonText}>
            {publishMutation.isPending ? "Publishing..." : "Publish Now"}
          </Text>
        </Pressable>
      )}

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
          {saveMutation.isPending
            ? isEditing ? "Saving..." : "Scheduling..."
            : isEditing ? "Save Changes" : "Schedule Post"}
        </Text>
      </Pressable>

      {isEditing && (
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && { opacity: 0.8 },
            deleteMutation.isPending && { opacity: 0.5 },
          ]}
          onPress={handleDelete}
          disabled={deleteMutation.isPending}
          testID="delete-post"
        >
          {deleteMutation.isPending ? (
            <ActivityIndicator size="small" color={c.error} />
          ) : (
            <Feather name="trash-2" size={18} color={c.error} />
          )}
          <Text style={styles.deleteButtonText}>
            {deleteMutation.isPending ? "Deleting..." : "Delete Post"}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const createStyles = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.surface },
  scrollContent: { padding: spacing.xl, paddingBottom: 40 },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: c.textSecondary,
    marginTop: spacing.md,
  },
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
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: c.success + "15",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.lg,
    alignSelf: "flex-start",
  },
  syncBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.success,
  },
  validationErrors: {
    marginTop: spacing.lg,
    backgroundColor: c.error + "10",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: c.error + "30",
  },
  validationErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 2,
  },
  validationErrorText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.error,
    flex: 1,
  },
  connectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: c.success + "15",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.lg,
    alignSelf: "flex-start",
  },
  connectionBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.success,
  },
  publishButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.success,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  publishButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: c.background,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.tint,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  saveButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: c.background,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.error + "10",
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: c.error + "30",
  },
  deleteButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: c.error,
  },
});
