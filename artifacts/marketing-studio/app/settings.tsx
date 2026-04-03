import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import React, { useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import BrandGuideViewer from "@/components/BrandGuideViewer";
import type { ColorPalette } from "@/constants/colors";
import { fonts, spacing, radius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  fetchBrandGuide,
  saveBrandGuide,
  fetchGoogleCalendarStatus,
  fetchGoogleCalendarAuthUrl,
  disconnectGoogleCalendar,
  fetchSocialAccounts,
  addSocialAccount,
  updateSocialAccount,
  deleteSocialAccount,
  updateProfile,
  fetchAdminUsers,
  updateAdminUser,
  fetchUtmLinks,
  createUtmLink,
  updateUtmLink,
  deleteUtmLink,
} from "@/lib/api";

type MCIName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type SectionKey = "about" | "brand" | "integrations" | "profile" | "admin" | "help";

const BRAND_COLORS_DEFAULT = [
  { name: "SA Gold", hex: "#BB935B" },
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#64748B" },
];

const SUPPORTED_PLATFORMS: { name: string; icon: MCIName; key: string }[] = [
  { name: "LinkedIn", icon: "linkedin", key: "LinkedIn" },
  { name: "X / Twitter", icon: "twitter", key: "X/Twitter" },
  { name: "Instagram", icon: "instagram", key: "Instagram" },
  { name: "Email", icon: "email-outline", key: "Email" },
  { name: "TikTok", icon: "music-note", key: "TikTok" },
  { name: "YouTube", icon: "youtube", key: "YouTube" },
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

interface SocialAccountData {
  id: number;
  platform: string;
  username: string;
  profileUrl: string;
  isConnected: boolean;
}

interface AdminUser {
  id: number;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface UtmLinkData {
  id: number;
  userId: number;
  destinationUrl: string;
  source: string;
  medium: string;
  campaign: string;
  content: string | null;
  term: string | null;
  fullUrl: string;
  shortCode: string | null;
  shortUrl: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const UTM_SOURCES = [
  "linkedin", "twitter", "instagram", "facebook", "newsletter",
  "email-sequence", "google", "podcast", "youtube", "tiktok",
  "partner", "qr-code", "direct-outreach", "blog",
];

const UTM_MEDIUMS = [
  "social", "paid-social", "email", "cpc", "paid",
  "referral", "audio", "video", "organic", "qr",
];

export default function SettingsScreen() {
  const { colors: c } = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionKey>("about");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [helpSearch, setHelpSearch] = useState("");
  const [brandGuideVisible, setBrandGuideVisible] = useState(false);

  const [brandName, setBrandName] = useState("");
  const [voiceDescriptors, setVoiceDescriptors] = useState("");
  const [tone, setTone] = useState("");
  const [tagline, setTagline] = useState("");
  const [brandStory, setBrandStory] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [colors, setColors] = useState<ColorEntry[]>(DEFAULT_COLORS);
  const [fontEntries, setFontEntries] = useState<FontEntry[]>(DEFAULT_FONTS);
  const [hasChanges, setHasChanges] = useState(false);

  const [profileName, setProfileName] = useState(user?.displayName || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profileHasChanges, setProfileHasChanges] = useState(false);
  const [notifContent, setNotifContent] = useState(true);
  const [notifSchedule, setNotifSchedule] = useState(true);

  const [addingPlatform, setAddingPlatform] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [newProfileUrl, setNewProfileUrl] = useState("");

  useEffect(() => {
    if (user) {
      setProfileName(user.displayName || "");
      setProfileEmail(user.email || "");
      try {
        const prefs = JSON.parse(user.preferences || "{}");
        setNotifContent(prefs.notifContent !== false);
        setNotifSchedule(prefs.notifSchedule !== false);
      } catch {}
    }
  }, [user]);

  const { data: guide, isLoading } = useQuery({
    queryKey: ["brand-guide"],
    queryFn: fetchBrandGuide,
  });

  const { data: socialAccounts = [], refetch: refetchSocial } = useQuery({
    queryKey: ["social-accounts"],
    queryFn: fetchSocialAccounts,
  });

  const { data: adminUsers = [], refetch: refetchAdminUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
    enabled: user?.role === "admin",
  });

  const { data: utmLinks = [], refetch: refetchUtmLinks } = useQuery({
    queryKey: ["utm-links"],
    queryFn: fetchUtmLinks,
    enabled: user?.role === "admin" || user?.role === "editor",
  });

  // UTM form state
  const [utmDestination, setUtmDestination] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmNotes, setUtmNotes] = useState("");
  const [utmShowForm, setUtmShowForm] = useState(false);
  const [utmStatusFilter, setUtmStatusFilter] = useState<string>("all");
  const [utmShowGuide, setUtmShowGuide] = useState(false);
  const [utmEditingId, setUtmEditingId] = useState<number | null>(null);

  const utmCreateMutation = useMutation({
    mutationFn: (data: { destinationUrl: string; source: string; medium: string; campaign: string; content?: string; term?: string; notes?: string }) =>
      utmEditingId ? updateUtmLink(utmEditingId, data) : createUtmLink(data),
    onSuccess: () => {
      refetchUtmLinks();
      setUtmDestination("");
      setUtmSource("");
      setUtmMedium("");
      setUtmCampaign("");
      setUtmContent("");
      setUtmTerm("");
      setUtmNotes("");
      setUtmShowForm(false);
      setUtmEditingId(null);
    },
  });

  const utmDeleteMutation = useMutation({
    mutationFn: (id: number) => deleteUtmLink(id),
    onSuccess: () => refetchUtmLinks(),
  });

  const utmStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateUtmLink(id, { status }),
    onSuccess: () => refetchUtmLinks(),
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

  const profileMutation = useMutation({
    mutationFn: () =>
      updateProfile({
        displayName: profileName,
        email: profileEmail,
        preferences: JSON.stringify({ notifContent, notifSchedule }),
      }),
    onSuccess: (data: { id: number; email: string; displayName: string; avatarUrl: string; role: string; preferences: string }) => {
      updateUser(data);
      setProfileHasChanges(false);
      Alert.alert("Saved", "Profile updated.");
    },
    onError: () => {
      Alert.alert("Error", "Could not update profile.");
    },
  });

  const addSocialMutation = useMutation({
    mutationFn: (data: { platform: string; username: string; profileUrl: string }) => addSocialAccount(data),
    onSuccess: () => {
      refetchSocial();
      setAddingPlatform(null);
      setNewUsername("");
      setNewProfileUrl("");
    },
    onError: () => {
      Alert.alert("Error", "Could not save social account.");
    },
  });

  const deleteSocialMutation = useMutation({
    mutationFn: (id: number) => deleteSocialAccount(id),
    onSuccess: () => refetchSocial(),
  });

  const adminUpdateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { role?: string; isActive?: boolean } }) => updateAdminUser(id, data),
    onSuccess: () => refetchAdminUsers(),
    onError: () => {
      Alert.alert("Error", "Could not update user.");
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

  const handleUseAsTemplate = () => {
    setBrandName("Startup Anthology");
    setVoiceDescriptors("Empowering, Supportive, Honest, Accessible, Action-Oriented, Builder-Centric");
    setTone("Confident, encouraging, data-driven");
    setTagline("Educate. Equip. Elevate.");
    setBrandStory("Empowering entrepreneurs and small business owners who'd rather run their business than wrestle with it. We give them the tools and knowledge to focus on growth, not complexity. Championing the operators and doers who don't have time for spreadsheet headaches or financial jargon.");
    setColors([
      { name: "SA Gold", hex: "#BB935B" },
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Gray", hex: "#999999" },
    ]);
    setFontEntries([
      { role: "Heading", name: "League Spartan" },
      { role: "Body", name: "Montserrat" },
      { role: "Title", name: "Lato" },
      { role: "Quote", name: "Lora" },
    ]);
    setHasChanges(true);
    setBrandGuideVisible(false);
    setActiveSection("brand");
    Alert.alert("Template Applied", "The Startup Anthology brand structure has been loaded into your Brand Guide editor. Review and save when ready.");
  };

  const normalizedSearch = helpSearch.toLowerCase().trim();
  const filteredFaq = normalizedSearch
    ? FAQ_DATA.filter((f) => f.q.toLowerCase().includes(normalizedSearch) || f.a.toLowerCase().includes(normalizedSearch) || f.category.toLowerCase().includes(normalizedSearch))
    : FAQ_DATA;
  const filteredFeatures = normalizedSearch
    ? FEATURE_SECTIONS.filter((f) => f.title.toLowerCase().includes(normalizedSearch) || f.description.toLowerCase().includes(normalizedSearch))
    : FEATURE_SECTIONS;
  const faqCategories = [...new Set(filteredFaq.map((f) => f.category))];

  const socialAccountsMap: Record<string, SocialAccountData> = {};
  (socialAccounts as SocialAccountData[]).forEach((acc) => {
    socialAccountsMap[acc.platform] = acc;
  });

  const handlePlatformPress = (platform: { name: string; key: string }) => {
    const account = socialAccountsMap[platform.key];
    if (account && account.isConnected && account.profileUrl) {
      Linking.openURL(account.profileUrl);
    } else {
      setActiveSection("profile");
      setAddingPlatform(platform.key);
    }
  };

  const renderAboutSection = () => (
    <>
      <View style={styles.brandCard}>
        <View style={styles.brandIconWrap}>
          <Image source={require("@/assets/sa-icon-white.png")} style={styles.brandLogoImg} resizeMode="contain" />
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
          {SUPPORTED_PLATFORMS.map((p) => {
            const account = socialAccountsMap[p.key];
            const isConnected = account?.isConnected;
            return (
              <Pressable
                key={p.name}
                style={[styles.platformItem, isConnected && styles.platformItemConnected]}
                onPress={() => handlePlatformPress(p)}
              >
                <MaterialCommunityIcons name={p.icon} size={20} color={isConnected ? c.success : c.tint} />
                <Text style={styles.platformName}>{p.name}</Text>
                {isConnected && (
                  <Feather name="check-circle" size={14} color={c.success} />
                )}
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.platformHint}>Tap a platform to view your profile or connect an account</Text>
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

  const { data: calStatus, isLoading: calLoading } = useQuery({
    queryKey: ["google-calendar-status"],
    queryFn: fetchGoogleCalendarStatus,
  });

  const connectCalMutation = useMutation({
    mutationFn: async () => {
      const { url } = await fetchGoogleCalendarAuthUrl();
      if (Platform.OS === "web") {
        window.open(url, "_blank");
      } else {
        await Linking.openURL(url);
      }
    },
  });

  const disconnectCalMutation = useMutation({
    mutationFn: disconnectGoogleCalendar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-calendar-status"] });
      Alert.alert("Disconnected", "Google Calendar has been disconnected.");
    },
  });

  const handleDisconnectCalendar = () => {
    Alert.alert(
      "Disconnect Google Calendar",
      "Scheduled posts will no longer sync to your calendar. Existing calendar events will remain.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: () => disconnectCalMutation.mutate(),
        },
      ]
    );
  };

  const renderIntegrationsSection = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Google Calendar</Text>
        <Text style={styles.sectionHint}>
          Connect your Google Calendar to automatically sync scheduled posts as calendar events.
        </Text>

        <View style={styles.integrationCard}>
          <View style={styles.integrationIcon}>
            <MaterialCommunityIcons name="google" size={24} color="#4285F4" />
          </View>
          <View style={styles.integrationInfo}>
            <Text style={styles.integrationName}>Google Calendar</Text>
            <View style={styles.integrationStatusRow}>
              <View
                style={[
                  styles.integrationDot,
                  { backgroundColor: calStatus?.connected ? c.success : c.textMuted },
                ]}
              />
              <Text
                style={[
                  styles.integrationStatusText,
                  { color: calStatus?.connected ? c.success : c.textMuted },
                ]}
              >
                {calLoading
                  ? "Checking..."
                  : calStatus?.connected
                    ? "Connected"
                    : "Not connected"}
              </Text>
            </View>
          </View>
          {calStatus?.connected ? (
            <Pressable
              style={({ pressed }) => [
                styles.disconnectBtn,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleDisconnectCalendar}
              disabled={disconnectCalMutation.isPending}
            >
              <Feather name="x" size={14} color={c.error} />
              <Text style={styles.disconnectBtnText}>Disconnect</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.connectBtn,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => connectCalMutation.mutate()}
              disabled={connectCalMutation.isPending}
            >
              {connectCalMutation.isPending ? (
                <ActivityIndicator size="small" color={c.tint} />
              ) : (
                <>
                  <Feather name="link" size={14} color={c.tint} />
                  <Text style={styles.connectBtnText}>Connect</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {calStatus?.connected && (
          <View style={styles.syncInfoCard}>
            <Feather name="check-circle" size={16} color={c.success} />
            <Text style={styles.syncInfoText}>
              New and updated scheduled posts will automatically appear on your Google Calendar.
            </Text>
          </View>
        )}
      </View>
    </>
  );

  const renderProfileSection = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Profile</Text>

        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileDisplayName}>{user?.displayName || "No name set"}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user?.role}</Text>
            </View>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={profileName}
            onChangeText={(v) => { setProfileName(v); setProfileHasChanges(true); }}
            placeholder="Your display name"
            placeholderTextColor={c.textMuted}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={profileEmail}
            onChangeText={(v) => { setProfileEmail(v); setProfileHasChanges(true); }}
            placeholder="your@email.com"
            placeholderTextColor={c.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Notifications</Text>
          <Pressable
            style={styles.toggleRow}
            onPress={() => { setNotifContent(!notifContent); setProfileHasChanges(true); }}
          >
            <Text style={styles.toggleLabel}>Content updates</Text>
            <View style={[styles.toggle, notifContent && styles.toggleActive]}>
              <View style={[styles.toggleDot, notifContent && styles.toggleDotActive]} />
            </View>
          </Pressable>
          <Pressable
            style={styles.toggleRow}
            onPress={() => { setNotifSchedule(!notifSchedule); setProfileHasChanges(true); }}
          >
            <Text style={styles.toggleLabel}>Schedule reminders</Text>
            <View style={[styles.toggle, notifSchedule && styles.toggleActive]}>
              <View style={[styles.toggleDot, notifSchedule && styles.toggleDotActive]} />
            </View>
          </Pressable>
        </View>

        <Pressable
          style={[styles.saveBtn, { marginHorizontal: 0 }, (!profileHasChanges || profileMutation.isPending) && styles.saveBtnDisabled]}
          onPress={() => profileMutation.mutate()}
          disabled={!profileHasChanges || profileMutation.isPending}
        >
          {profileMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Feather name="save" size={18} color="#FFF" />
              <Text style={styles.saveBtnText}>Save Profile</Text>
            </>
          )}
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Social Accounts</Text>
        <Text style={styles.sectionHint}>Connect your social media accounts to track and manage them from one place.</Text>

        {SUPPORTED_PLATFORMS.map((p) => {
          const account = socialAccountsMap[p.key];
          const isAdding = addingPlatform === p.key;

          return (
            <View key={p.key} style={styles.socialAccountCard}>
              <View style={styles.socialAccountHeader}>
                <View style={styles.socialAccountLeft}>
                  <MaterialCommunityIcons name={p.icon} size={22} color={account?.isConnected ? c.success : c.tint} />
                  <Text style={styles.socialAccountName}>{p.name}</Text>
                </View>
                {account?.isConnected ? (
                  <View style={styles.socialAccountRight}>
                    <View style={styles.connectedBadge}>
                      <Feather name="check" size={10} color={c.success} />
                      <Text style={styles.connectedText}>Connected</Text>
                    </View>
                    <Pressable
                      style={styles.disconnectBtn}
                      onPress={() => {
                        Alert.alert("Disconnect", `Remove ${p.name} account?`, [
                          { text: "Cancel" },
                          { text: "Remove", style: "destructive", onPress: () => deleteSocialMutation.mutate(account.id) },
                        ]);
                      }}
                    >
                      <Feather name="x" size={14} color={c.error} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    style={styles.connectBtn}
                    onPress={() => setAddingPlatform(isAdding ? null : p.key)}
                  >
                    <Text style={styles.connectBtnText}>{isAdding ? "Cancel" : "Connect"}</Text>
                  </Pressable>
                )}
              </View>

              {account?.isConnected && (
                <View style={styles.socialAccountDetails}>
                  <Text style={styles.socialAccountUsername}>@{account.username}</Text>
                  {account.profileUrl ? (
                    <Pressable onPress={() => Linking.openURL(account.profileUrl)}>
                      <Text style={styles.socialAccountUrl} numberOfLines={1}>{account.profileUrl}</Text>
                    </Pressable>
                  ) : null}
                </View>
              )}

              {isAdding && !account?.isConnected && (
                <View style={styles.socialAccountForm}>
                  <TextInput
                    style={styles.input}
                    value={newUsername}
                    onChangeText={setNewUsername}
                    placeholder="Username / handle"
                    placeholderTextColor={c.textMuted}
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={[styles.input, { marginTop: spacing.sm }]}
                    value={newProfileUrl}
                    onChangeText={setNewProfileUrl}
                    placeholder="Profile URL (e.g. https://linkedin.com/in/...)"
                    placeholderTextColor={c.textMuted}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                  <Pressable
                    style={[styles.saveSmallBtn, addSocialMutation.isPending && styles.saveBtnDisabled]}
                    onPress={() => addSocialMutation.mutate({ platform: p.key, username: newUsername, profileUrl: newProfileUrl })}
                    disabled={addSocialMutation.isPending}
                  >
                    {addSocialMutation.isPending ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.saveSmallBtnText}>Save Account</Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <Pressable style={styles.logoutBtn} onPress={() => {
        const doLogout = async () => {
          await logout();
          router.replace("/login");
        };
        if (Platform.OS === "web") {
          const confirmed = window.confirm("Are you sure you want to sign out?");
          if (confirmed) doLogout();
        } else {
          Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel" },
            { text: "Sign Out", style: "destructive", onPress: doLogout },
          ]);
        }
      }}>
        <Feather name="log-out" size={16} color={c.error} />
        <Text style={styles.logoutBtnText}>Sign Out</Text>
      </Pressable>
    </>
  );

  const renderAdminSection = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Management</Text>
        <Text style={styles.sectionHint}>Manage registered users, assign roles, and control account access.</Text>

        {(adminUsers as AdminUser[]).map((u) => (
          <View key={u.id} style={[styles.adminUserCard, !u.isActive && styles.adminUserInactive]}>
            <View style={styles.adminUserHeader}>
              <View style={styles.adminUserLeft}>
                <View style={styles.adminAvatarSmall}>
                  <Text style={styles.adminAvatarText}>
                    {(u.displayName || u.email).charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.adminUserName}>{u.displayName || "No name"}</Text>
                  <Text style={styles.adminUserEmail}>{u.email}</Text>
                </View>
              </View>
              {!u.isActive && (
                <View style={styles.inactiveBadge}>
                  <Text style={styles.inactiveBadgeText}>Inactive</Text>
                </View>
              )}
            </View>

            <View style={styles.adminUserActions}>
              <Text style={styles.adminRoleLabel}>Role:</Text>
              {["admin", "editor", "viewer"].map((role) => (
                <Pressable
                  key={role}
                  style={[styles.roleChip, u.role === role && styles.roleChipActive]}
                  onPress={() => {
                    if (u.id === user?.id && role !== "admin") return;
                    adminUpdateMutation.mutate({ id: u.id, data: { role } });
                  }}
                >
                  <Text style={[styles.roleChipText, u.role === role && styles.roleChipTextActive]}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </Pressable>
              ))}

              {u.id !== user?.id && (
                <Pressable
                  style={styles.toggleActiveBtn}
                  onPress={() => {
                    Alert.alert(
                      u.isActive ? "Deactivate User" : "Reactivate User",
                      `${u.isActive ? "Deactivate" : "Reactivate"} ${u.email}?`,
                      [
                        { text: "Cancel" },
                        {
                          text: u.isActive ? "Deactivate" : "Reactivate",
                          style: u.isActive ? "destructive" : "default",
                          onPress: () => adminUpdateMutation.mutate({ id: u.id, data: { isActive: !u.isActive } }),
                        },
                      ]
                    );
                  }}
                >
                  <Feather name={u.isActive ? "user-x" : "user-check"} size={14} color={u.isActive ? c.error : c.success} />
                  <Text style={[styles.toggleActiveBtnText, { color: u.isActive ? c.error : c.success }]}>
                    {u.isActive ? "Deactivate" : "Reactivate"}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}

        {(adminUsers as AdminUser[]).length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="users" size={40} color={c.textMuted} />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        )}
      </View>

      {/* UTM Links Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>UTM Links</Text>
        <Text style={styles.sectionHint}>Create, track, and manage UTM-tagged URLs for your marketing campaigns.</Text>

        {/* Naming Guide Toggle */}
        <Pressable
          style={styles.utmGuideToggle}
          onPress={() => setUtmShowGuide(!utmShowGuide)}
        >
          <Feather name="book-open" size={14} color={c.tint} />
          <Text style={styles.utmGuideToggleText}>Naming Convention Guide</Text>
          <Feather name={utmShowGuide ? "chevron-up" : "chevron-down"} size={14} color={c.tint} />
        </Pressable>

        {utmShowGuide && (
          <View style={styles.utmGuidePanel}>
            <Text style={styles.utmGuideHeading}>Sources</Text>
            <Text style={styles.utmGuideBody}>
              {UTM_SOURCES.join(", ")}
            </Text>
            <Text style={styles.utmGuideHeading}>Mediums</Text>
            <Text style={styles.utmGuideBody}>
              {UTM_MEDIUMS.join(", ")}
            </Text>
            <Text style={styles.utmGuideHeading}>Campaign Format</Text>
            <Text style={styles.utmGuideBody}>
              {"Use: {year}-{quarter}-{descriptive-name}\nExample: 2026-q2-fundraising-guide"}
            </Text>
            <Text style={styles.utmGuideHeading}>Rules</Text>
            <Text style={styles.utmGuideBody}>
              {"Always lowercase. Use hyphens for spaces. No special characters."}
            </Text>
          </View>
        )}

        {/* Create / Edit Form Toggle */}
        <Pressable
          style={styles.utmAddBtn}
          onPress={() => {
            if (utmShowForm && utmEditingId) {
              setUtmEditingId(null);
              setUtmDestination("");
              setUtmSource("");
              setUtmMedium("");
              setUtmCampaign("");
              setUtmContent("");
              setUtmTerm("");
              setUtmNotes("");
            }
            setUtmShowForm(!utmShowForm);
          }}
        >
          <Feather name={utmShowForm ? "x" : "plus"} size={16} color="#FFF" />
          <Text style={styles.utmAddBtnText}>{utmShowForm ? "Cancel" : "Create UTM Link"}</Text>
        </Pressable>

        {/* UTM Form */}
        {utmShowForm && (
          <View style={styles.utmForm}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Destination URL *</Text>
              <Text style={styles.hint}>The page you want visitors to land on</Text>
              <TextInput
                style={styles.input}
                value={utmDestination}
                onChangeText={setUtmDestination}
                placeholder="https://startupanthology.com/guides/..."
                placeholderTextColor={c.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Source *</Text>
              <Text style={styles.hint}>Where traffic comes from</Text>
              <View style={styles.utmChipRow}>
                {UTM_SOURCES.map((s) => (
                  <Pressable
                    key={s}
                    style={[styles.utmChip, utmSource === s && styles.utmChipActive]}
                    onPress={() => setUtmSource(utmSource === s ? "" : s)}
                  >
                    <Text style={[styles.utmChipText, utmSource === s && styles.utmChipTextActive]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                style={[styles.input, { marginTop: spacing.sm }]}
                value={utmSource}
                onChangeText={setUtmSource}
                placeholder="Or type a custom source..."
                placeholderTextColor={c.textMuted}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Medium *</Text>
              <Text style={styles.hint}>Marketing channel type</Text>
              <View style={styles.utmChipRow}>
                {UTM_MEDIUMS.map((m) => (
                  <Pressable
                    key={m}
                    style={[styles.utmChip, utmMedium === m && styles.utmChipActive]}
                    onPress={() => setUtmMedium(utmMedium === m ? "" : m)}
                  >
                    <Text style={[styles.utmChipText, utmMedium === m && styles.utmChipTextActive]}>{m}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                style={[styles.input, { marginTop: spacing.sm }]}
                value={utmMedium}
                onChangeText={setUtmMedium}
                placeholder="Or type a custom medium..."
                placeholderTextColor={c.textMuted}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Campaign *</Text>
              <Text style={styles.hint}>{"Format: {year}-{quarter}-{name}"}</Text>
              <TextInput
                style={styles.input}
                value={utmCampaign}
                onChangeText={setUtmCampaign}
                placeholder="2026-q2-fundraising-guide"
                placeholderTextColor={c.textMuted}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Content (optional)</Text>
              <Text style={styles.hint}>Differentiates similar links — great for A/B testing</Text>
              <TextInput
                style={styles.input}
                value={utmContent}
                onChangeText={setUtmContent}
                placeholder="header-cta, ad-version-a, etc."
                placeholderTextColor={c.textMuted}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Term (optional)</Text>
              <Text style={styles.hint}>Paid search keyword</Text>
              <TextInput
                style={styles.input}
                value={utmTerm}
                onChangeText={setUtmTerm}
                placeholder="startup-funding"
                placeholderTextColor={c.textMuted}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={utmNotes}
                onChangeText={setUtmNotes}
                placeholder="Budget, schedule, A/B test details..."
                placeholderTextColor={c.textMuted}
                multiline
              />
            </View>

            {/* Live URL Preview */}
            {utmDestination && utmSource && utmMedium && utmCampaign && (
              <View style={styles.utmPreview}>
                <Text style={styles.utmPreviewLabel}>Preview URL</Text>
                <Text style={styles.utmPreviewUrl} selectable>
                  {`${utmDestination}${utmDestination.includes("?") ? "&" : "?"}utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}${utmContent ? `&utm_content=${utmContent}` : ""}${utmTerm ? `&utm_term=${utmTerm}` : ""}`}
                </Text>
              </View>
            )}

            <Pressable
              style={[styles.saveBtn, { marginHorizontal: 0 }, (!utmDestination || !utmSource || !utmMedium || !utmCampaign || utmCreateMutation.isPending) && styles.saveBtnDisabled]}
              disabled={!utmDestination || !utmSource || !utmMedium || !utmCampaign || utmCreateMutation.isPending}
              onPress={() => utmCreateMutation.mutate({
                destinationUrl: utmDestination,
                source: utmSource,
                medium: utmMedium,
                campaign: utmCampaign,
                ...(utmContent ? { content: utmContent } : {}),
                ...(utmTerm ? { term: utmTerm } : {}),
                ...(utmNotes ? { notes: utmNotes } : {}),
              })}
            >
              {utmCreateMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Feather name={utmEditingId ? "check" : "link"} size={16} color="#FFF" />
                  <Text style={styles.saveBtnText}>{utmEditingId ? "Update UTM Link" : "Create UTM Link"}</Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {/* Status Filters */}
        <View style={[styles.utmChipRow, { marginTop: spacing.lg, marginBottom: spacing.md }]}>
          {["all", "active", "paused", "completed"].map((s) => (
            <Pressable
              key={s}
              style={[styles.utmChip, utmStatusFilter === s && styles.utmChipActive]}
              onPress={() => setUtmStatusFilter(s)}
            >
              <Text style={[styles.utmChipText, utmStatusFilter === s && styles.utmChipTextActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* UTM Links List */}
        {(utmLinks as UtmLinkData[])
          .filter((link) => utmStatusFilter === "all" || link.status === utmStatusFilter)
          .map((link) => (
            <View key={link.id} style={styles.utmCard}>
              <View style={styles.utmCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.utmCardCampaign}>{link.campaign}</Text>
                  <View style={styles.utmBadgeRow}>
                    <View style={styles.utmBadge}>
                      <Text style={styles.utmBadgeText}>{link.source}</Text>
                    </View>
                    <View style={styles.utmBadge}>
                      <Text style={styles.utmBadgeText}>{link.medium}</Text>
                    </View>
                    {link.content && (
                      <View style={styles.utmBadge}>
                        <Text style={styles.utmBadgeText}>{link.content}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.utmStatusActions}>
                  {["active", "paused", "completed"].map((s) => (
                    <Pressable
                      key={s}
                      style={[
                        styles.utmStatusChip,
                        link.status === s && (s === "active" ? styles.utmStatusActive : s === "paused" ? styles.utmStatusPaused : styles.utmStatusCompleted),
                      ]}
                      onPress={() => {
                        if (link.status !== s) utmStatusMutation.mutate({ id: link.id, status: s });
                      }}
                    >
                      <Text style={[
                        styles.utmStatusChipText,
                        link.status === s && (s === "active" ? styles.utmStatusActiveText : s === "paused" ? styles.utmStatusPausedText : styles.utmStatusCompletedText),
                      ]}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.utmCardBody}>
                <Text style={styles.utmCardLabel}>Destination</Text>
                <Text style={styles.utmCardUrl} selectable numberOfLines={1}>{link.destinationUrl}</Text>

                <Text style={[styles.utmCardLabel, { marginTop: spacing.sm }]}>Full UTM URL</Text>
                <View style={styles.utmCopyRow}>
                  <Text style={styles.utmCardUrlSmall} selectable numberOfLines={2}>{link.fullUrl}</Text>
                  <Pressable onPress={() => {
                    if (Platform.OS === "web") { navigator.clipboard.writeText(link.fullUrl); }
                  }}>
                    <Feather name="copy" size={14} color={c.tint} />
                  </Pressable>
                </View>

                {link.shortCode && (
                  <>
                    <Text style={[styles.utmCardLabel, { marginTop: spacing.sm }]}>Short URL</Text>
                    <View style={styles.utmCopyRow}>
                      <Text style={styles.utmCardShortUrl} selectable>
                        {link.shortUrl || `https://startupanthology.com/go/${link.shortCode}`}
                      </Text>
                      <Pressable onPress={() => {
                        const shortUrl = link.shortUrl || `https://startupanthology.com/go/${link.shortCode}`;
                        if (Platform.OS === "web") { navigator.clipboard.writeText(shortUrl); }
                      }}>
                        <Feather name="copy" size={14} color={c.tint} />
                      </Pressable>
                    </View>
                  </>
                )}

                {link.notes && (
                  <>
                    <Text style={[styles.utmCardLabel, { marginTop: spacing.sm }]}>Notes</Text>
                    <Text style={styles.utmCardNotes}>{link.notes}</Text>
                  </>
                )}
              </View>

              <View style={styles.utmCardActions}>
                <Text style={styles.utmCardDate}>
                  {new Date(link.createdAt).toLocaleDateString()}
                </Text>
                <View style={{ flexDirection: "row", gap: spacing.md }}>
                  <Pressable onPress={() => {
                    setUtmEditingId(link.id);
                    setUtmDestination(link.destinationUrl);
                    setUtmSource(link.source);
                    setUtmMedium(link.medium);
                    setUtmCampaign(link.campaign);
                    setUtmContent(link.content || "");
                    setUtmTerm(link.term || "");
                    setUtmNotes(link.notes || "");
                    setUtmShowForm(true);
                  }}>
                    <Feather name="edit-2" size={14} color={c.tint} />
                  </Pressable>
                  <Pressable onPress={() => {
                    Alert.alert("Delete UTM Link", `Delete "${link.campaign}" link?`, [
                      { text: "Cancel" },
                      { text: "Delete", style: "destructive", onPress: () => utmDeleteMutation.mutate(link.id) },
                    ]);
                  }}>
                    <Feather name="trash-2" size={14} color={c.error} />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}

        {(utmLinks as UtmLinkData[]).filter((link) => utmStatusFilter === "all" || link.status === utmStatusFilter).length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="link" size={40} color={c.textMuted} />
            <Text style={styles.emptyText}>No UTM links yet</Text>
          </View>
        )}
      </View>
    </>
  );

  const renderHelpSection = () => (
    <>
      <Pressable style={styles.brandGuideCard} onPress={() => setBrandGuideVisible(true)}>
        <View style={styles.brandGuideCardIcon}>
          <MaterialCommunityIcons name="book-open-variant" size={24} color={c.tint} />
        </View>
        <View style={styles.brandGuideCardContent}>
          <Text style={styles.brandGuideCardTitle}>Startup Anthology Brand Guide</Text>
          <Text style={styles.brandGuideCardDesc}>
            Explore the complete brand identity system — colors, typography, voice, logo guidelines, and design patterns.
          </Text>
          <View style={styles.brandGuideCardFooter}>
            <View style={styles.brandGuideCardBadge}>
              <Text style={styles.brandGuideCardBadgeText}>Reference Example</Text>
            </View>
            <View style={styles.brandGuideCardAction}>
              <Text style={styles.brandGuideCardActionText}>View Guide</Text>
              <Feather name="arrow-right" size={12} color={c.tint} />
            </View>
          </View>
        </View>
      </Pressable>

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
    { key: "brand", label: "Brand", icon: "bookmark" },
    { key: "integrations", label: "Sync", icon: "link" },
    { key: "profile", label: "Profile", icon: "user" },
    ...(user?.role === "admin" ? [{ key: "admin" as SectionKey, label: "Admin", icon: "shield" }] : []),
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
      {activeSection === "integrations" && renderIntegrationsSection()}
      {activeSection === "profile" && renderProfileSection()}
      {activeSection === "admin" && user?.role === "admin" && renderAdminSection()}
      {activeSection === "help" && renderHelpSection()}

      <BrandGuideViewer
        visible={brandGuideVisible}
        onClose={() => setBrandGuideVisible(false)}
        onUseAsTemplate={handleUseAsTemplate}
      />
    </ScrollView>
  );
}

const createStyles = (c: ColorPalette) => StyleSheet.create({
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
  switcherText: { fontFamily: fonts.medium, fontSize: 11, color: c.textSecondary },
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
  brandLogoImg: { width: 36, height: 36 },
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
  platformItemConnected: {
    borderColor: c.success + "40",
    backgroundColor: c.success + "10",
  },
  platformName: { fontFamily: fonts.medium, fontSize: 13, color: c.text },
  platformHint: { fontFamily: fonts.regular, fontSize: 11, color: c.textMuted, marginTop: spacing.sm },
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
  brandGuideCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: c.tint + "40",
    marginBottom: spacing.xxl,
    flexDirection: "row",
    gap: spacing.lg,
  },
  brandGuideCardIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: c.tint + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  brandGuideCardContent: { flex: 1 },
  brandGuideCardTitle: { fontFamily: fonts.semibold, fontSize: 15, color: c.text, marginBottom: 4 },
  brandGuideCardDesc: { fontFamily: fonts.regular, fontSize: 12, color: c.textSecondary, lineHeight: 17, marginBottom: spacing.md },
  brandGuideCardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandGuideCardBadge: { backgroundColor: c.tint + "20", paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: 4 },
  brandGuideCardBadgeText: { fontFamily: fonts.medium, fontSize: 10, color: c.tint },
  brandGuideCardAction: { flexDirection: "row", alignItems: "center", gap: 4 },
  brandGuideCardActionText: { fontFamily: fonts.medium, fontSize: 12, color: c.tint },
  integrationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: c.border,
    gap: spacing.md,
  },
  integrationIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: "#4285F4" + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  integrationInfo: { flex: 1 },
  integrationName: { fontFamily: fonts.semibold, fontSize: 15, color: c.text },
  integrationStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  integrationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  integrationStatusText: {
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  connectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: c.tint + "15",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  connectBtnText: { fontFamily: fonts.medium, fontSize: 13, color: c.tint },
  disconnectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: c.error + "10",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  disconnectBtnText: { fontFamily: fonts.medium, fontSize: 13, color: c.error },
  syncInfoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: c.success + "10",
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: c.success + "20",
  },
  syncInfoText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: c.success,
    flex: 1,
    lineHeight: 17,
  },
  profileHeader: {
    flexDirection: "row", alignItems: "center", gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  avatarWrap: {},
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: c.tint + "20", alignItems: "center", justifyContent: "center",
  },
  avatarInitial: { fontFamily: fonts.bold, fontSize: 24, color: c.tint },
  profileInfo: { flex: 1 },
  profileDisplayName: { fontFamily: fonts.semibold, fontSize: 18, color: c.text },
  profileEmail: { fontFamily: fonts.regular, fontSize: 13, color: c.textSecondary, marginTop: 2 },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: c.tint + "20", borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 2, marginTop: spacing.xs,
  },
  roleBadgeText: { fontFamily: fonts.medium, fontSize: 11, color: c.tint, textTransform: "capitalize" },

  toggleRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: c.border,
  },
  toggleLabel: { fontFamily: fonts.regular, fontSize: 14, color: c.text },
  toggle: {
    width: 44, height: 24, borderRadius: 12,
    backgroundColor: c.surfaceHigh, justifyContent: "center", paddingHorizontal: 2,
  },
  toggleActive: { backgroundColor: c.tint },
  toggleDot: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: c.textMuted,
  },
  toggleDotActive: { backgroundColor: "#FFF", alignSelf: "flex-end" },

  socialAccountCard: {
    backgroundColor: c.surface, borderRadius: radius.md,
    padding: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: c.border,
  },
  socialAccountHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  socialAccountLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  socialAccountName: { fontFamily: fonts.medium, fontSize: 14, color: c.text },
  socialAccountRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  connectedBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: c.success + "15", paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.sm,
  },
  connectedText: { fontFamily: fonts.medium, fontSize: 11, color: c.success },
  socialAccountDetails: {
    marginTop: spacing.sm, paddingTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: c.border,
  },
  socialAccountUsername: { fontFamily: fonts.medium, fontSize: 13, color: c.textSecondary },
  socialAccountUrl: { fontFamily: fonts.regular, fontSize: 12, color: c.tint, marginTop: 2 },
  socialAccountForm: { marginTop: spacing.md },
  saveSmallBtn: {
    backgroundColor: c.tint, paddingVertical: spacing.sm + 2,
    borderRadius: radius.md, alignItems: "center", marginTop: spacing.md,
  },
  saveSmallBtnText: { fontFamily: fonts.semibold, fontSize: 13, color: "#FFF" },

  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: spacing.sm, marginHorizontal: spacing.xl, paddingVertical: spacing.lg,
    borderRadius: radius.md, borderWidth: 1, borderColor: c.error + "30",
    marginBottom: spacing.xxl,
  },
  logoutBtnText: { fontFamily: fonts.medium, fontSize: 14, color: c.error },

  adminUserCard: {
    backgroundColor: c.surface, borderRadius: radius.md,
    padding: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: c.border,
  },
  adminUserInactive: { opacity: 0.6 },
  adminUserHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: spacing.md,
  },
  adminUserLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  adminAvatarSmall: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: c.tint + "20", alignItems: "center", justifyContent: "center",
  },
  adminAvatarText: { fontFamily: fonts.semibold, fontSize: 14, color: c.tint },
  adminUserName: { fontFamily: fonts.medium, fontSize: 14, color: c.text },
  adminUserEmail: { fontFamily: fonts.regular, fontSize: 12, color: c.textSecondary },
  inactiveBadge: {
    backgroundColor: c.error + "15", paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: radius.sm,
  },
  inactiveBadgeText: { fontFamily: fonts.medium, fontSize: 11, color: c.error },
  adminUserActions: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap",
  },
  adminRoleLabel: { fontFamily: fonts.medium, fontSize: 12, color: c.textSecondary },
  roleChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.sm, borderWidth: 1, borderColor: c.border,
  },
  roleChipActive: { backgroundColor: c.tint, borderColor: c.tint },
  roleChipText: { fontFamily: fonts.medium, fontSize: 12, color: c.textSecondary },
  roleChipTextActive: { color: "#FFF" },
  toggleActiveBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    marginLeft: "auto",
  },
  toggleActiveBtnText: { fontFamily: fonts.medium, fontSize: 12 },

  // UTM Links styles
  utmGuideToggle: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: c.tint + "10", borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    marginBottom: spacing.md, borderWidth: 1, borderColor: c.tint + "25",
  },
  utmGuideToggleText: { fontFamily: fonts.medium, fontSize: 13, color: c.tint, flex: 1 },
  utmGuidePanel: {
    backgroundColor: c.surface, borderRadius: radius.md, padding: spacing.lg,
    marginBottom: spacing.md, borderWidth: 1, borderColor: c.border,
  },
  utmGuideHeading: { fontFamily: fonts.semibold, fontSize: 13, color: c.tint, marginTop: spacing.sm, marginBottom: 2 },
  utmGuideBody: { fontFamily: fonts.regular, fontSize: 12, color: c.textSecondary, lineHeight: 17, marginBottom: spacing.sm },
  utmAddBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm,
    backgroundColor: c.tint, borderRadius: radius.md,
    paddingVertical: spacing.sm + 2, marginBottom: spacing.md,
  },
  utmAddBtnText: { fontFamily: fonts.semibold, fontSize: 14, color: "#FFF" },
  utmForm: {
    backgroundColor: c.surface, borderRadius: radius.md, padding: spacing.lg,
    marginBottom: spacing.md, borderWidth: 1, borderColor: c.border,
  },
  utmChipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  utmChip: {
    paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs,
    borderRadius: radius.sm, borderWidth: 1, borderColor: c.border,
    backgroundColor: c.surface,
  },
  utmChipActive: { backgroundColor: c.tint, borderColor: c.tint },
  utmChipText: { fontFamily: fonts.medium, fontSize: 11, color: c.textSecondary },
  utmChipTextActive: { color: "#FFF" },
  utmPreview: {
    backgroundColor: c.tint + "08", borderRadius: radius.md, padding: spacing.md,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: c.tint + "20",
  },
  utmPreviewLabel: { fontFamily: fonts.semibold, fontSize: 12, color: c.tint, marginBottom: spacing.xs },
  utmPreviewUrl: { fontFamily: fonts.regular, fontSize: 11, color: c.textSecondary, lineHeight: 16 },
  utmCard: {
    backgroundColor: c.surface, borderRadius: radius.md,
    padding: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: c.border,
  },
  utmCardHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  utmCardCampaign: { fontFamily: fonts.semibold, fontSize: 14, color: c.text, marginBottom: spacing.xs },
  utmBadgeRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  utmBadge: {
    backgroundColor: c.tint + "15", paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: radius.sm,
  },
  utmBadgeText: { fontFamily: fonts.medium, fontSize: 10, color: c.tint },
  utmStatusActions: { flexDirection: "row", gap: 2 },
  utmStatusChip: {
    paddingHorizontal: spacing.xs + 2, paddingVertical: 2, borderRadius: 4,
    borderWidth: 1, borderColor: c.border,
  },
  utmStatusChipText: { fontFamily: fonts.medium, fontSize: 9, color: c.textMuted },
  utmStatusActive: { backgroundColor: c.success + "15", borderColor: c.success + "30" },
  utmStatusActiveText: { color: c.success },
  utmStatusPaused: { backgroundColor: "#F59E0B15", borderColor: "#F59E0B30" },
  utmStatusPausedText: { color: "#F59E0B" },
  utmStatusCompleted: { backgroundColor: c.textMuted + "15", borderColor: c.textMuted + "30" },
  utmStatusCompletedText: { color: c.textMuted },
  utmCardBody: { borderTopWidth: 1, borderTopColor: c.border, paddingTop: spacing.sm },
  utmCardLabel: { fontFamily: fonts.medium, fontSize: 11, color: c.textMuted, marginBottom: 2 },
  utmCardUrl: { fontFamily: fonts.regular, fontSize: 13, color: c.text },
  utmCardUrlSmall: { fontFamily: fonts.regular, fontSize: 11, color: c.textSecondary, flex: 1, lineHeight: 16 },
  utmCardShortUrl: { fontFamily: fonts.medium, fontSize: 13, color: c.tint, flex: 1 },
  utmCopyRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  utmCardNotes: { fontFamily: fonts.regular, fontSize: 12, color: c.textSecondary, fontStyle: "italic" },
  utmCardActions: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderTopWidth: 1, borderTopColor: c.border, paddingTop: spacing.sm, marginTop: spacing.sm,
  },
  utmCardDate: { fontFamily: fonts.regular, fontSize: 11, color: c.textMuted },
});
