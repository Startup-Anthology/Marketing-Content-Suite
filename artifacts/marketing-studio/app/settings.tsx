import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import type { ComponentProps } from "react";
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

import Colors from "@/constants/colors";
import { fonts, spacing, radius } from "@/constants/theme";
import { fetchBrandGuide, saveBrandGuide } from "@/lib/api";

const c = Colors.light;

type MCIName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type SectionKey = "about" | "brand" | "help";

const BRAND_COLORS_DEFAULT = [
  { name: "SA Gold", hex: "#BB935B" },
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#64748B" },
];

const SUPPORTED_PLATFORMS: { name: string; icon: MCIName }[] = [
  { name: "LinkedIn", icon: "linkedin" },
  { name: "X / Twitter", icon: "twitter" },
  { name: "Instagram", icon: "instagram" },
  { name: "Email", icon: "email-outline" },
  { name: "TikTok", icon: "music-note" },
  { name: "YouTube", icon: "youtube" },
];

interface ColorEntry { name: string; hex: string; }
interface FontEntry { role: string; name: string; }

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

interface FaqEntry { q: string; a: string; category: string; }

const FAQ_DATA: FaqEntry[] = [
  { category: "Content Creation", q: "How do I create a new content piece?", a: "Head to the Create tab, pick your content type and platform, enter your topic, and tap Generate. The AI drafts polished copy for you in seconds." },
  { category: "Content Creation", q: "Can I customize the tone of generated content?", a: "Absolutely. Choose a tone when creating content, or set up your Brand Guide so the AI matches your voice every time." },
  { category: "Content Creation", q: "What content types are supported?", a: "Social posts, newsletters, captions, blog posts, ad copy, video scripts, and podcast episodes. Each format is optimized for its platform." },
  { category: "Studio", q: "What is the Studio tab for?", a: "Studio is where you build storyboards and ad creatives. Plan visual content with scenes, hooks, headlines, and calls-to-action." },
  { category: "Research", q: "How does SEO & AEO research work?", a: "Enter a topic in the Research tab. The AI returns relevant keywords, People Also Ask questions, talking points, and an answer-engine-optimized summary." },
  { category: "Research", q: "What is AEO?", a: "Answer Engine Optimization helps your content surface in AI-powered search results from tools like Perplexity and ChatGPT. Think of it as SEO for the AI era." },
  { category: "Scheduling", q: "How do I schedule a post?", a: "Open the Schedule tab, tap +, pick a platform, write your content, set a date and time, and save. Posts are organized by their scheduled date." },
  { category: "Brand Guide", q: "What is the Brand Guide?", a: "Your brand identity hub. Define your name, voice, tone, colors, fonts, and story. This context is automatically included in every AI generation so your content stays on-brand." },
  { category: "Brand Guide", q: "How does the Brand Guide affect AI output?", a: "Every time you generate content, the AI reads your brand guide. It uses your name, matches your voice descriptors, and respects your tone across all outputs." },
  { category: "General", q: "Is my data saved between sessions?", a: "Yes. All content, storyboards, research, scheduled posts, and your brand guide persist in the database across sessions." },
  { category: "General", q: "What AI powers the content generation?", a: "The app uses Claude by Anthropic to generate high-quality, on-brand marketing content tailored to your specifications." },
];

const FEATURE_SECTIONS = [
  { icon: "edit-3" as const, title: "Create", description: "Generate AI-powered marketing content tailored to your brand voice and target platform." },
  { icon: "film" as const, title: "Studio", description: "Build storyboards and ad creatives with structured scenes, hooks, and calls-to-action." },
  { icon: "search" as const, title: "Research", description: "Run SEO and AEO research. Get keywords, trending questions, and answer-engine-optimized summaries." },
  { icon: "calendar" as const, title: "Schedule", description: "Plan and schedule posts across all major platforms with a date-based content calendar." },
];

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<SectionKey>("about");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [helpSearch, setHelpSearch] = useState("");

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
      Alert.alert("Saved", "Brand guide updated.");
    },
    onError: () => {
      Alert.alert("Error", "Could not save brand guide. Please try again.");
    },
  });

  const markChanged = () => setHasChanges(true);

  const updateColor = (index: number, field: "name" | "hex", value: string) => {
    const updated = [...colors];
    updated[index] = { ...updated[index], [field]: value };
    setColors(updated);
    markChanged();
  };
  const addColor = () => { setColors([...colors, { name: "", hex: "#000000" }]); markChanged(); };
  const removeColor = (index: number) => { setColors(colors.filter((_, i) => i !== index)); markChanged(); };

  const updateFont = (index: number, field: "role" | "name", value: string) => {
    const updated = [...fontEntries];
    updated[index] = { ...updated[index], [field]: value };
    setFontEntries(updated);
    markChanged();
  };
  const addFont = () => { setFontEntries([...fontEntries, { role: "", name: "" }]); markChanged(); };
  const removeFont = (index: number) => { setFontEntries(fontEntries.filter((_, i) => i !== index)); markChanged(); };

  const normalizedSearch = helpSearch.toLowerCase().trim();
  const filteredFaq = normalizedSearch
    ? FAQ_DATA.filter((f) => f.q.toLowerCase().includes(normalizedSearch) || f.a.toLowerCase().includes(normalizedSearch) || f.category.toLowerCase().includes(normalizedSearch))
    : FAQ_DATA;
  const filteredFeatures = normalizedSearch
    ? FEATURE_SECTIONS.filter((f) => f.title.toLowerCase().includes(normalizedSearch) || f.description.toLowerCase().includes(normalizedSearch))
    : FEATURE_SECTIONS;
  const faqCategories = [...new Set(filteredFaq.map((f) => f.category))];

  const renderAboutSection = () => (
    <>
      <View style={styles.brandCard}>
        <View style={styles.brandIconWrap}>
          <MaterialCommunityIcons name="book-open-variant" size={28} color={c.tint} />
        </View>
        <Text style={styles.brandName}>Startup Anthology</Text>
        <Text style={styles.brandTagline}>Build. Ship. Grow. Repeat.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Brand Palette</Text>
        <View style={styles.paletteRow}>
          {BRAND_COLORS_DEFAULT.map((color) => (
            <View key={color.name} style={styles.paletteItem}>
              <View style={[styles.paletteSwatch, { backgroundColor: color.hex, borderWidth: (color.hex === "#FFFFFF" || color.hex === "#000000") ? 1 : 0, borderColor: c.border }]} />
              <Text style={styles.paletteName}>{color.name}</Text>
              <Text style={styles.paletteHex}>{color.hex}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoRow}>
          <Feather name="info" size={16} color={c.textSecondary} />
          <Text style={styles.infoText}>Marketing Content Studio v1.0</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="palette-outline" size={16} color={c.textSecondary} />
          <Text style={styles.infoText}>Startup Anthology Brand System</Text>
        </View>
        <View style={styles.infoRow}>
          <Feather name="zap" size={16} color={c.textSecondary} />
          <Text style={styles.infoText}>Powered by Claude AI</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Supported Platforms</Text>
        <View style={styles.platformGrid}>
          {SUPPORTED_PLATFORMS.map((p) => (
            <View key={p.name} style={styles.platformItem}>
              <MaterialCommunityIcons name={p.icon} size={20} color={c.tint} />
              <Text style={styles.platformName}>{p.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );

  const renderBrandSection = () => {
    if (isLoading) {
      return (
        <View style={[styles.section, { alignItems: "center", paddingVertical: 40 }]}>
          <ActivityIndicator size="large" color={c.tint} />
        </View>
      );
    }
    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brand Identity</Text>
          <Text style={styles.sectionHint}>This information shapes every AI-generated piece of content.</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Brand Name</Text>
            <TextInput style={styles.input} value={brandName} onChangeText={(v) => { setBrandName(v); markChanged(); }} placeholder="e.g. Startup Anthology" placeholderTextColor={c.textMuted} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tagline</Text>
            <TextInput style={styles.input} value={tagline} onChangeText={(v) => { setTagline(v); markChanged(); }} placeholder="e.g. Build. Ship. Grow. Repeat." placeholderTextColor={c.textMuted} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Logo</Text>
            {logoUrl ? (
              <View style={styles.logoPreviewWrap}>
                <Image source={{ uri: logoUrl }} style={styles.logoPreview} resizeMode="contain" />
                <Pressable style={styles.logoRemoveBtn} onPress={() => { setLogoUrl(""); markChanged(); }}>
                  <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: c.error }}>Remove Logo</Text>
                </Pressable>
              </View>
            ) : null}
            <View style={styles.logoActions}>
              <Pressable style={styles.logoUploadBtn} onPress={async () => {
                const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8, base64: true });
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
            <Text style={styles.hint}>Adjectives that describe how your brand speaks. The AI uses these to match your style.</Text>
            <TextInput style={[styles.input, styles.textArea]} value={voiceDescriptors} onChangeText={(v) => { setVoiceDescriptors(v); markChanged(); }} placeholder="e.g. Professional, approachable, authoritative but not stuffy" placeholderTextColor={c.textMuted} multiline numberOfLines={3} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tone</Text>
            <Text style={styles.hint}>The emotional quality of your content. Controls formality and energy.</Text>
            <TextInput style={styles.input} value={tone} onChangeText={(v) => { setTone(v); markChanged(); }} placeholder="e.g. Confident, encouraging, data-driven" placeholderTextColor={c.textMuted} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Brand Story</Text>
            <Text style={styles.hint}>Your origin, mission, and what makes you different. The AI weaves this into longer content.</Text>
            <TextInput style={[styles.input, styles.textAreaLarge]} value={brandStory} onChangeText={(v) => { setBrandStory(v); markChanged(); }} placeholder="Tell your brand's story, mission, and what makes you unique..." placeholderTextColor={c.textMuted} multiline numberOfLines={5} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Color Palette</Text>
          {colors.map((color, index) => (
            <View key={index} style={styles.colorRow}>
              <View style={[styles.colorPreview, { backgroundColor: color.hex, borderWidth: color.hex.toUpperCase() === "#FFFFFF" ? 1 : 0, borderColor: c.border }]} />
              <TextInput style={[styles.input, styles.colorNameInput]} value={color.name} onChangeText={(v) => updateColor(index, "name", v)} placeholder="Color name" placeholderTextColor={c.textMuted} />
              <TextInput style={[styles.input, styles.colorHexInput]} value={color.hex} onChangeText={(v) => updateColor(index, "hex", v)} placeholder="#000000" placeholderTextColor={c.textMuted} autoCapitalize="characters" />
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
          {fontEntries.map((font, index) => (
            <View key={index} style={styles.fontRow}>
              <TextInput style={[styles.input, styles.fontRoleInput]} value={font.role} onChangeText={(v) => updateFont(index, "role", v)} placeholder="Role (e.g. Heading)" placeholderTextColor={c.textMuted} />
              <TextInput style={[styles.input, styles.fontNameInput]} value={font.name} onChangeText={(v) => updateFont(index, "name", v)} placeholder="Font name" placeholderTextColor={c.textMuted} />
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
      </>
    );
  };

  const renderHelpSection = () => (
    <>
      <View style={styles.searchWrap}>
        <Feather name="search" size={16} color={c.textMuted} />
        <TextInput style={styles.searchInput} value={helpSearch} onChangeText={setHelpSearch} placeholder="Search help topics..." placeholderTextColor={c.textMuted} />
        {helpSearch.length > 0 && (
          <Pressable onPress={() => setHelpSearch("")}>
            <Feather name="x" size={16} color={c.textMuted} />
          </Pressable>
        )}
      </View>

      {filteredFeatures.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Features</Text>
          {filteredFeatures.map((feature) => (
            <View key={feature.title} style={styles.featureCard}>
              <View style={styles.featureIconWrap}>
                <Feather name={feature.icon} size={18} color={c.tint} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {filteredFaq.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAQ</Text>
          {faqCategories.map((cat) => (
            <View key={cat} style={styles.faqCategory}>
              <Text style={styles.faqCategoryTitle}>{cat}</Text>
              {filteredFaq.filter((f) => f.category === cat).map((faq, idx) => {
                const globalIdx = FAQ_DATA.indexOf(faq);
                const isExpanded = expandedFaq === globalIdx;
                return (
                  <Pressable key={idx} style={styles.faqItem} onPress={() => setExpandedFaq(isExpanded ? null : globalIdx)}>
                    <View style={styles.faqHeader}>
                      <Text style={styles.faqQuestion}>{faq.q}</Text>
                      <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={c.textMuted} />
                    </View>
                    {isExpanded && <Text style={styles.faqAnswer}>{faq.a}</Text>}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      )}

      {filteredFaq.length === 0 && filteredFeatures.length === 0 && (
        <View style={styles.emptyState}>
          <Feather name="search" size={40} color={c.textMuted} />
          <Text style={styles.emptyText}>No results for "{helpSearch}"</Text>
          <Pressable onPress={() => setHelpSearch("")}>
            <Text style={styles.clearSearch}>Clear search</Text>
          </Pressable>
        </View>
      )}
    </>
  );

  const sections: { key: SectionKey; label: string; icon: string }[] = [
    { key: "about", label: "About", icon: "info" },
    { key: "brand", label: "Brand Guide", icon: "bookmark" },
    { key: "help", label: "Help", icon: "help-circle" },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sectionSwitcher}>
        {sections.map((s) => (
          <Pressable
            key={s.key}
            style={[styles.switcherItem, activeSection === s.key && styles.switcherItemActive]}
            onPress={() => setActiveSection(s.key)}
          >
            <Feather name={s.icon as ComponentProps<typeof Feather>["name"]} size={14} color={activeSection === s.key ? c.background : c.textSecondary} />
            <Text style={[styles.switcherText, activeSection === s.key && styles.switcherTextActive]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeSection === "about" && renderAboutSection()}
      {activeSection === "brand" && renderBrandSection()}
      {activeSection === "help" && renderHelpSection()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scrollContent: { paddingBottom: 120 },
  sectionSwitcher: {
    flexDirection: "row",
    marginHorizontal: spacing.xl,
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.xxl,
    marginTop: spacing.md,
  },
  switcherItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  switcherItemActive: { backgroundColor: c.tint },
  switcherText: { fontFamily: fonts.medium, fontSize: 12, color: c.textSecondary },
  switcherTextActive: { color: c.background, fontFamily: fonts.semibold },
  brandCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: c.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: c.tint + "30",
    marginBottom: spacing.xxl,
  },
  brandIconWrap: {
    width: 56, height: 56, borderRadius: radius.lg,
    backgroundColor: c.tint + "15",
    alignItems: "center", justifyContent: "center", marginBottom: spacing.md,
  },
  brandName: { fontFamily: fonts.bold, fontSize: 20, color: c.text },
  brandTagline: { fontFamily: fonts.regular, fontSize: 14, color: c.tint, marginTop: 4 },
  section: { marginHorizontal: spacing.xl, marginBottom: spacing.xxl },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 16, color: c.text, marginBottom: spacing.md },
  sectionHint: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted, marginBottom: spacing.md, lineHeight: 16 },
  paletteRow: { flexDirection: "row", justifyContent: "space-between" },
  paletteItem: { alignItems: "center", gap: 4 },
  paletteSwatch: { width: 48, height: 48, borderRadius: radius.md },
  paletteName: { fontFamily: fonts.medium, fontSize: 11, color: c.text },
  paletteHex: { fontFamily: fonts.regular, fontSize: 10, color: c.textMuted },
  infoRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: c.border,
  },
  infoText: { fontFamily: fonts.regular, fontSize: 14, color: c.textSecondary },
  platformGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  platformItem: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: c.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.md, borderWidth: 1, borderColor: c.border,
  },
  platformName: { fontFamily: fonts.medium, fontSize: 13, color: c.text },
  fieldGroup: { marginBottom: spacing.lg },
  label: { fontFamily: fonts.medium, fontSize: 14, color: c.text, marginBottom: 2 },
  hint: { fontFamily: fonts.regular, fontSize: 11, color: c.textMuted, marginBottom: spacing.sm, lineHeight: 15 },
  input: {
    backgroundColor: c.inputBg, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontFamily: fonts.regular, fontSize: 14, color: c.text,
    borderWidth: 1, borderColor: c.border,
  },
  textArea: { minHeight: 72, textAlignVertical: "top" },
  textAreaLarge: { minHeight: 120, textAlignVertical: "top" },
  colorRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  colorPreview: { width: 32, height: 32, borderRadius: radius.sm },
  colorNameInput: { flex: 1 },
  colorHexInput: { width: 100 },
  fontRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  fontRoleInput: { flex: 1 },
  fontNameInput: { flex: 1 },
  removeBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.md },
  addBtnText: { fontFamily: fonts.medium, fontSize: 13, color: c.tint },
  logoPreviewWrap: { alignItems: "center", marginBottom: spacing.md },
  logoPreview: { width: 120, height: 120, borderRadius: radius.lg, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
  logoRemoveBtn: { marginTop: spacing.sm },
  logoActions: { flexDirection: "row", gap: spacing.md },
  logoUploadBtn: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: c.surface, paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: c.tint + "40",
  },
  logoUploadText: { fontFamily: fonts.medium, fontSize: 13, color: c.tint },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: c.tint, marginHorizontal: spacing.xl, paddingVertical: spacing.lg,
    borderRadius: radius.md, gap: spacing.sm, marginBottom: spacing.xxl,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontFamily: fonts.semibold, fontSize: 16, color: "#FFF" },
  searchWrap: {
    flexDirection: "row", alignItems: "center", backgroundColor: c.inputBg,
    marginHorizontal: spacing.xl, borderRadius: radius.md, paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: c.border, marginBottom: spacing.xxl, gap: spacing.sm,
  },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: c.text, paddingVertical: spacing.md },
  featureCard: {
    flexDirection: "row", backgroundColor: c.surface, borderRadius: radius.md,
    padding: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: c.border, gap: spacing.md,
  },
  featureIconWrap: {
    width: 36, height: 36, borderRadius: radius.sm,
    backgroundColor: c.tint + "15", alignItems: "center", justifyContent: "center",
  },
  featureContent: { flex: 1 },
  featureTitle: { fontFamily: fonts.semibold, fontSize: 14, color: c.text, marginBottom: 2 },
  featureDesc: { fontFamily: fonts.regular, fontSize: 12, color: c.textSecondary, lineHeight: 17 },
  faqCategory: { marginBottom: spacing.lg },
  faqCategoryTitle: { fontFamily: fonts.medium, fontSize: 13, color: c.tint, marginBottom: spacing.sm, textTransform: "uppercase", letterSpacing: 0.5 },
  faqItem: {
    backgroundColor: c.surface, borderRadius: radius.md, padding: spacing.lg,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: c.border,
  },
  faqHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  faqQuestion: { fontFamily: fonts.medium, fontSize: 13, color: c.text, flex: 1, paddingRight: spacing.sm },
  faqAnswer: { fontFamily: fonts.regular, fontSize: 13, color: c.textSecondary, marginTop: spacing.md, lineHeight: 19 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: spacing.md },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: c.textMuted },
  clearSearch: { fontFamily: fonts.medium, fontSize: 14, color: c.tint },
});
