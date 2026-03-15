import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { fonts, spacing, radius } from "@/constants/theme";
import { aiSeoResearch, createResearchNote, fetchResearchNotes } from "@/lib/api";

const c = Colors.light;

type TabKey = "seo" | "strategy";

const HMW_PROMPTS = [
  "How might we differentiate from well-funded competitors?",
  "How might we build trust with zero social proof?",
  "How might we create viral content on a shoestring budget?",
  "How might we turn our constraints into advantages?",
  "How might we build a community before we have a product?",
];

export default function ResearchTab() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === "web" ? 67 : 0;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("seo");
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [seoResults, setSeoResults] = useState<{
    keywords: string[];
    questions: string[];
    talkingPoints: string[];
    aeoSummary: string;
  } | null>(null);

  const { data: notes = [] } = useQuery({
    queryKey: ["research-notes"],
    queryFn: fetchResearchNotes,
  });

  const seoMutation = useMutation({
    mutationFn: () => aiSeoResearch(topic, audience),
    onSuccess: (data) => {
      setSeoResults(data);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const saveMutation = useMutation({
    mutationFn: (content: string) =>
      createResearchNote("seo", topic, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-notes"] });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const renderSeoTab = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Topic</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., SaaS pricing strategies"
          placeholderTextColor={c.textMuted}
          value={topic}
          onChangeText={setTopic}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Target Audience (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., B2B startup founders"
          placeholderTextColor={c.textMuted}
          value={audience}
          onChangeText={setAudience}
        />
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.searchButton,
          pressed && { opacity: 0.8 },
          (!topic.trim() || seoMutation.isPending) && { opacity: 0.5 },
        ]}
        onPress={() => seoMutation.mutate()}
        disabled={!topic.trim() || seoMutation.isPending}
        testID="seo-search"
      >
        {seoMutation.isPending ? (
          <ActivityIndicator size="small" color={c.background} />
        ) : (
          <Feather name="search" size={16} color={c.background} />
        )}
        <Text style={styles.searchButtonText}>
          {seoMutation.isPending ? "Researching..." : "Research Topic"}
        </Text>
      </Pressable>

      {seoResults && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultSection}>
            <View style={styles.resultSectionHeader}>
              <MaterialCommunityIcons name="tag-outline" size={18} color={c.tint} />
              <Text style={styles.resultSectionTitle}>Keywords</Text>
            </View>
            <View style={styles.tagGrid}>
              {seoResults.keywords.map((kw, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{kw}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.resultSection}>
            <View style={styles.resultSectionHeader}>
              <Feather name="help-circle" size={16} color={c.tint} />
              <Text style={styles.resultSectionTitle}>People Also Ask</Text>
            </View>
            {seoResults.questions.map((q, i) => (
              <View key={i} style={styles.questionItem}>
                <Text style={styles.questionText}>{q}</Text>
              </View>
            ))}
          </View>

          <View style={styles.resultSection}>
            <View style={styles.resultSectionHeader}>
              <Feather name="list" size={16} color={c.tint} />
              <Text style={styles.resultSectionTitle}>Talking Points</Text>
            </View>
            {seoResults.talkingPoints.map((tp, i) => (
              <View key={i} style={styles.talkingPointItem}>
                <View style={styles.bulletDot} />
                <Text style={styles.talkingPointText}>{tp}</Text>
              </View>
            ))}
          </View>

          <View style={styles.resultSection}>
            <View style={styles.resultSectionHeader}>
              <MaterialCommunityIcons name="robot-outline" size={18} color={c.tint} />
              <Text style={styles.resultSectionTitle}>AEO Summary</Text>
            </View>
            <Text style={styles.aeoText}>{seoResults.aeoSummary}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() =>
              saveMutation.mutate(JSON.stringify(seoResults))
            }
          >
            <Feather name="save" size={16} color={c.tint} />
            <Text style={styles.saveButtonText}>Save Research</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );

  const renderStrategyTab = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.strategySection}>
        <View style={styles.strategySectionHeader}>
          <MaterialCommunityIcons name="lightbulb-outline" size={20} color={c.tint} />
          <Text style={styles.strategySectionTitle}>
            How Might We...
          </Text>
        </View>
        <Text style={styles.strategySectionDesc}>
          Design thinking prompts for bootstrapped brand building
        </Text>
        {HMW_PROMPTS.map((prompt, i) => (
          <View key={i} style={styles.hmwCard}>
            <Text style={styles.hmwText}>{prompt}</Text>
          </View>
        ))}
      </View>

      <View style={styles.strategySection}>
        <View style={styles.strategySectionHeader}>
          <Feather name="users" size={18} color={c.tint} />
          <Text style={styles.strategySectionTitle}>Saved Notes</Text>
        </View>
        {notes.length === 0 ? (
          <View style={styles.emptyMini}>
            <Text style={styles.emptyMiniText}>
              No saved research notes yet
            </Text>
          </View>
        ) : (
          notes
            .slice()
            .reverse()
            .slice(0, 5)
            .map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteCategory}>{note.category}</Text>
                <Text style={styles.noteTopic} numberOfLines={1}>
                  {note.topic}
                </Text>
              </View>
            ))
        )}
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Research</Text>
        <Text style={styles.headerSubtitle}>
          SEO, AEO & brand strategy
        </Text>
      </View>

      <View style={styles.tabBar}>
        {(["seo", "strategy"] as TabKey[]).map((tab) => (
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
              {tab === "seo" ? "SEO / AEO" : "Strategy"}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === "seo" ? renderSeoTab() : renderStrategyTab()}
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
  scrollContent: { paddingHorizontal: spacing.xl, paddingBottom: 120 },
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: c.inputBg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: c.text,
    borderWidth: 1,
    borderColor: c.border,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.tint,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  searchButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: c.background,
  },
  resultsContainer: { gap: spacing.xl },
  resultSection: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: c.border,
  },
  resultSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  resultSectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: c.text,
  },
  tagGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  tag: {
    backgroundColor: c.tint + "20",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  tagText: { fontFamily: fonts.medium, fontSize: 12, color: c.tint },
  questionItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  questionText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.text,
    lineHeight: 20,
  },
  talkingPointItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: c.tint,
    marginTop: 6,
  },
  talkingPointText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.text,
    lineHeight: 20,
  },
  aeoText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.textSecondary,
    lineHeight: 22,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.surface,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.tint,
    gap: spacing.sm,
  },
  saveButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: c.tint,
  },
  strategySection: { marginBottom: spacing.xxl },
  strategySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  strategySectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: c.text,
  },
  strategySectionDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: c.textSecondary,
    marginBottom: spacing.lg,
  },
  hmwCard: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: c.tint,
  },
  hmwText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: c.text,
    lineHeight: 22,
  },
  emptyMini: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyMiniText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: c.textMuted,
  },
  noteCard: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
  },
  noteCategory: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: c.tint,
    textTransform: "uppercase" as const,
  },
  noteTopic: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: c.text,
    marginTop: 2,
  },
});
