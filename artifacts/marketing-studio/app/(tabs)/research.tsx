import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { fonts, spacing, radius } from "@/constants/theme";
import { aiSeoResearch, createResearchNote, fetchResearchNotes } from "@/lib/api";

const c = Colors.light;

type TabKey = "seo" | "strategy";

interface PersonaField {
  name: string;
  role: string;
  painPoints: string;
  goals: string;
  channels: string;
}

interface BudgetItem {
  category: string;
  monthlyAmount: string;
}

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

  const [persona, setPersona] = useState<PersonaField>({
    name: "",
    role: "",
    painPoints: "",
    goals: "",
    channels: "",
  });

  const [hmwNotes, setHmwNotes] = useState<Record<number, string>>({});

  const DEFAULT_BUDGET: BudgetItem[] = [
    { category: "Content Creation", monthlyAmount: "" },
    { category: "Paid Ads", monthlyAmount: "" },
    { category: "SEO Tools", monthlyAmount: "" },
    { category: "Design / Brand", monthlyAmount: "" },
    { category: "Community / Events", monthlyAmount: "" },
  ];
  const [budget, setBudget] = useState<BudgetItem[]>(DEFAULT_BUDGET);

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
    mutationFn: (params: { category: string; topic: string; content: string }) =>
      createResearchNote(params.category, params.topic, params.content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-notes"] });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", "Research note saved successfully");
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
              saveMutation.mutate({ category: "seo", topic, content: JSON.stringify(seoResults) })
            }
          >
            <Feather name="save" size={16} color={c.tint} />
            <Text style={styles.saveButtonText}>Save Research</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );

  const updateBudget = (index: number, amount: string) => {
    setBudget((prev) =>
      prev.map((item, i) => (i === index ? { ...item, monthlyAmount: amount } : item))
    );
  };

  const budgetTotal = budget.reduce(
    (sum, item) => sum + (parseFloat(item.monthlyAmount) || 0),
    0
  );

  const renderStrategyTab = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.strategySection}>
        <View style={styles.strategySectionHeader}>
          <Feather name="user" size={18} color={c.tint} />
          <Text style={styles.strategySectionTitle}>Persona Builder</Text>
        </View>
        <Text style={styles.strategySectionDesc}>
          Define your ideal customer to sharpen messaging
        </Text>
        <View style={styles.personaCard}>
          <Text style={styles.personaLabel}>Persona Name</Text>
          <TextInput
            style={styles.personaInput}
            placeholder="e.g., Bootstrapped Ben"
            placeholderTextColor={c.textMuted}
            value={persona.name}
            onChangeText={(v) => setPersona((p) => ({ ...p, name: v }))}
          />
          <Text style={styles.personaLabel}>Role / Title</Text>
          <TextInput
            style={styles.personaInput}
            placeholder="e.g., Solo founder, pre-revenue SaaS"
            placeholderTextColor={c.textMuted}
            value={persona.role}
            onChangeText={(v) => setPersona((p) => ({ ...p, role: v }))}
          />
          <Text style={styles.personaLabel}>Pain Points</Text>
          <TextInput
            style={[styles.personaInput, { minHeight: 60 }]}
            placeholder="What keeps them up at night?"
            placeholderTextColor={c.textMuted}
            value={persona.painPoints}
            onChangeText={(v) => setPersona((p) => ({ ...p, painPoints: v }))}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.personaLabel}>Goals</Text>
          <TextInput
            style={[styles.personaInput, { minHeight: 60 }]}
            placeholder="What are they trying to achieve?"
            placeholderTextColor={c.textMuted}
            value={persona.goals}
            onChangeText={(v) => setPersona((p) => ({ ...p, goals: v }))}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.personaLabel}>Preferred Channels</Text>
          <TextInput
            style={styles.personaInput}
            placeholder="e.g., LinkedIn, Twitter, newsletters"
            placeholderTextColor={c.textMuted}
            value={persona.channels}
            onChangeText={(v) => setPersona((p) => ({ ...p, channels: v }))}
          />
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && { opacity: 0.8 },
              !persona.name.trim() && { opacity: 0.5 },
            ]}
            onPress={() =>
              saveMutation.mutate({
                category: "persona",
                topic: persona.name,
                content: JSON.stringify(persona),
              })
            }
            disabled={!persona.name.trim()}
          >
            <Feather name="save" size={16} color={c.tint} />
            <Text style={styles.saveButtonText}>Save Persona</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.strategySection}>
        <View style={styles.strategySectionHeader}>
          <MaterialCommunityIcons name="cash-multiple" size={20} color={c.tint} />
          <Text style={styles.strategySectionTitle}>Budget Planner</Text>
        </View>
        <Text style={styles.strategySectionDesc}>
          Plan your bootstrapped marketing spend
        </Text>
        <View style={styles.budgetCard}>
          {budget.map((item, index) => (
            <View key={item.category} style={styles.budgetRow}>
              <Text style={styles.budgetCategory}>{item.category}</Text>
              <View style={styles.budgetInputWrap}>
                <Text style={styles.budgetCurrency}>$</Text>
                <TextInput
                  style={styles.budgetInput}
                  placeholder="0"
                  placeholderTextColor={c.textMuted}
                  keyboardType="numeric"
                  value={item.monthlyAmount}
                  onChangeText={(v) => updateBudget(index, v)}
                />
                <Text style={styles.budgetPeriod}>/mo</Text>
              </View>
            </View>
          ))}
          <View style={styles.budgetTotalRow}>
            <Text style={styles.budgetTotalLabel}>Total Monthly</Text>
            <Text style={styles.budgetTotalAmount}>
              ${budgetTotal.toLocaleString()}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && { opacity: 0.8 },
              budgetTotal === 0 && { opacity: 0.5 },
            ]}
            onPress={() =>
              saveMutation.mutate({
                category: "budget",
                topic: `Monthly Budget Plan ($${budgetTotal})`,
                content: JSON.stringify(budget),
              })
            }
            disabled={budgetTotal === 0}
          >
            <Feather name="save" size={16} color={c.tint} />
            <Text style={styles.saveButtonText}>Save Budget</Text>
          </Pressable>
        </View>
      </View>

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
            <TextInput
              style={styles.hmwInput}
              placeholder="Jot your ideas here..."
              placeholderTextColor={c.textMuted}
              value={hmwNotes[i] || ""}
              onChangeText={(v) =>
                setHmwNotes((prev) => ({ ...prev, [i]: v }))
              }
              multiline
              textAlignVertical="top"
            />
            {(hmwNotes[i] || "").trim() !== "" && (
              <Pressable
                style={({ pressed }) => [
                  styles.hmwSaveBtn,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  saveMutation.mutate({
                    category: "hmw",
                    topic: prompt,
                    content: hmwNotes[i],
                  });
                  setHmwNotes((prev) => ({ ...prev, [i]: "" }));
                }}
              >
                <Feather name="save" size={14} color={c.tint} />
                <Text style={styles.hmwSaveBtnText}>Save Note</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <View style={styles.strategySection}>
        <View style={styles.strategySectionHeader}>
          <Feather name="bookmark" size={18} color={c.tint} />
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
  hmwInput: {
    backgroundColor: c.inputBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: c.text,
    borderWidth: 1,
    borderColor: c.border,
    marginTop: spacing.sm,
    minHeight: 40,
  },
  hmwSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: c.tint,
    marginTop: spacing.sm,
  },
  hmwSaveBtnText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.tint,
  },
  personaCard: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: c.border,
  },
  personaLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  personaInput: {
    backgroundColor: c.inputBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.text,
    borderWidth: 1,
    borderColor: c.border,
  },
  budgetCard: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: c.border,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  budgetCategory: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: c.text,
    flex: 1,
  },
  budgetInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.inputBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
  },
  budgetCurrency: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: c.tint,
  },
  budgetInput: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.text,
    width: 60,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    textAlign: "right",
  },
  budgetPeriod: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: c.textMuted,
  },
  budgetTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  budgetTotalLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: c.text,
  },
  budgetTotalAmount: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: c.tint,
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
