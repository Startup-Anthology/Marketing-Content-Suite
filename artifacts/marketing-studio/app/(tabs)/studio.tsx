import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { fonts, spacing, radius } from "@/constants/theme";
import { fetchStoryboards } from "@/lib/api";

const c = Colors.light;

type TabKey = "storyboards" | "ads";

export default function StudioTab() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === "web" ? 67 : 0;
  const [activeTab, setActiveTab] = useState<TabKey>("storyboards");
  const { data: storyboards = [], isLoading } = useQuery({
    queryKey: ["storyboards"],
    queryFn: fetchStoryboards,
  });

  const filtered = storyboards.filter((s: { type: string }) =>
    activeTab === "storyboards" ? s.type === "storyboard" : s.type === "ad-creative"
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Studio</Text>
        <Text style={styles.headerSubtitle}>
          Storyboards & ad creatives
        </Text>
      </View>

      <View style={styles.tabBar}>
        {(["storyboards", "ads"] as TabKey[]).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab === "storyboards" ? "Storyboards" : "Ad Creatives"}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.newButton,
          pressed && { opacity: 0.8 },
        ]}
        onPress={() =>
          router.push({
            pathname: "/create-storyboard",
            params: { type: activeTab === "storyboards" ? "storyboard" : "ad-creative" },
          })
        }
        testID="new-storyboard"
      >
        <Feather name="plus" size={18} color={c.background} />
        <Text style={styles.newButtonText}>
          New {activeTab === "storyboards" ? "Storyboard" : "Ad Creative"}
        </Text>
      </Pressable>

      {isLoading ? (
        <View style={styles.emptyState}>
          <View style={styles.skeleton} />
          <View style={[styles.skeleton, { width: "60%" }]} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name={activeTab === "storyboards" ? "movie-open-outline" : "bullhorn-outline"}
            size={40}
            color={c.textMuted}
          />
          <Text style={styles.emptyText}>
            No {activeTab === "storyboards" ? "storyboards" : "ad creatives"} yet
          </Text>
          <Text style={styles.emptySubtext}>
            Tap the button above to create one
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered.slice().reverse()}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={filtered.length > 0}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            let sceneCount = 0;
            try {
              sceneCount = JSON.parse(item.scenes).length;
            } catch {}
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={styles.cardIcon}>
                  <MaterialCommunityIcons
                    name={item.type === "storyboard" ? "filmstrip" : "bullhorn"}
                    size={24}
                    color={c.tint}
                  />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {sceneCount} {sceneCount === 1 ? "scene" : "scenes"}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={c.textMuted} />
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  headerTitle: { fontFamily: fonts.bold, fontSize: 28, color: c.text },
  headerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.textSecondary,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: spacing.xl,
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.lg,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  tabItemActive: { backgroundColor: c.tint },
  tabText: { fontFamily: fonts.medium, fontSize: 13, color: c.textSecondary },
  tabTextActive: { color: c.background, fontFamily: fonts.semibold },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.tint,
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  newButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: c.background,
  },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: 120 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: c.border,
    gap: spacing.md,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: c.tint + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: { flex: 1 },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
  cardMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: c.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    gap: spacing.sm,
  },
  emptyText: { fontFamily: fonts.semibold, fontSize: 16, color: c.textMuted },
  emptySubtext: { fontFamily: fonts.regular, fontSize: 13, color: c.textMuted },
  skeleton: {
    height: 16,
    width: "80%",
    backgroundColor: c.surface,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
});
