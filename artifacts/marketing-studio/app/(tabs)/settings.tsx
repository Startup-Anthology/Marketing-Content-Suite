import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { fonts, spacing, radius } from "@/constants/theme";

const c = Colors.light;

const BRAND_COLORS = [
  { name: "SA Gold", hex: "#BB935B" },
  { name: "Dark Navy", hex: "#0F1729" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Slate", hex: "#64748B" },
];

export default function SettingsTab() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === "web" ? 67 : 0;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + webTop }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.brandCard}>
        <View style={styles.brandIconWrap}>
          <MaterialCommunityIcons name="book-open-variant" size={28} color={c.tint} />
        </View>
        <Text style={styles.brandName}>Startup Anthology</Text>
        <Text style={styles.brandTagline}>
          Build. Ship. Grow. Repeat.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Brand Palette</Text>
        <View style={styles.colorRow}>
          {BRAND_COLORS.map((color) => (
            <View key={color.name} style={styles.colorItem}>
              <View
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor: color.hex,
                    borderWidth: color.hex === "#FFFFFF" ? 1 : 0,
                    borderColor: c.border,
                  },
                ]}
              />
              <Text style={styles.colorName}>{color.name}</Text>
              <Text style={styles.colorHex}>{color.hex}</Text>
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
          <Text style={styles.infoText}>Powered by AI content generation</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Supported Platforms</Text>
        <View style={styles.platformGrid}>
          {[
            { name: "LinkedIn", icon: "linkedin" },
            { name: "X / Twitter", icon: "twitter" },
            { name: "Instagram", icon: "instagram" },
            { name: "Email", icon: "email-outline" },
            { name: "TikTok", icon: "music-note" },
            { name: "YouTube", icon: "youtube" },
          ].map((p) => (
            <View key={p.name} style={styles.platformItem}>
              <MaterialCommunityIcons
                name={p.icon as any}
                size={20}
                color={c.tint}
              />
              <Text style={styles.platformName}>{p.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scrollContent: { paddingBottom: 120 },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  headerTitle: { fontFamily: fonts.bold, fontSize: 28, color: c.text },
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
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: c.tint + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  brandName: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: c.text,
  },
  brandTagline: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.tint,
    marginTop: 4,
  },
  section: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: c.text,
    marginBottom: spacing.md,
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  colorItem: { alignItems: "center", gap: 4 },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
  },
  colorName: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: c.text,
  },
  colorHex: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: c.textMuted,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  infoText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: c.textSecondary,
  },
  platformGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  platformItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: c.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
  },
  platformName: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: c.text,
  },
});
