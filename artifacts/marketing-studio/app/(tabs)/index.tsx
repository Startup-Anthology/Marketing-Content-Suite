import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { fonts, spacing, radius, platformColors } from "@/constants/theme";
import { fetchContent } from "@/lib/api";

const c = Colors.light;

const CONTENT_TYPES = [
  { label: "Social Post", icon: "message-square" as const, type: "social" },
  { label: "Newsletter", icon: "mail" as const, type: "newsletter" },
  { label: "Caption", icon: "type" as const, type: "caption" },
  { label: "Blog Post", icon: "file-text" as const, type: "blog" },
];

const PODCAST_TOOLS = [
  { label: "Podcast Generator", icon: "mic" as const, route: "/podcast-generator" as const },
  { label: "Interview Prep", icon: "users" as const, route: "/interview-prep" as const },
];

export default function CreateTab() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === "web" ? 67 : 0;
  const { data: content = [], isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: fetchContent,
  });

  const handleNewContent = (type: string) => {
    router.push({ pathname: "/create-content", params: { type } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create</Text>
        <Text style={styles.headerSubtitle}>
          Build your marketing content
        </Text>
      </View>

      <View style={styles.typeGrid}>
        {CONTENT_TYPES.map((item) => (
          <Pressable
            key={item.type}
            style={({ pressed }) => [
              styles.typeCard,
              pressed && styles.typeCardPressed,
            ]}
            onPress={() => handleNewContent(item.type)}
            testID={`create-${item.type}`}
          >
            <View style={styles.typeIconWrap}>
              <Feather name={item.icon} size={22} color={c.tint} />
            </View>
            <Text style={styles.typeLabel}>{item.label}</Text>
            <Feather name="plus" size={16} color={c.textSecondary} />
          </Pressable>
        ))}
      </View>

      <View style={styles.podcastHeader}>
        <Text style={styles.sectionTitle}>Podcast</Text>
      </View>
      <View style={styles.podcastGrid}>
        {PODCAST_TOOLS.map((item) => (
          <Pressable
            key={item.route}
            style={({ pressed }) => [
              styles.podcastCard,
              pressed && styles.typeCardPressed,
            ]}
            onPress={() => router.push(item.route)}
            testID={`podcast-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <View style={styles.podcastIconWrap}>
              <Feather name={item.icon} size={22} color={c.tint} />
            </View>
            <Text style={styles.typeLabel}>{item.label}</Text>
            <Feather name="chevron-right" size={16} color={c.textSecondary} />
          </Pressable>
        ))}
      </View>

      <View style={styles.recentHeader}>
        <Text style={styles.sectionTitle}>Recent Drafts</Text>
        <Text style={styles.countBadge}>{content.length}</Text>
      </View>

      {isLoading ? (
        <View style={styles.emptyState}>
          <View style={styles.skeleton} />
          <View style={[styles.skeleton, { width: "60%" }]} />
        </View>
      ) : content.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="file-text" size={40} color={c.textMuted} />
          <Text style={styles.emptyText}>No drafts yet</Text>
          <Text style={styles.emptySubtext}>
            Tap a content type above to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={content.slice().reverse()}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={content.length > 0}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.draftCard,
                pressed && styles.draftCardPressed,
              ]}
            >
              <View style={styles.draftTop}>
                <View
                  style={[
                    styles.platformBadge,
                    {
                      backgroundColor:
                        (platformColors[item.platform] || c.tint) + "20",
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      item.platform === "LinkedIn"
                        ? "linkedin"
                        : item.platform === "X/Twitter"
                          ? "twitter"
                          : item.platform === "Instagram"
                            ? "instagram"
                            : "email-outline"
                    }
                    size={14}
                    color={platformColors[item.platform] || c.tint}
                  />
                  <Text
                    style={[
                      styles.platformText,
                      { color: platformColors[item.platform] || c.tint },
                    ]}
                  >
                    {item.platform}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === "published"
                          ? c.success + "20"
                          : c.tint + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          item.status === "published" ? c.success : c.tint,
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.draftTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.draftPreview} numberOfLines={2}>
                {item.body}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: c.text,
  },
  headerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.textSecondary,
    marginTop: 2,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  typeCard: {
    width: "47%",
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
  },
  typeCardPressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  typeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: c.tint + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  typeLabel: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: c.text,
  },
  podcastHeader: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
  },
  podcastGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  podcastCard: {
    width: "47%",
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: c.tint + "30",
  },
  podcastIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: c.tint + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: c.text,
  },
  countBadge: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.tint,
    backgroundColor: c.tint + "20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: 120 },
  draftCard: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: c.border,
  },
  draftCardPressed: { opacity: 0.8 },
  draftTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  platformBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  platformText: { fontFamily: fonts.medium, fontSize: 11 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusText: { fontFamily: fonts.medium, fontSize: 11 },
  draftTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: c.text,
  },
  draftPreview: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: c.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    gap: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: c.textMuted,
  },
  emptySubtext: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: c.textMuted,
  },
  skeleton: {
    height: 16,
    width: "80%",
    backgroundColor: c.surface,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
});
