import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
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

import type { ColorPalette } from "@/constants/colors";
import { fonts, spacing, radius } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import {
  aiGenerateInterviewPrep,
  createInterviewPrep,
  fetchInterviewPreps,
  deleteInterviewPrep,
} from "@/lib/api";

const EPISODE_LENGTHS = ["30", "45", "60", "90"];

type InterviewQuestion = {
  segment: string;
  question: string;
  follow_ups: string[];
  notes: string;
};

type RunOfShowItem = {
  time: string;
  duration_minutes: number;
  section: string;
  description: string;
  notes: string;
};

type InterviewPrepResult = {
  guest_brief: string;
  questions: InterviewQuestion[];
  run_of_show: RunOfShowItem[];
};

type SavedPrep = {
  id: number;
  guestName: string;
  guestBio: string;
  interviewTopic: string;
  episodeLength: string;
  content: string;
  createdAt: string;
};

const SEGMENT_LABELS: Record<string, { label: string; color: string }> = {
  opening: { label: "Opening / Rapport", color: "#22C55E" },
  core_topic: { label: "Core Topic", color: "#3B82F6" },
  deep_dive: { label: "Deep Dive", color: "#8B5CF6" },
  rapid_fire: { label: "Rapid Fire", color: "#F59E0B" },
  close: { label: "Close", color: "#EF4444" },
};

export default function InterviewPrepScreen() {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const queryClient = useQueryClient();
  const [guestName, setGuestName] = useState("");
  const [guestBio, setGuestBio] = useState("");
  const [interviewTopic, setInterviewTopic] = useState("");
  const [episodeLength, setEpisodeLength] = useState("45");
  const [result, setResult] = useState<InterviewPrepResult | null>(null);
  const [activeTab, setActiveTab] = useState<"brief" | "questions" | "runsheet">("brief");
  const [showDrafts, setShowDrafts] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const { data: drafts = [] } = useQuery({
    queryKey: ["interview-preps"],
    queryFn: fetchInterviewPreps,
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      aiGenerateInterviewPrep({ guestName, guestBio, interviewTopic, episodeLength }),
    onSuccess: (data: InterviewPrepResult) => {
      setResult(data);
      if (Platform.OS !== "web")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      Alert.alert("Error", "Failed to generate interview prep. Please try again.");
    },
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      createInterviewPrep({
        guestName,
        guestBio,
        interviewTopic,
        episodeLength,
        content: JSON.stringify(result),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interview-preps"] });
      if (Platform.OS !== "web")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", "Interview prep saved to drafts");
    },
    onError: () => {
      Alert.alert("Error", "Failed to save interview prep. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteInterviewPrep(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interview-preps"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete interview prep. Please try again.");
    },
  });

  const handleExport = async () => {
    if (!result) return;

    const segments = ["opening", "core_topic", "deep_dive", "rapid_fire", "close"];
    const questionsBySegment = segments.map((seg) => ({
      segment: SEGMENT_LABELS[seg]?.label || seg,
      questions: result.questions.filter((q) => q.segment === seg),
    }));

    const text = [
      `# Interview Prep: ${guestName}`,
      `## Topic: ${interviewTopic}`,
      `\n## Guest Brief\n${result.guest_brief}`,
      `\n## Questions`,
      ...questionsBySegment
        .filter((g) => g.questions.length > 0)
        .map(
          (g) =>
            `\n### ${g.segment}\n${g.questions
              .map(
                (q, i) =>
                  `${i + 1}. ${q.question}\n   Follow-ups: ${q.follow_ups.join("; ")}\n   Notes: ${q.notes}`
              )
              .join("\n")}`
        ),
      `\n## Run of Show`,
      ...result.run_of_show.map(
        (item) =>
          `${item.time} - ${item.section} (${item.duration_minutes} min)\n  ${item.description}\n  Notes: ${item.notes}`
      ),
    ].join("\n");

    if (Platform.OS === "web") {
      await navigator.clipboard.writeText(text);
      Alert.alert("Copied", "Interview prep exported to clipboard");
    } else {
      await Share.share({ title: `Interview Prep: ${guestName}`, message: text });
    }
  };

  const handleLoadDraft = (draft: SavedPrep) => {
    try {
      const parsed = JSON.parse(draft.content) as InterviewPrepResult;
      setResult(parsed);
      setGuestName(draft.guestName);
      setGuestBio(draft.guestBio);
      setInterviewTopic(draft.interviewTopic);
      setEpisodeLength(draft.episodeLength);
      setShowDrafts(false);
    } catch {
      Alert.alert("Error", "Could not load this draft");
    }
  };

  if (showDrafts) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.draftsHeader}>
          <Pressable onPress={() => setShowDrafts(false)} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={c.tint} />
          </Pressable>
          <Text style={styles.sectionTitle}>Saved Preps</Text>
          <Text style={styles.countBadge}>{drafts.length}</Text>
        </View>

        {drafts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-question" size={40} color={c.textMuted} />
            <Text style={styles.emptyText}>No saved preps yet</Text>
            <Text style={styles.emptySubtext}>
              Generate an interview prep and save it to see it here
            </Text>
          </View>
        ) : (
          drafts.slice().reverse().map((draft: SavedPrep) => (
            <Pressable
              key={draft.id}
              style={({ pressed }) => [styles.draftCard, pressed && { opacity: 0.8 }]}
              onPress={() => handleLoadDraft(draft)}
            >
              <View style={styles.draftCardTop}>
                <View style={styles.guestBadge}>
                  <MaterialCommunityIcons name="account" size={14} color={c.tint} />
                </View>
                <Pressable
                  onPress={() => deleteMutation.mutate(draft.id)}
                  hitSlop={8}
                >
                  <Feather name="trash-2" size={16} color={c.error} />
                </Pressable>
              </View>
              <Text style={styles.draftTitle} numberOfLines={1}>
                {draft.guestName}
              </Text>
              <Text style={styles.draftMeta}>
                {draft.interviewTopic} - {new Date(draft.createdAt).toLocaleDateString()}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topRow}>
        <View style={styles.typeChip}>
          <MaterialCommunityIcons name="account-question" size={14} color={c.tint} />
          <Text style={styles.typeChipText}>Interview Prep</Text>
        </View>
        <Pressable
          style={styles.draftsButton}
          onPress={() => setShowDrafts(true)}
        >
          <Feather name="folder" size={14} color={c.tint} />
          <Text style={styles.draftsButtonText}>
            Drafts ({drafts.length})
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Guest Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Who are you interviewing?"
        placeholderTextColor={c.textMuted}
        value={guestName}
        onChangeText={setGuestName}
      />

      <Text style={styles.label}>Guest Bio / Background</Text>
      <TextInput
        style={[styles.input, { minHeight: 100 }]}
        placeholder="Paste their bio, LinkedIn summary, or background info..."
        placeholderTextColor={c.textMuted}
        value={guestBio}
        onChangeText={setGuestBio}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.label}>Interview Topic</Text>
      <TextInput
        style={styles.input}
        placeholder="What will you discuss?"
        placeholderTextColor={c.textMuted}
        value={interviewTopic}
        onChangeText={setInterviewTopic}
      />

      <Text style={styles.label}>Episode Length</Text>
      <View style={styles.lengthRow}>
        {EPISODE_LENGTHS.map((l) => (
          <Pressable
            key={l}
            style={[
              styles.lengthChip,
              episodeLength === l && styles.lengthChipActive,
            ]}
            onPress={() => setEpisodeLength(l)}
          >
            <Text
              style={[
                styles.lengthChipText,
                episodeLength === l && styles.lengthChipTextActive,
              ]}
            >
              {l} min
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.generateButton,
          pressed && { opacity: 0.8 },
          (!guestName.trim() || !guestBio.trim() || !interviewTopic.trim() || generateMutation.isPending) && {
            opacity: 0.5,
          },
        ]}
        onPress={() => generateMutation.mutate()}
        disabled={!guestName.trim() || !guestBio.trim() || !interviewTopic.trim() || generateMutation.isPending}
        testID="generate-interview-prep"
      >
        {generateMutation.isPending ? (
          <ActivityIndicator size="small" color={c.background} />
        ) : (
          <MaterialCommunityIcons name="auto-fix" size={18} color={c.background} />
        )}
        <Text style={styles.generateButtonText}>
          {generateMutation.isPending ? "Preparing Interview..." : "Generate Prep"}
        </Text>
      </Pressable>

      {generateMutation.isPending && (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={c.tint} />
          <Text style={styles.loadingText}>
            Researching {guestName} and preparing questions...
          </Text>
          <Text style={styles.loadingSubtext}>
            This may take 30-60 seconds
          </Text>
        </View>
      )}

      {result && !generateMutation.isPending && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>
              Interview: {guestName}
            </Text>
            <View style={styles.resultActions}>
              <Pressable
                style={styles.resultAction}
                onPress={handleExport}
              >
                <Feather name="share-2" size={16} color={c.tint} />
              </Pressable>
              <Pressable
                style={[styles.resultAction, saveMutation.isPending && { opacity: 0.5 }]}
                onPress={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                <Feather name="save" size={16} color={c.tint} />
              </Pressable>
            </View>
          </View>

          <View style={styles.tabRow}>
            {(["brief", "questions", "runsheet"] as const).map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === "brief" ? "Guest Brief" : tab === "questions" ? "Questions" : "Run of Show"}
                </Text>
              </Pressable>
            ))}
          </View>

          {activeTab === "brief" && (
            <View style={styles.briefCard}>
              <View style={styles.briefHeader}>
                <MaterialCommunityIcons name="account-circle" size={20} color={c.tint} />
                <Text style={styles.briefName}>{guestName}</Text>
              </View>
              <Text style={styles.briefContent}>{result.guest_brief}</Text>
            </View>
          )}

          {activeTab === "questions" && (
            <View style={styles.questionsContainer}>
              {["opening", "core_topic", "deep_dive", "rapid_fire", "close"].map((segment) => {
                const segQuestions = result.questions.filter((q) => q.segment === segment);
                if (segQuestions.length === 0) return null;
                const segInfo = SEGMENT_LABELS[segment] || { label: segment, color: c.tint };
                return (
                  <View key={segment} style={styles.segmentGroup}>
                    <View style={[styles.segmentLabel, { backgroundColor: segInfo.color + "20" }]}>
                      <View style={[styles.segmentDot, { backgroundColor: segInfo.color }]} />
                      <Text style={[styles.segmentLabelText, { color: segInfo.color }]}>
                        {segInfo.label}
                      </Text>
                    </View>
                    {segQuestions.map((q, qi) => {
                      const globalIndex = result.questions.indexOf(q);
                      const isExpanded = expandedQuestion === globalIndex;
                      return (
                        <Pressable
                          key={qi}
                          style={styles.questionCard}
                          onPress={() =>
                            setExpandedQuestion(isExpanded ? null : globalIndex)
                          }
                        >
                          <View style={styles.questionHeader}>
                            <Text style={styles.questionNumber}>{qi + 1}</Text>
                            <Text style={styles.questionText}>{q.question}</Text>
                            <Feather
                              name={isExpanded ? "chevron-up" : "chevron-down"}
                              size={16}
                              color={c.textMuted}
                            />
                          </View>
                          {isExpanded && (
                            <View style={styles.questionExpanded}>
                              {q.notes && (
                                <View style={styles.questionNotes}>
                                  <Feather name="info" size={12} color={c.textMuted} />
                                  <Text style={styles.questionNotesText}>{q.notes}</Text>
                                </View>
                              )}
                              <Text style={styles.followUpLabel}>Follow-ups:</Text>
                              {q.follow_ups.map((fu, fi) => (
                                <View key={fi} style={styles.followUpRow}>
                                  <Feather name="corner-down-right" size={12} color={c.tint} />
                                  <Text style={styles.followUpText}>{fu}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          )}

          {activeTab === "runsheet" && (
            <View style={styles.runsheetContainer}>
              {result.run_of_show.map((item, index) => (
                <View key={index} style={styles.runsheetItem}>
                  <View style={styles.timelineLeft}>
                    <Text style={styles.timeText}>{item.time}</Text>
                    <View style={styles.timelineLine} />
                  </View>
                  <View style={styles.runsheetContent}>
                    <View style={styles.runsheetHeader}>
                      <Text style={styles.runsheetSection}>{item.section}</Text>
                      <Text style={styles.runsheetDuration}>
                        {item.duration_minutes} min
                      </Text>
                    </View>
                    <Text style={styles.runsheetDesc}>{item.description}</Text>
                    {item.notes && (
                      <Text style={styles.runsheetNotes}>{item.notes}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const createStyles = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.surface },
  scrollContent: { padding: spacing.xl, paddingBottom: 120 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: c.tint + "15",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  typeChipText: { fontFamily: fonts.medium, fontSize: 12, color: c.tint },
  draftsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: c.tint + "40",
  },
  draftsButtonText: { fontFamily: fonts.medium, fontSize: 12, color: c.tint },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
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
  lengthRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  lengthChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.background,
  },
  lengthChipActive: { backgroundColor: c.tint + "20", borderColor: c.tint },
  lengthChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.textSecondary,
  },
  lengthChipTextActive: { color: c.tint },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.tint,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  generateButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: c.background,
  },
  loadingCard: {
    alignItems: "center",
    padding: spacing.xxxl,
    marginTop: spacing.xl,
    backgroundColor: c.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.tint + "30",
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: c.text,
    textAlign: "center",
  },
  loadingSubtext: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: c.textMuted,
  },
  resultContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: c.text,
    flex: 1,
  },
  resultActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  resultAction: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: c.tint + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: c.background,
    borderRadius: radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: c.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: c.tint + "20",
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.textMuted,
  },
  tabTextActive: {
    color: c.tint,
  },
  briefCard: {
    backgroundColor: c.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: c.border,
  },
  briefHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  briefName: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: c.tint,
  },
  briefContent: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.text,
    lineHeight: 22,
  },
  questionsContainer: {
    gap: spacing.lg,
  },
  segmentGroup: {
    gap: spacing.sm,
  },
  segmentLabel: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  segmentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  segmentLabelText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  questionCard: {
    backgroundColor: c.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: c.border,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  questionNumber: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: c.tint,
    minWidth: 20,
  },
  questionText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: c.text,
    flex: 1,
    lineHeight: 20,
  },
  questionExpanded: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  questionNotes: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: c.surfaceElevated,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  questionNotesText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: c.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  followUpLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: c.textMuted,
    marginBottom: spacing.xs,
  },
  followUpRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    paddingLeft: spacing.sm,
    marginBottom: spacing.xs,
  },
  followUpText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: c.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  runsheetContainer: {
    gap: 0,
  },
  runsheetItem: {
    flexDirection: "row",
    gap: spacing.md,
  },
  timelineLeft: {
    width: 50,
    alignItems: "center",
  },
  timeText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: c.tint,
    marginBottom: 4,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: c.tint + "30",
    marginBottom: -spacing.md,
  },
  runsheetContent: {
    flex: 1,
    backgroundColor: c.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: c.border,
  },
  runsheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  runsheetSection: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: c.text,
  },
  runsheetDuration: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: c.textMuted,
    backgroundColor: c.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  runsheetDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: c.textSecondary,
    lineHeight: 18,
  },
  runsheetNotes: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: c.textMuted,
    fontStyle: "italic",
    marginTop: spacing.xs,
  },
  draftsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: c.tint + "15",
    alignItems: "center",
    justifyContent: "center",
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
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
    textAlign: "center",
  },
  draftCard: {
    backgroundColor: c.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: c.border,
  },
  draftCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  guestBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: c.tint + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  draftTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: c.text,
  },
  draftMeta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: c.textMuted,
    marginTop: 4,
  },
});
