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
  aiGeneratePodcastScript,
  createPodcastScript,
  fetchPodcastScripts,
  deletePodcastScript,
} from "@/lib/api";

const FORMATS = [
  { label: "Solo Explainer", value: "solo", icon: "account" as const },
  { label: "Conversational Duo", value: "duo", icon: "account-multiple" as const },
  { label: "Interview", value: "interview", icon: "microphone" as const },
  { label: "Debate", value: "debate", icon: "swap-horizontal" as const },
  { label: "Narrative", value: "narrative", icon: "book-open-variant" as const },
];

const LENGTHS = ["15", "30", "45", "60"];

type PodcastSegment = {
  title: string;
  hook: string;
  content: string;
  duration_minutes: number;
};

type PodcastScriptResult = {
  cold_open: string;
  setup: string;
  segments: PodcastSegment[];
  takeaways: string;
  outro: string;
};

type SavedScript = {
  id: number;
  episodeTitle: string;
  topic: string;
  format: string;
  targetLength: string;
  script: string;
  createdAt: string;
};

export default function PodcastGeneratorScreen() {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [format, setFormat] = useState("solo");
  const [targetLength, setTargetLength] = useState("30");
  const [result, setResult] = useState<PodcastScriptResult | null>(null);
  const [showDrafts, setShowDrafts] = useState(false);
  const [expandedSegment, setExpandedSegment] = useState<number | null>(null);

  const { data: drafts = [] } = useQuery({
    queryKey: ["podcast-scripts"],
    queryFn: fetchPodcastScripts,
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      aiGeneratePodcastScript({ topic, format, targetLength, episodeTitle }),
    onSuccess: (data: PodcastScriptResult) => {
      setResult(data);
      if (Platform.OS !== "web")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      Alert.alert("Error", "Failed to generate podcast script. Please try again.");
    },
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      createPodcastScript({
        episodeTitle,
        topic,
        format,
        targetLength,
        script: JSON.stringify(result),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-scripts"] });
      if (Platform.OS !== "web")
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", "Podcast script saved to drafts");
    },
    onError: () => {
      Alert.alert("Error", "Failed to save script. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePodcastScript(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-scripts"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete script. Please try again.");
    },
  });

  const handleCopySection = async (text: string, label: string) => {
    if (Platform.OS === "web") {
      await navigator.clipboard.writeText(text);
    } else {
      await Clipboard.setStringAsync(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert("Copied", `${label} copied to clipboard`);
  };

  const handleCopyAll = async () => {
    if (!result) return;
    const fullScript = [
      `# ${episodeTitle}`,
      `\n## Cold Open\n${result.cold_open}`,
      `\n## Setup\n${result.setup}`,
      ...result.segments.map(
        (s, i) => `\n## Segment ${i + 1}: ${s.title}\n${s.hook}\n\n${s.content}`
      ),
      `\n## Key Takeaways\n${result.takeaways}`,
      `\n## Outro\n${result.outro}`,
    ].join("\n");
    await handleCopySection(fullScript, "Full script");
  };

  const handleLoadDraft = (draft: SavedScript) => {
    try {
      const parsed = JSON.parse(draft.script) as PodcastScriptResult;
      setResult(parsed);
      setEpisodeTitle(draft.episodeTitle);
      setTopic(draft.topic);
      setFormat(draft.format);
      setTargetLength(draft.targetLength);
      setShowDrafts(false);
    } catch {
      Alert.alert("Error", "Could not load this draft");
    }
  };

  const renderSpeakerContent = (text: string) => {
    const parts = text.split(/(\[(?:HOST|HOST A|HOST B|GUEST|SPEAKER 1|SPEAKER 2|NARRATOR|VOICE|PAUSE|EMPHASIS)\])/g);
    return parts.map((part, i) => {
      if (/^\[(HOST|HOST A|HOST B|GUEST|SPEAKER 1|SPEAKER 2|NARRATOR|VOICE)\]$/.test(part)) {
        return (
          <Text key={i} style={styles.speakerTag}>
            {part}
          </Text>
        );
      }
      if (part === "[PAUSE]") {
        return (
          <Text key={i} style={styles.directionTag}>
            {" "}[pause]{" "}
          </Text>
        );
      }
      if (part === "[EMPHASIS]") {
        return (
          <Text key={i} style={styles.directionTag}>
            [emphasis]
          </Text>
        );
      }
      return <Text key={i}>{part}</Text>;
    });
  };

  if (showDrafts) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.draftsHeader}>
          <Pressable onPress={() => setShowDrafts(false)} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={c.tint} />
          </Pressable>
          <Text style={styles.sectionTitle}>Saved Scripts</Text>
          <Text style={styles.countBadge}>{drafts.length}</Text>
        </View>

        {drafts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="microphone-off" size={40} color={c.textMuted} />
            <Text style={styles.emptyText}>No saved scripts yet</Text>
            <Text style={styles.emptySubtext}>
              Generate a script and save it to see it here
            </Text>
          </View>
        ) : (
          drafts.slice().reverse().map((draft: SavedScript) => (
            <Pressable
              key={draft.id}
              style={({ pressed }) => [styles.draftCard, pressed && { opacity: 0.8 }]}
              onPress={() => handleLoadDraft(draft)}
            >
              <View style={styles.draftCardTop}>
                <View style={styles.formatBadge}>
                  <Text style={styles.formatBadgeText}>{draft.format}</Text>
                </View>
                <Pressable
                  onPress={() => deleteMutation.mutate(draft.id)}
                  hitSlop={8}
                >
                  <Feather name="trash-2" size={16} color={c.error} />
                </Pressable>
              </View>
              <Text style={styles.draftTitle} numberOfLines={1}>
                {draft.episodeTitle}
              </Text>
              <Text style={styles.draftMeta}>
                {draft.targetLength} min - {new Date(draft.createdAt).toLocaleDateString()}
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
          <MaterialCommunityIcons name="microphone" size={14} color={c.tint} />
          <Text style={styles.typeChipText}>Podcast Generator</Text>
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

      <Text style={styles.label}>Episode Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Give your episode a title"
        placeholderTextColor={c.textMuted}
        value={episodeTitle}
        onChangeText={setEpisodeTitle}
      />

      <Text style={styles.label}>Topic</Text>
      <TextInput
        style={[styles.input, { minHeight: 80 }]}
        placeholder="What should this episode be about?"
        placeholderTextColor={c.textMuted}
        value={topic}
        onChangeText={setTopic}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.label}>Format</Text>
      <View style={styles.formatRow}>
        {FORMATS.map((f) => (
          <Pressable
            key={f.value}
            style={[
              styles.formatChip,
              format === f.value && styles.formatChipActive,
            ]}
            onPress={() => setFormat(f.value)}
          >
            <MaterialCommunityIcons
              name={f.icon}
              size={16}
              color={format === f.value ? c.background : c.textSecondary}
            />
            <Text
              style={[
                styles.formatChipText,
                format === f.value && styles.formatChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Target Length (minutes)</Text>
      <View style={styles.lengthRow}>
        {LENGTHS.map((l) => (
          <Pressable
            key={l}
            style={[
              styles.lengthChip,
              targetLength === l && styles.lengthChipActive,
            ]}
            onPress={() => setTargetLength(l)}
          >
            <Text
              style={[
                styles.lengthChipText,
                targetLength === l && styles.lengthChipTextActive,
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
          (!topic.trim() || !episodeTitle.trim() || generateMutation.isPending) && {
            opacity: 0.5,
          },
        ]}
        onPress={() => generateMutation.mutate()}
        disabled={!topic.trim() || !episodeTitle.trim() || generateMutation.isPending}
        testID="generate-podcast"
      >
        {generateMutation.isPending ? (
          <ActivityIndicator size="small" color={c.background} />
        ) : (
          <MaterialCommunityIcons name="auto-fix" size={18} color={c.background} />
        )}
        <Text style={styles.generateButtonText}>
          {generateMutation.isPending ? "Generating Script..." : "Generate Script"}
        </Text>
      </Pressable>

      {generateMutation.isPending && (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={c.tint} />
          <Text style={styles.loadingText}>
            Writing your {format} podcast script...
          </Text>
          <Text style={styles.loadingSubtext}>
            This may take 30-60 seconds
          </Text>
        </View>
      )}

      {result && !generateMutation.isPending && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>{episodeTitle}</Text>
            <View style={styles.resultActions}>
              <Pressable
                style={styles.resultAction}
                onPress={handleCopyAll}
              >
                <Feather name="copy" size={16} color={c.tint} />
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

          <View style={styles.scriptSection}>
            <View style={styles.scriptSectionHeader}>
              <Text style={styles.scriptSectionTitle}>Cold Open</Text>
              <Pressable
                onPress={() => handleCopySection(result.cold_open, "Cold Open")}
                hitSlop={8}
              >
                <Feather name="copy" size={14} color={c.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.scriptContent}>
              {renderSpeakerContent(result.cold_open)}
            </Text>
          </View>

          <View style={styles.scriptSection}>
            <View style={styles.scriptSectionHeader}>
              <Text style={styles.scriptSectionTitle}>Setup</Text>
              <Pressable
                onPress={() => handleCopySection(result.setup, "Setup")}
                hitSlop={8}
              >
                <Feather name="copy" size={14} color={c.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.scriptContent}>
              {renderSpeakerContent(result.setup)}
            </Text>
          </View>

          {result.segments.map((segment, index) => (
            <View key={index} style={styles.scriptSection}>
              <Pressable
                style={styles.scriptSectionHeader}
                onPress={() =>
                  setExpandedSegment(expandedSegment === index ? null : index)
                }
              >
                <View style={styles.segmentTitleRow}>
                  <Feather
                    name={expandedSegment === index ? "chevron-down" : "chevron-right"}
                    size={16}
                    color={c.tint}
                  />
                  <Text style={styles.scriptSectionTitle}>
                    Segment {index + 1}: {segment.title}
                  </Text>
                </View>
                <View style={styles.segmentMeta}>
                  <Text style={styles.segmentDuration}>
                    ~{segment.duration_minutes} min
                  </Text>
                  <Pressable
                    onPress={() =>
                      handleCopySection(segment.content, `Segment ${index + 1}`)
                    }
                    hitSlop={8}
                  >
                    <Feather name="copy" size={14} color={c.textMuted} />
                  </Pressable>
                </View>
              </Pressable>
              <Text style={styles.segmentHook}>{segment.hook}</Text>
              {expandedSegment === index && (
                <Text style={styles.scriptContent}>
                  {renderSpeakerContent(segment.content)}
                </Text>
              )}
            </View>
          ))}

          <View style={styles.scriptSection}>
            <View style={styles.scriptSectionHeader}>
              <Text style={styles.scriptSectionTitle}>Key Takeaways</Text>
              <Pressable
                onPress={() => handleCopySection(result.takeaways, "Takeaways")}
                hitSlop={8}
              >
                <Feather name="copy" size={14} color={c.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.scriptContent}>
              {renderSpeakerContent(result.takeaways)}
            </Text>
          </View>

          <View style={styles.scriptSection}>
            <View style={styles.scriptSectionHeader}>
              <Text style={styles.scriptSectionTitle}>Outro</Text>
              <Pressable
                onPress={() => handleCopySection(result.outro, "Outro")}
                hitSlop={8}
              >
                <Feather name="copy" size={14} color={c.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.scriptContent}>
              {renderSpeakerContent(result.outro)}
            </Text>
          </View>

          <View style={styles.audioPlaceholder}>
            <MaterialCommunityIcons name="headphones" size={24} color={c.textMuted} />
            <Text style={styles.audioPlaceholderTitle}>Audio Generation</Text>
            <Text style={styles.audioPlaceholderText}>
              Coming soon - Generate audio with ElevenLabs
            </Text>
          </View>
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
  formatRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  formatChip: {
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
  formatChipActive: { backgroundColor: c.tint, borderColor: c.tint },
  formatChipText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.textSecondary,
  },
  formatChipTextActive: { color: c.background },
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
    marginBottom: spacing.sm,
  },
  resultTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
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
  scriptSection: {
    backgroundColor: c.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: c.border,
  },
  scriptSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  scriptSectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: c.tint,
  },
  segmentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  segmentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  segmentDuration: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: c.textMuted,
    backgroundColor: c.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  segmentHook: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.textSecondary,
    fontStyle: "italic",
    marginBottom: spacing.sm,
  },
  scriptContent: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.text,
    lineHeight: 22,
  },
  speakerTag: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: c.tint,
    backgroundColor: c.tint + "15",
    paddingHorizontal: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
  directionTag: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: c.textMuted,
    fontStyle: "italic",
  },
  audioPlaceholder: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: c.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    borderStyle: "dashed",
    gap: spacing.xs,
  },
  audioPlaceholderTitle: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: c.textMuted,
  },
  audioPlaceholderText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: c.textMuted,
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
  formatBadge: {
    backgroundColor: c.tint + "20",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  formatBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: c.tint,
    textTransform: "capitalize",
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
