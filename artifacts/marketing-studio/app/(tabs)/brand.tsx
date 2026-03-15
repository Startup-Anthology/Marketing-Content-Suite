import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { fonts, spacing, radius } from "@/constants/theme";
import { fetchBrandGuide, saveBrandGuide } from "@/lib/api";

const c = Colors.light;

interface ColorEntry {
  name: string;
  hex: string;
}

interface FontEntry {
  role: string;
  name: string;
}

const DEFAULT_COLORS: ColorEntry[] = [
  { name: "Primary", hex: "#BB935B" },
  { name: "Background", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#64748B" },
];

const DEFAULT_FONTS: FontEntry[] = [
  { role: "Heading", name: "" },
  { role: "Body", name: "" },
];

export default function BrandTab() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === "web" ? 67 : 0;
  const queryClient = useQueryClient();

  const [brandName, setBrandName] = useState("");
  const [voiceDescriptors, setVoiceDescriptors] = useState("");
  const [tone, setTone] = useState("");
  const [tagline, setTagline] = useState("");
  const [brandStory, setBrandStory] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [colors, setColors] = useState<ColorEntry[]>(DEFAULT_COLORS);
  const [fontEntries, setFontEntries] = useState<FontEntry[]>(DEFAULT_FONTS);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: guide, isLoading } = useQuery({
    queryKey: ["brand-guide"],
    queryFn: fetchBrandGuide,
  });

  useEffect(() => {
    if (guide) {
      setBrandName(guide.brandName || "");
      setVoiceDescriptors(guide.voiceDescriptors || "");
      setTone(guide.tone || "");
      setTagline(guide.tagline || "");
      setBrandStory(guide.brandStory || "");
      setLogoUrl(guide.logoUrl || "");
      try {
        const parsed = JSON.parse(guide.colorPalette);
        if (Array.isArray(parsed) && parsed.length > 0) setColors(parsed);
      } catch {}
      try {
        const parsed = JSON.parse(guide.fonts);
        if (Array.isArray(parsed) && parsed.length > 0) setFontEntries(parsed);
      } catch {}
    }
  }, [guide]);

  const saveMutation = useMutation({
    mutationFn: () =>
      saveBrandGuide({
        brandName,
        voiceDescriptors,
        tone,
        colorPalette: JSON.stringify(colors),
        fonts: JSON.stringify(fontEntries),
        logoUrl,
        tagline,
        brandStory,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-guide"] });
      setHasChanges(false);
      Alert.alert("Saved", "Brand guide updated successfully.");
    },
    onError: () => {
      Alert.alert("Error", "Failed to save brand guide.");
    },
  });

  const markChanged = () => setHasChanges(true);

  const updateColor = (index: number, field: "name" | "hex", value: string) => {
    const updated = [...colors];
    updated[index] = { ...updated[index], [field]: value };
    setColors(updated);
    markChanged();
  };

  const addColor = () => {
    setColors([...colors, { name: "", hex: "#000000" }]);
    markChanged();
  };

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
    markChanged();
  };

  const updateFont = (index: number, field: "role" | "name", value: string) => {
    const updated = [...fontEntries];
    updated[index] = { ...updated[index], [field]: value };
    setFontEntries(updated);
    markChanged();
  };

  const addFont = () => {
    setFontEntries([...fontEntries, { role: "", name: "" }]);
    markChanged();
  };

  const removeFont = (index: number) => {
    setFontEntries(fontEntries.filter((_, i) => i !== index));
    markChanged();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top + webTop }]}>
        <ActivityIndicator size="large" color={c.tint} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + webTop }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Brand Guide</Text>
        <Text style={styles.headerSubtitle}>
          Define your brand identity. This information is automatically injected into every AI generation to keep content on-brand.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Brand Identity</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Brand Name</Text>
          <Text style={styles.hint}>Used in all AI-generated content as your brand reference</Text>
          <TextInput
            style={styles.input}
            value={brandName}
            onChangeText={(v) => { setBrandName(v); markChanged(); }}
            placeholder="e.g. Startup Anthology"
            placeholderTextColor={c.textMuted}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tagline</Text>
          <Text style={styles.hint}>A short phrase that captures your brand essence</Text>
          <TextInput
            style={styles.input}
            value={tagline}
            onChangeText={(v) => { setTagline(v); markChanged(); }}
            placeholder="e.g. Build. Ship. Grow. Repeat."
            placeholderTextColor={c.textMuted}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Logo</Text>
          <Text style={styles.hint}>Upload your brand logo image or paste a URL</Text>
          {logoUrl ? (
            <View style={styles.logoPreviewWrap}>
              <Image source={{ uri: logoUrl }} style={styles.logoPreview} resizeMode="contain" />
              <Pressable
                style={styles.logoRemoveBtn}
                onPress={() => { setLogoUrl(""); markChanged(); }}
              >
                <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: c.error }}>Remove Logo</Text>
              </Pressable>
            </View>
          ) : null}
          <View style={styles.logoActions}>
            <Pressable style={styles.logoUploadBtn} onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
                base64: true,
              });
              if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                if (asset.base64) {
                  const mimeType = asset.mimeType || "image/jpeg";
                  setLogoUrl(`data:${mimeType};base64,${asset.base64}`);
                } else if (asset.uri) {
                  setLogoUrl(asset.uri);
                }
                markChanged();
              }
            }}>
              <Feather name="upload" size={16} color={c.tint} />
              <Text style={styles.logoUploadText}>Upload Image</Text>
            </Pressable>
          </View>
          <TextInput
            style={[styles.input, { marginTop: spacing.sm }]}
            value={logoUrl.startsWith("data:") ? "" : logoUrl}
            onChangeText={(v) => { setLogoUrl(v); markChanged(); }}
            placeholder="Or paste a URL: https://example.com/logo.png"
            placeholderTextColor={c.textMuted}
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Voice & Tone</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Voice Descriptors</Text>
          <Text style={styles.hint}>Adjectives that describe how your brand speaks (e.g. professional, friendly, witty). AI uses these to match your style.</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={voiceDescriptors}
            onChangeText={(v) => { setVoiceDescriptors(v); markChanged(); }}
            placeholder="e.g. Professional, approachable, authoritative but not stuffy"
            placeholderTextColor={c.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tone</Text>
          <Text style={styles.hint}>The emotional quality of your content. AI adjusts formality and energy based on this.</Text>
          <TextInput
            style={styles.input}
            value={tone}
            onChangeText={(v) => { setTone(v); markChanged(); }}
            placeholder="e.g. Confident, encouraging, data-driven"
            placeholderTextColor={c.textMuted}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Brand Story</Text>
          <Text style={styles.hint}>Your origin story, mission, or value proposition. AI weaves this into longer content.</Text>
          <TextInput
            style={[styles.input, styles.textAreaLarge]}
            value={brandStory}
            onChangeText={(v) => { setBrandStory(v); markChanged(); }}
            placeholder="Tell your brand's story, mission, and what makes you unique..."
            placeholderTextColor={c.textMuted}
            multiline
            numberOfLines={5}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Color Palette</Text>
        <Text style={styles.sectionHint}>Referenced in visual content suggestions and design-related AI output</Text>

        {colors.map((color, index) => (
          <View key={index} style={styles.colorRow}>
            <View style={[styles.colorPreview, { backgroundColor: color.hex, borderWidth: color.hex.toUpperCase() === "#FFFFFF" ? 1 : 0, borderColor: c.border }]} />
            <TextInput
              style={[styles.input, styles.colorNameInput]}
              value={color.name}
              onChangeText={(v) => updateColor(index, "name", v)}
              placeholder="Color name"
              placeholderTextColor={c.textMuted}
            />
            <TextInput
              style={[styles.input, styles.colorHexInput]}
              value={color.hex}
              onChangeText={(v) => updateColor(index, "hex", v)}
              placeholder="#000000"
              placeholderTextColor={c.textMuted}
              autoCapitalize="characters"
            />
            <Pressable onPress={() => removeColor(index)} style={styles.removeBtn}>
              <Feather name="x" size={16} color={c.error} />
            </Pressable>
          </View>
        ))}

        <Pressable onPress={addColor} style={styles.addBtn}>
          <Feather name="plus" size={16} color={c.tint} />
          <Text style={styles.addBtnText}>Add Color</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Typography</Text>
        <Text style={styles.sectionHint}>Font names are included in design recommendations from AI</Text>

        {fontEntries.map((font, index) => (
          <View key={index} style={styles.fontRow}>
            <TextInput
              style={[styles.input, styles.fontRoleInput]}
              value={font.role}
              onChangeText={(v) => updateFont(index, "role", v)}
              placeholder="Role (e.g. Heading)"
              placeholderTextColor={c.textMuted}
            />
            <TextInput
              style={[styles.input, styles.fontNameInput]}
              value={font.name}
              onChangeText={(v) => updateFont(index, "name", v)}
              placeholder="Font name"
              placeholderTextColor={c.textMuted}
            />
            <Pressable onPress={() => removeFont(index)} style={styles.removeBtn}>
              <Feather name="x" size={16} color={c.error} />
            </Pressable>
          </View>
        ))}

        <Pressable onPress={addFont} style={styles.addBtn}>
          <Feather name="plus" size={16} color={c.tint} />
          <Text style={styles.addBtnText}>Add Font</Text>
        </Pressable>
      </View>

      {(brandName || tagline || voiceDescriptors) ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brand Preview</Text>
          <View style={styles.previewCard}>
            {brandName ? <Text style={styles.previewName}>{brandName}</Text> : null}
            {tagline ? <Text style={styles.previewTagline}>{tagline}</Text> : null}
            {voiceDescriptors ? (
              <View style={styles.previewRow}>
                <MaterialCommunityIcons name="account-voice" size={14} color={c.tint} />
                <Text style={styles.previewText}>{voiceDescriptors}</Text>
              </View>
            ) : null}
            {tone ? (
              <View style={styles.previewRow}>
                <MaterialCommunityIcons name="tune-variant" size={14} color={c.tint} />
                <Text style={styles.previewText}>{tone}</Text>
              </View>
            ) : null}
            {colors.length > 0 ? (
              <View style={styles.previewColors}>
                {colors.map((col, i) => (
                  <View
                    key={i}
                    style={[styles.previewSwatch, { backgroundColor: col.hex, borderWidth: col.hex.toUpperCase() === "#FFFFFF" ? 1 : 0, borderColor: c.border }]}
                  />
                ))}
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      <Pressable
        style={[styles.saveBtn, (!hasChanges || saveMutation.isPending) && styles.saveBtnDisabled]}
        onPress={() => saveMutation.mutate()}
        disabled={!hasChanges || saveMutation.isPending}
      >
        {saveMutation.isPending ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <>
            <Feather name="save" size={18} color="#FFF" />
            <Text style={styles.saveBtnText}>Save Brand Guide</Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  center: { alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingBottom: 120 },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  headerTitle: { fontFamily: fonts.bold, fontSize: 28, color: c.text },
  headerSubtitle: { fontFamily: fonts.regular, fontSize: 13, color: c.textSecondary, marginTop: 4, lineHeight: 18 },
  section: { marginHorizontal: spacing.xl, marginBottom: spacing.xxl },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 16, color: c.text, marginBottom: spacing.sm },
  sectionHint: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted, marginBottom: spacing.md },
  fieldGroup: { marginBottom: spacing.lg },
  label: { fontFamily: fonts.medium, fontSize: 14, color: c.text, marginBottom: 2 },
  hint: { fontFamily: fonts.regular, fontSize: 11, color: c.textMuted, marginBottom: spacing.sm, lineHeight: 15 },
  input: {
    backgroundColor: c.inputBg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.text,
    borderWidth: 1,
    borderColor: c.border,
  },
  textArea: { minHeight: 72, textAlignVertical: "top" },
  textAreaLarge: { minHeight: 120, textAlignVertical: "top" },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
  },
  colorNameInput: { flex: 1 },
  colorHexInput: { width: 100 },
  fontRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  fontRoleInput: { flex: 1 },
  fontNameInput: { flex: 1 },
  removeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  addBtnText: { fontFamily: fonts.medium, fontSize: 13, color: c.tint },
  logoPreviewWrap: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  logoPreview: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  logoRemoveBtn: {
    marginTop: spacing.sm,
  },
  logoActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  logoUploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: c.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.tint + "40",
  },
  logoUploadText: { fontFamily: fonts.medium, fontSize: 13, color: c.tint },
  previewCard: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: c.tint + "30",
    gap: spacing.md,
  },
  previewName: { fontFamily: fonts.bold, fontSize: 20, color: c.text },
  previewTagline: { fontFamily: fonts.regular, fontSize: 14, color: c.tint },
  previewRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  previewText: { fontFamily: fonts.regular, fontSize: 13, color: c.textSecondary, flex: 1 },
  previewColors: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  previewSwatch: { width: 28, height: 28, borderRadius: radius.sm },
  saveBtn: {
    marginHorizontal: spacing.xl,
    backgroundColor: c.tint,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontFamily: fonts.semibold, fontSize: 15, color: "#FFF" },
});
