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
import { fonts, spacing, radius } from "@/constants/theme";
import { createStoryboard } from "@/lib/api";

const c = Colors.light;

interface Scene {
  id: string;
  title: string;
  description: string;
  shotType: string;
  duration: string;
}

const SHOT_TYPES = ["Wide", "Medium", "Close-up", "POV", "B-Roll", "Text Overlay"];

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export default function CreateStoryboardScreen() {
  const { type = "storyboard" } = useLocalSearchParams<{ type: string }>();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [scenes, setScenes] = useState<Scene[]>([]);

  const [hook, setHook] = useState("");
  const [headline, setHeadline] = useState("");
  const [adBody, setAdBody] = useState("");
  const [cta, setCta] = useState("");
  const [audience, setAudience] = useState("");

  const isAd = type === "ad-creative";

  const saveMutation = useMutation({
    mutationFn: () => {
      const scenesData = isAd
        ? JSON.stringify([{ hook, headline, body: adBody, cta, audience }])
        : JSON.stringify(scenes);
      return createStoryboard({ title, type, scenes: scenesData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storyboards"] });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    },
  });

  const addScene = () => {
    setScenes((prev) => [
      ...prev,
      {
        id: generateId(),
        title: `Scene ${prev.length + 1}`,
        description: "",
        shotType: "Medium",
        duration: "3s",
      },
    ]);
  };

  const updateScene = (id: string, field: keyof Scene, value: string) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const removeScene = (id: string) => {
    setScenes((prev) => prev.filter((s) => s.id !== id));
  };

  const moveSceneUp = (index: number) => {
    if (index === 0) return;
    setScenes((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveSceneDown = (index: number) => {
    if (index >= scenes.length - 1) return;
    setScenes((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const canSave = isAd
    ? title.trim() && hook.trim()
    : title.trim() && scenes.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.typeChip}>
        <MaterialCommunityIcons
          name={isAd ? "bullhorn" : "filmstrip"}
          size={14}
          color={c.tint}
        />
        <Text style={styles.typeChipText}>
          {isAd ? "Ad Creative" : "Storyboard"}
        </Text>
      </View>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder={isAd ? "Campaign name" : "Storyboard title"}
        placeholderTextColor={c.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      {isAd ? (
        <>
          <Text style={styles.label}>Hook</Text>
          <TextInput
            style={styles.input}
            placeholder="Opening hook that grabs attention"
            placeholderTextColor={c.textMuted}
            value={hook}
            onChangeText={setHook}
          />
          <Text style={styles.label}>Headline</Text>
          <TextInput
            style={styles.input}
            placeholder="Main headline"
            placeholderTextColor={c.textMuted}
            value={headline}
            onChangeText={setHeadline}
          />
          <Text style={styles.label}>Body</Text>
          <TextInput
            style={[styles.input, styles.multiInput]}
            placeholder="Ad body copy"
            placeholderTextColor={c.textMuted}
            value={adBody}
            onChangeText={setAdBody}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.label}>CTA</Text>
          <TextInput
            style={styles.input}
            placeholder="Call to action"
            placeholderTextColor={c.textMuted}
            value={cta}
            onChangeText={setCta}
          />
          <Text style={styles.label}>Target Audience</Text>
          <TextInput
            style={styles.input}
            placeholder="Who is this ad for?"
            placeholderTextColor={c.textMuted}
            value={audience}
            onChangeText={setAudience}
          />
        </>
      ) : (
        <>
          <View style={styles.scenesHeader}>
            <Text style={styles.scenesTitle}>
              Scenes ({scenes.length})
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.addSceneBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={addScene}
            >
              <Feather name="plus" size={16} color={c.tint} />
              <Text style={styles.addSceneBtnText}>Add Scene</Text>
            </Pressable>
          </View>

          {scenes.length === 0 && (
            <View style={styles.emptyScenes}>
              <MaterialCommunityIcons
                name="filmstrip"
                size={36}
                color={c.textMuted}
              />
              <Text style={styles.emptyScenesText}>
                Add scenes to build your storyboard
              </Text>
            </View>
          )}

          {scenes.map((scene, index) => (
            <View key={scene.id} style={styles.sceneCard}>
              <View style={styles.sceneHeader}>
                <View style={styles.sceneNumber}>
                  <Text style={styles.sceneNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.sceneActions}>
                  <Pressable
                    onPress={() => moveSceneUp(index)}
                    style={[
                      styles.reorderBtn,
                      index === 0 && { opacity: 0.3 },
                    ]}
                    disabled={index === 0}
                  >
                    <Feather name="chevron-up" size={18} color={c.textSecondary} />
                  </Pressable>
                  <Pressable
                    onPress={() => moveSceneDown(index)}
                    style={[
                      styles.reorderBtn,
                      index >= scenes.length - 1 && { opacity: 0.3 },
                    ]}
                    disabled={index >= scenes.length - 1}
                  >
                    <Feather name="chevron-down" size={18} color={c.textSecondary} />
                  </Pressable>
                  <Pressable onPress={() => removeScene(scene.id)}>
                    <Feather name="x" size={18} color={c.textMuted} />
                  </Pressable>
                </View>
              </View>
              <TextInput
                style={styles.sceneInput}
                placeholder="Scene title"
                placeholderTextColor={c.textMuted}
                value={scene.title}
                onChangeText={(v) => updateScene(scene.id, "title", v)}
              />
              <TextInput
                style={[styles.sceneInput, { minHeight: 60 }]}
                placeholder="Describe what happens"
                placeholderTextColor={c.textMuted}
                value={scene.description}
                onChangeText={(v) =>
                  updateScene(scene.id, "description", v)
                }
                multiline
                textAlignVertical="top"
              />
              <View style={styles.sceneMetaRow}>
                <View style={styles.shotTypeWrap}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
                    {SHOT_TYPES.map((st) => (
                      <Pressable
                        key={st}
                        style={[
                          styles.shotChip,
                          scene.shotType === st && styles.shotChipActive,
                        ]}
                        onPress={() =>
                          updateScene(scene.id, "shotType", st)
                        }
                      >
                        <Text
                          style={[
                            styles.shotChipText,
                            scene.shotType === st &&
                              styles.shotChipTextActive,
                          ]}
                        >
                          {st}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
                <TextInput
                  style={styles.durationInput}
                  placeholder="3s"
                  placeholderTextColor={c.textMuted}
                  value={scene.duration}
                  onChangeText={(v) =>
                    updateScene(scene.id, "duration", v)
                  }
                />
              </View>
            </View>
          ))}
        </>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          pressed && { opacity: 0.8 },
          (!canSave || saveMutation.isPending) && { opacity: 0.5 },
        ]}
        onPress={() => saveMutation.mutate()}
        disabled={!canSave || saveMutation.isPending}
        testID="save-storyboard"
      >
        {saveMutation.isPending ? (
          <ActivityIndicator size="small" color={c.background} />
        ) : (
          <Feather name="check" size={18} color={c.background} />
        )}
        <Text style={styles.saveButtonText}>
          {saveMutation.isPending ? "Saving..." : "Save"}
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
  multiInput: { minHeight: 100, paddingTop: spacing.md },
  scenesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  scenesTitle: { fontFamily: fonts.semibold, fontSize: 16, color: c.text },
  addSceneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.tint,
  },
  addSceneBtnText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.tint,
  },
  emptyScenes: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyScenesText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: c.textMuted,
  },
  sceneCard: {
    backgroundColor: c.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: c.border,
  },
  sceneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sceneActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  reorderBtn: {
    padding: 2,
  },
  sceneNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: c.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  sceneNumberText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: c.background,
  },
  sceneInput: {
    backgroundColor: c.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.text,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
  },
  sceneMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  shotTypeWrap: { flex: 1 },
  shotChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: c.border,
    marginRight: 4,
  },
  shotChipActive: { backgroundColor: c.tint + "20", borderColor: c.tint },
  shotChipText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: c.textMuted,
  },
  shotChipTextActive: { color: c.tint },
  durationInput: {
    width: 50,
    backgroundColor: c.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.tint,
    textAlign: "center",
    borderWidth: 1,
    borderColor: c.border,
  },
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
