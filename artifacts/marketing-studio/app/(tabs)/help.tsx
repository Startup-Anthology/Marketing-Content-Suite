import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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

const c = Colors.light;

interface FaqEntry {
  q: string;
  a: string;
  category: string;
}

const FAQ_DATA: FaqEntry[] = [
  { category: "Content Creation", q: "How do I create a new content piece?", a: "Go to the Create tab, choose your content type (blog post, social media, email, etc.) and platform, enter your topic, and tap Generate. The AI will create a polished draft for you." },
  { category: "Content Creation", q: "Can I customize the tone of generated content?", a: "Yes! When creating content, you can specify the tone (professional, casual, witty, etc.). If you've set up your Brand Guide, the AI automatically uses your brand voice for every generation." },
  { category: "Content Creation", q: "What content types are supported?", a: "Blog posts, social media posts, email newsletters, ad copy, video scripts, and more. Each type is optimized for its specific format and platform requirements." },
  { category: "Studio", q: "What is the Studio tab for?", a: "The Studio tab lets you create and manage storyboards and ad creatives. Build visual content plans with scenes, hooks, headlines, and calls-to-action." },
  { category: "Studio", q: "How do I create a storyboard?", a: "In the Studio tab, tap the + button, choose Storyboard or Ad Creative, fill in the details for each scene, and save. You can edit scenes later." },
  { category: "Research", q: "How does SEO research work?", a: "Enter a topic in the Research tab and the AI analyzes it to provide relevant keywords, People Also Ask questions, talking points, and an AEO-optimized summary." },
  { category: "Research", q: "What is AEO?", a: "Answer Engine Optimization (AEO) is the practice of optimizing content for AI-powered search engines like Perplexity and ChatGPT search, ensuring your content appears in AI-generated answers." },
  { category: "Scheduling", q: "How do I schedule a post?", a: "Go to the Schedule tab, tap + to create a new post, select the platform, write your content, pick a date and time, and save. Posts are organized by their scheduled date." },
  { category: "Scheduling", q: "What platforms can I schedule for?", a: "LinkedIn, X/Twitter, Instagram, Email, TikTok, YouTube, and Facebook. Each platform's content format is optimized accordingly." },
  { category: "Brand Guide", q: "What is the Brand Guide?", a: "The Brand Guide is your brand identity hub. Define your brand name, voice, tone, colors, fonts, and story. This information is automatically injected into every AI generation so all content stays on-brand." },
  { category: "Brand Guide", q: "How does the Brand Guide affect AI output?", a: "When you save your brand guide, every AI generation (drafts, SEO research, etc.) automatically includes your brand context. The AI will use your brand name, match your voice descriptors, respect your tone, and reference your visual identity." },
  { category: "Brand Guide", q: "What should I put in Voice Descriptors?", a: "List adjectives that describe how your brand communicates. Examples: 'Professional, approachable, witty' or 'Bold, innovative, no-nonsense'. The AI uses these to match your writing style." },
  { category: "Brand Guide", q: "What is the Brand Story field for?", a: "Your brand story describes your mission, origin, and value proposition. The AI weaves this narrative into longer content pieces to maintain consistency in your brand messaging." },
  { category: "Brand Guide", q: "Do I need to fill in every field?", a: "No — fill in what you have. Even just a brand name and voice descriptors significantly improve AI output consistency. You can always add more details later." },
  { category: "General", q: "Is my data saved between sessions?", a: "Yes, all content, storyboards, research notes, scheduled posts, and your brand guide are saved to the database and persist across sessions." },
  { category: "General", q: "What AI model powers the content generation?", a: "The app uses advanced GPT models through OpenAI's API to generate high-quality marketing content tailored to your brand and specifications." },
];

const FEATURE_SECTIONS = [
  { icon: "edit-3" as const, title: "Create", description: "Generate AI-powered marketing content — blog posts, social media, emails, and ad copy — tailored to your brand voice and target platform." },
  { icon: "film" as const, title: "Studio", description: "Build storyboards and ad creatives with structured scenes. Plan visual content with hooks, headlines, and calls-to-action." },
  { icon: "search" as const, title: "Research", description: "Conduct SEO and AEO research. Get keywords, trending questions, talking points, and answer-engine-optimized summaries for any topic." },
  { icon: "calendar" as const, title: "Schedule", description: "Plan and schedule social media posts across all major platforms. Organize your content calendar with date-based scheduling." },
  { icon: "bookmark" as const, title: "Brand Guide", description: "Define your complete brand identity — name, voice, tone, colors, fonts, and story. Automatically injected into all AI generations for consistent, on-brand content." },
  { icon: "settings" as const, title: "Settings", description: "View your brand palette, supported platforms, and app information at a glance." },
];

const BRAND_GUIDE_FIELDS = [
  { field: "Brand Name", description: "Your company or product name. Used as the primary reference in all AI-generated content.", example: "Startup Anthology" },
  { field: "Tagline", description: "A short phrase capturing your brand essence. Included in content for brand recognition.", example: "Build. Ship. Grow. Repeat." },
  { field: "Voice Descriptors", description: "Adjectives describing your brand's communication style. AI matches these characteristics in generated text.", example: "Professional, approachable, authoritative" },
  { field: "Tone", description: "The emotional quality and energy level of your content. Controls formality and enthusiasm in AI output.", example: "Confident, encouraging, data-driven" },
  { field: "Brand Story", description: "Your origin story, mission, and unique value proposition. AI weaves this into longer content pieces.", example: "Founded to help first-time founders navigate the startup journey..." },
  { field: "Color Palette", description: "Your brand colors with names and hex values. Referenced in visual content suggestions and design recommendations.", example: "SA Gold (#BB935B), Black (#000000)" },
  { field: "Typography", description: "Font names and their roles (heading, body, etc.). Included in design-related AI suggestions.", example: "Heading: League Spartan, Body: Montserrat" },
  { field: "Logo URL", description: "A link to your logo image. Provides visual reference for brand consistency.", example: "https://example.com/logo.png" },
];

export default function HelpTab() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === "web" ? 67 : 0;
  const [search, setSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const normalizedSearch = search.toLowerCase().trim();

  const filteredFaq = normalizedSearch
    ? FAQ_DATA.filter(
        (f) =>
          f.q.toLowerCase().includes(normalizedSearch) ||
          f.a.toLowerCase().includes(normalizedSearch) ||
          f.category.toLowerCase().includes(normalizedSearch)
      )
    : FAQ_DATA;

  const filteredFeatures = normalizedSearch
    ? FEATURE_SECTIONS.filter(
        (f) =>
          f.title.toLowerCase().includes(normalizedSearch) ||
          f.description.toLowerCase().includes(normalizedSearch)
      )
    : FEATURE_SECTIONS;

  const filteredBrandFields = normalizedSearch
    ? BRAND_GUIDE_FIELDS.filter(
        (f) =>
          f.field.toLowerCase().includes(normalizedSearch) ||
          f.description.toLowerCase().includes(normalizedSearch) ||
          f.example.toLowerCase().includes(normalizedSearch)
      )
    : BRAND_GUIDE_FIELDS;

  const categories = [...new Set(filteredFaq.map((f) => f.category))];

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + webTop }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help</Text>
        <Text style={styles.headerSubtitle}>
          Search for answers, explore features, and learn how the Brand Guide shapes your AI content.
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <Feather name="search" size={16} color={c.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search help topics..."
          placeholderTextColor={c.textMuted}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
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

      {filteredBrandFields.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Branding Guide Reference</Text>
          <Text style={styles.sectionHint}>
            Each field below is automatically included in AI prompts when you save your Brand Guide.
          </Text>
          {filteredBrandFields.map((bf) => (
            <View key={bf.field} style={styles.brandFieldCard}>
              <Text style={styles.brandFieldName}>{bf.field}</Text>
              <Text style={styles.brandFieldDesc}>{bf.description}</Text>
              <View style={styles.exampleWrap}>
                <Text style={styles.exampleLabel}>Example:</Text>
                <Text style={styles.exampleText}>{bf.example}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {filteredFaq.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAQ</Text>
          {categories.map((cat) => (
            <View key={cat} style={styles.faqCategory}>
              <Text style={styles.faqCategoryTitle}>{cat}</Text>
              {filteredFaq
                .filter((f) => f.category === cat)
                .map((faq, idx) => {
                  const globalIdx = FAQ_DATA.indexOf(faq);
                  const isExpanded = expandedFaq === globalIdx;
                  return (
                    <Pressable
                      key={idx}
                      style={styles.faqItem}
                      onPress={() => setExpandedFaq(isExpanded ? null : globalIdx)}
                    >
                      <View style={styles.faqHeader}>
                        <Text style={styles.faqQuestion}>{faq.q}</Text>
                        <Feather
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={16}
                          color={c.textMuted}
                        />
                      </View>
                      {isExpanded && (
                        <Text style={styles.faqAnswer}>{faq.a}</Text>
                      )}
                    </Pressable>
                  );
                })}
            </View>
          ))}
        </View>
      )}

      {filteredFaq.length === 0 && filteredFeatures.length === 0 && filteredBrandFields.length === 0 && (
        <View style={styles.emptyState}>
          <Feather name="search" size={40} color={c.textMuted} />
          <Text style={styles.emptyText}>No results found for "{search}"</Text>
          <Pressable onPress={() => setSearch("")}>
            <Text style={styles.clearSearch}>Clear search</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scrollContent: { paddingBottom: 120 },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  headerTitle: { fontFamily: fonts.bold, fontSize: 28, color: c.text },
  headerSubtitle: { fontFamily: fonts.regular, fontSize: 13, color: c.textSecondary, marginTop: 4, lineHeight: 18 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.inputBg,
    marginHorizontal: spacing.xl,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: c.border,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.text,
    paddingVertical: spacing.md,
  },
  section: { marginHorizontal: spacing.xl, marginBottom: spacing.xxl },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 16, color: c.text, marginBottom: spacing.md },
  sectionHint: { fontFamily: fonts.regular, fontSize: 12, color: c.textMuted, marginBottom: spacing.md, lineHeight: 16 },
  featureCard: {
    flexDirection: "row",
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
    gap: spacing.md,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: c.tint + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: { flex: 1 },
  featureTitle: { fontFamily: fonts.semibold, fontSize: 14, color: c.text, marginBottom: 2 },
  featureDesc: { fontFamily: fonts.regular, fontSize: 12, color: c.textSecondary, lineHeight: 17 },
  brandFieldCard: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
  },
  brandFieldName: { fontFamily: fonts.semibold, fontSize: 14, color: c.tint, marginBottom: 4 },
  brandFieldDesc: { fontFamily: fonts.regular, fontSize: 13, color: c.textSecondary, lineHeight: 18, marginBottom: spacing.sm },
  exampleWrap: {
    flexDirection: "row",
    backgroundColor: c.surfaceElevated,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  exampleLabel: { fontFamily: fonts.medium, fontSize: 11, color: c.textMuted },
  exampleText: { fontFamily: fonts.regular, fontSize: 11, color: c.textSecondary, flex: 1 },
  faqCategory: { marginBottom: spacing.lg },
  faqCategoryTitle: { fontFamily: fonts.medium, fontSize: 13, color: c.tint, marginBottom: spacing.sm, textTransform: "uppercase", letterSpacing: 0.5 },
  faqItem: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
  },
  faqHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  faqQuestion: { fontFamily: fonts.medium, fontSize: 13, color: c.text, flex: 1, paddingRight: spacing.sm },
  faqAnswer: { fontFamily: fonts.regular, fontSize: 13, color: c.textSecondary, marginTop: spacing.md, lineHeight: 19 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: spacing.md },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: c.textMuted },
  clearSearch: { fontFamily: fonts.medium, fontSize: 14, color: c.tint },
});
