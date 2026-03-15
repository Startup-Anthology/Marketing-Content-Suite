import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import React, { useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ImageSourcePropType } from "react-native";

import type { ColorPalette } from "@/constants/colors";
import { fonts, spacing, radius } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";

const LOGO_ASSETS: Record<string, ImageSourcePropType> = {
  "v-badge-black.png": require("@/assets/logos/v-badge-black.png"),
  "v-badge-black-text.png": require("@/assets/logos/v-badge-black-text.png"),
  "v-badge-black-gold.png": require("@/assets/logos/v-badge-black-gold.png"),
  "v-badge-white-gold.png": require("@/assets/logos/v-badge-white-gold.png"),
  "icon-white.png": require("@/assets/logos/icon-white.png"),
  "v-white.png": require("@/assets/logos/v-white.png"),
  "h-badge-black.png": require("@/assets/logos/h-badge-black.png"),
  "h-white.png": require("@/assets/logos/h-white.png"),
};

type GuideSection =
  | "overview"
  | "logo"
  | "colors"
  | "typography"
  | "voice"
  | "audience"
  | "patterns";

const SECTIONS: { key: GuideSection; label: string; icon: ComponentProps<typeof Feather>["name"] }[] = [
  { key: "overview", label: "Overview", icon: "compass" },
  { key: "logo", label: "Logo", icon: "hexagon" },
  { key: "colors", label: "Colors", icon: "droplet" },
  { key: "typography", label: "Type", icon: "type" },
  { key: "voice", label: "Voice", icon: "mic" },
  { key: "audience", label: "Audience", icon: "users" },
  { key: "patterns", label: "Patterns", icon: "layout" },
];

const CORE_COLORS = [
  { name: "SA Gold", hex: "#BB935B", rgb: "187, 147, 91", usage: "Accent color for highlights, calls-to-action, and key information" },
  { name: "Black", hex: "#000000", rgb: "0, 0, 0", usage: "Primary text color, dark backgrounds, headers" },
  { name: "White", hex: "#FFFFFF", rgb: "255, 255, 255", usage: "Primary background color, text on dark backgrounds" },
  { name: "Gray", hex: "#999999", rgb: "153, 153, 153", usage: "Secondary text, subtle UI elements, and borders" },
];

const UI_COLORS = [
  { name: "Background Light", hex: "#F8FAFC", usage: "App background, card backgrounds" },
  { name: "Text Secondary", hex: "#5C6B7F", usage: "Body text, descriptions" },
  { name: "Border", hex: "#E2E8F0", usage: "Card borders, dividers" },
];

const CONTRAST_PAIRS = [
  { fg: "#000000", bg: "#FFFFFF", label: "Black on White", ratio: "21.00" },
  { fg: "#FFFFFF", bg: "#000000", label: "White on Black", ratio: "21.00" },
  { fg: "#BB935B", bg: "#FFFFFF", label: "Gold on White", ratio: "3.14" },
  { fg: "#BB935B", bg: "#000000", label: "Gold on Black", ratio: "6.69" },
  { fg: "#5C6B7F", bg: "#FFFFFF", label: "Text on White", ratio: "5.44" },
];

const VOICE_ATTRIBUTES = [
  { attribute: "Empowering", description: "Gives confidence and control", example: "Take control of your financial destiny" },
  { attribute: "Supportive", description: "Acts as a partner, not a vendor", example: "Your partner in navigating the complex world of startup finance" },
  { attribute: "Honest", description: "Transparent and realistic", example: "See your financial reality clearly, not through rose-colored glasses" },
  { attribute: "Accessible", description: "No jargon, no gatekeeping", example: "Financial modeling shouldn't require a finance degree" },
  { attribute: "Action-Oriented", description: "Direct and practical", example: "Stop fighting your spreadsheet" },
  { attribute: "Builder-Centric", description: "Celebrates operators and doers", example: "Built for the operators, the visionaries, and the unsung heroes" },
];

const TONE_SPECTRUM = [
  { context: "Marketing", tone: "Confident, bold, aspirational" },
  { context: "Product UI", tone: "Clear, concise, helpful" },
  { context: "Onboarding", tone: "Warm, encouraging, guiding" },
  { context: "Error / Support", tone: "Empathetic, solution-focused" },
  { context: "Email", tone: "Personal, informative, actionable" },
];

const DO_LIST = [
  'Use "you" and "your" to create personal connection',
  "Frame problems and solutions clearly (problem \u2192 solution)",
  "Focus on benefits and outcomes (clarity, confidence, accessibility)",
  "Be empathetic about struggles while offering practical solutions",
  "Speak to the operator \u2014 the person running the business",
];

const DONT_LIST = [
  "Use finance jargon or unnecessary complexity",
  "Sound corporate, stiff, or overly formal",
  "Make promises you can't back up with the product",
  "Talk down to users or assume they lack intelligence",
  "Use passive voice when active voice is clearer",
];

const TYPE_HIERARCHY = [
  { purpose: "Title", font: "Lato", weight: "Bold Italic", size: "60px" },
  { purpose: "Subtitle", font: "Montserrat", weight: "Regular Italic", size: "24px" },
  { purpose: "Heading", font: "League Spartan", weight: "Bold (700)", size: "30px" },
  { purpose: "Subheading", font: "HK Grotesk / Inter", weight: "Regular", size: "20px" },
  { purpose: "Section Header", font: "Gotham / Montserrat", weight: "SemiBold (600)", size: "18px" },
  { purpose: "Body", font: "Montserrat", weight: "Regular", size: "16px" },
  { purpose: "Quote", font: "Lora", weight: "Italic", size: "18px" },
  { purpose: "Caption", font: "Montserrat", weight: "Regular", size: "12px" },
];

const LOGO_VARIANTS = [
  { name: "Vertical Badge (Icon Only)", description: "The standalone rocket icon badge without any text.", usage: "Compact spaces, social media profile pictures, and application icons.", lightFile: "v-badge-black.png", darkFile: "icon-white.png" },
  { name: "Vertical Badge + Wordmark (Black)", description: "The icon badge positioned above the wordmark in black.", usage: "Primary logo for most light-background applications.", lightFile: "v-badge-black-text.png", darkFile: "v-white.png" },
  { name: "Vertical Badge + Gold Wordmark", description: "The icon badge with the wordmark in Startup Anthology Gold.", usage: "Reserved for premium materials or special emphasis.", lightFile: "v-badge-black-gold.png", darkFile: "v-badge-white-gold.png" },
  { name: "Horizontal Badge + Wordmark", description: "The icon badge positioned to the left of the wordmark.", usage: "Best for wide layouts such as website headers and banners.", lightFile: "h-badge-black.png", darkFile: "h-white.png" },
];

const LOGO_RULES = [
  "Maintain clear space equal to icon height on all sides",
  "Icon minimum: 32px height",
  "Full logo minimum: 80px width (with wordmark)",
  "Use black badge on light backgrounds",
  "Use white badge on dark backgrounds",
  "Gold wordmark variant works on both light and dark",
];

const INCORRECT_USAGE = [
  "Don't stretch or distort the logo proportions",
  "Don't place on busy backgrounds without sufficient contrast",
  "Don't change logo colors outside approved variants",
  "Don't rotate or flip the logo",
  "Don't add drop shadows or effects",
  "Don't use smaller than minimum sizes",
];

const B2C_SEGMENTS = [
  { segment: "Startup Employees & Managers", needs: "Seeking insights to navigate startup culture challenges.", priority: "Primary" },
  { segment: "Aspiring Entrepreneurs", needs: "Access to community and mentorship to kickstart their journey.", priority: "Secondary" },
  { segment: "Freelancers & Contractors", needs: "Seeking networking and skill development in tech startups.", priority: "Secondary" },
];

const B2B_SEGMENTS = [
  { segment: "Entrepreneurs & Founders", needs: "Model growth, plan fundraising, and present financial projections.", priority: "Co-Primary" },
  { segment: "Angel Investors & VCs", needs: "Data-driven insights to identify promising startups for investment.", priority: "Secondary" },
];

const BRAND_PRINCIPLES = [
  { title: "Target Audience", description: "Prioritize startup employees and managers as the primary audience, with founders as a co-primary focus." },
  { title: "Brand Exclusivity", description: "All materials must exclusively feature Startup Anthology branding. Do not co-brand with other entities." },
  { title: "Strategic Use of Gold", description: "Gold should be used sparingly as an accent for CTAs and highlights. Avoid large blocks of text or backgrounds." },
  { title: "Typographic Hierarchy", description: "Consistently apply the defined typographic system to guide readers through content professionally." },
  { title: "Voice Consistency", description: "Maintain an empowering, supportive, and accessible tone across all communications." },
  { title: "Mission Alignment", description: "Document and share the stories of entrepreneurs who'd rather run their business than wrestle with complexity." },
];

const SPACING_VALUES = [4, 8, 12, 16, 20, 24, 32, 48];

const RADIUS_VALUES = [
  { label: "Small", value: "4px", usage: "" },
  { label: "Default", value: "6px", usage: "buttons, inputs" },
  { label: "Medium", value: "8px", usage: "cards" },
  { label: "Large", value: "12px", usage: "modals, panels" },
];

interface BrandGuideViewerProps {
  visible: boolean;
  onClose: () => void;
  onUseAsTemplate: () => void;
}

export default function BrandGuideViewer({ visible, onClose, onUseAsTemplate }: BrandGuideViewerProps) {
  const { colors: c } = useTheme();
  const s = useMemo(() => createS(c), [c]);
  const [activeSection, setActiveSection] = useState<GuideSection>("overview");

  const renderSectionHeader = (title: string, subtitle?: string) => (
    <View style={s.sectionHeader}>
      <View style={s.sectionHeaderBar} />
      <Text style={s.sectionHeaderLabel}>STARTUP ANTHOLOGY BRAND GUIDE</Text>
      <Text style={s.sectionHeaderTitle}>{title}</Text>
      {subtitle && <Text style={s.sectionHeaderSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderOverview = () => (
    <View style={s.content}>
      {renderSectionHeader("Brand Overview & Mission")}

      <View style={s.darkCard}>
        <Text style={s.goldLabel}>TAGLINE</Text>
        <Text style={s.heroText}>Educate. Equip. Elevate.</Text>

        <Text style={s.goldLabel}>MISSION</Text>
        <Text style={s.darkCardBody}>
          Empowering entrepreneurs and small business owners who'd rather run their business than wrestle with it. We give them the tools and knowledge to focus on growth, not complexity.
        </Text>

        <Text style={s.goldLabel}>POSITIONING</Text>
        <Text style={s.darkCardBody}>
          Championing the operators and doers who don't have time for spreadsheet headaches or financial jargon. We make professional financial tools accessible to everyone building something.
        </Text>
      </View>

      <View style={s.lightCard}>
        <Text style={s.goldLabel}>CORE MESSAGING FRAMEWORK</Text>

        <View style={s.messagingItem}>
          <Text style={s.messagingTitle}>For Entrepreneurs & Small Business Owners</Text>
          <Text style={s.messagingDesc}>Your job isn't building spreadsheets. Startup Anthology handles the financial modeling so you can focus on running your business.</Text>
        </View>

        <View style={s.messagingItem}>
          <Text style={s.messagingTitle}>For Pre-Revenue Teams</Text>
          <Text style={s.messagingDesc}>Not making money yet? Model your burn rate, runway, and projected growth before your first dollar comes in.</Text>
        </View>

        <View style={s.messagingItem}>
          <Text style={s.messagingTitle}>For Founders Raising Capital</Text>
          <Text style={s.messagingDesc}>Get investor-ready financial statements and KPIs without hiring an analyst.</Text>
        </View>
      </View>
    </View>
  );

  const renderLogo = () => (
    <View style={s.content}>
      {renderSectionHeader("Logo & Identity", "The Startup Anthology logo is available in several configurations to suit different contexts and layouts.")}

      {LOGO_VARIANTS.map((v) => (
        <View key={v.name} style={s.logoVariantCard}>
          <Text style={s.logoVariantName}>{v.name}</Text>
          <Text style={s.logoVariantDesc}>{v.description}</Text>
          <Text style={s.logoVariantUsage}>{v.usage}</Text>
          <View style={s.logoPreviewRow}>
            <View style={s.logoPreviewLight}>
              <Text style={s.logoPreviewLabel}>LIGHT</Text>
              <Image source={LOGO_ASSETS[v.lightFile]} style={s.logoImage} resizeMode="contain" />
            </View>
            <View style={s.logoPreviewDark}>
              <Text style={s.logoPreviewLabelDark}>DARK</Text>
              <Image source={LOGO_ASSETS[v.darkFile]} style={s.logoImage} resizeMode="contain" />
            </View>
          </View>
        </View>
      ))}

      <Text style={s.subsectionTitle}>Clear Space & Minimum Sizes</Text>
      <View style={s.lightCard}>
        {LOGO_RULES.map((rule) => (
          <View key={rule} style={s.ruleRow}>
            <View style={s.checkIcon}>
              <Feather name="check" size={12} color="#166534" />
            </View>
            <Text style={s.ruleText}>{rule}</Text>
          </View>
        ))}
      </View>

      <Text style={s.subsectionTitle}>Incorrect Usage</Text>
      {INCORRECT_USAGE.map((item) => (
        <View key={item} style={s.dontCard}>
          <Text style={s.dontIcon}>{"\u2717"}</Text>
          <Text style={s.dontText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  const renderColors = () => (
    <View style={s.content}>
      {renderSectionHeader("Color System")}

      <Text style={s.subsectionTitle}>Core Palette</Text>
      {CORE_COLORS.map((color) => (
        <View key={color.name} style={s.colorCard}>
          <View style={[s.colorSwatch, { backgroundColor: color.hex, borderWidth: color.hex === "#FFFFFF" ? 1 : 0, borderColor: "#E2E8F0" }]} />
          <View style={s.colorInfo}>
            <Text style={s.colorName}>{color.name}</Text>
            <Text style={s.colorHex}>{color.hex}</Text>
            <Text style={s.colorRgb}>RGB {color.rgb}</Text>
            <Text style={s.colorUsage}>{color.usage}</Text>
          </View>
        </View>
      ))}

      <Text style={s.subsectionTitle}>UI Colors</Text>
      {UI_COLORS.map((color) => (
        <View key={color.name} style={s.colorCard}>
          <View style={[s.colorSwatchSmall, { backgroundColor: color.hex, borderWidth: 1, borderColor: "#E2E8F0" }]} />
          <View style={s.colorInfo}>
            <Text style={s.colorName}>{color.name}</Text>
            <Text style={s.colorHex}>{color.hex}</Text>
            <Text style={s.colorUsage}>{color.usage}</Text>
          </View>
        </View>
      ))}

      <Text style={s.subsectionTitle}>WCAG Contrast Audit</Text>
      <View style={s.lightCard}>
        {CONTRAST_PAIRS.map((pair) => {
          const ratio = parseFloat(pair.ratio);
          const passAA = ratio >= 4.5;
          return (
            <View key={pair.label} style={s.contrastRow}>
              <View style={s.contrastPreview}>
                <View style={[s.contrastSample, { backgroundColor: pair.bg, borderWidth: pair.bg === "#FFFFFF" ? 1 : 0, borderColor: "#E2E8F0" }]}>
                  <Text style={[s.contrastSampleText, { color: pair.fg }]}>Aa</Text>
                </View>
              </View>
              <View style={s.contrastInfo}>
                <Text style={s.contrastLabel}>{pair.label}</Text>
                <Text style={s.contrastRatio}>{pair.ratio}:1</Text>
              </View>
              <View style={[s.contrastBadge, { backgroundColor: passAA ? "#F0FDF4" : "#FEF2F2" }]}>
                <Text style={[s.contrastBadgeText, { color: passAA ? "#166534" : "#991B1B" }]}>{passAA ? "AA Pass" : "AA Fail"}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={s.subsectionTitle}>Color Guidelines</Text>
      <View style={s.doCard}>
        <Text style={s.doCardText}>Use gold sparingly as an accent for CTAs and highlights</Text>
      </View>
      <View style={s.doCard}>
        <Text style={s.doCardText}>Use black badge on light backgrounds, white badge on dark</Text>
      </View>
      <View style={s.dontCardFull}>
        <Text style={s.dontCardFullText}>Don't use gold for large blocks of text or backgrounds</Text>
      </View>
    </View>
  );

  const TYPE_SAMPLES: Record<string, string> = {
    "Title": "Financial Modeling, Without the Spreadsheets",
    "Subtitle": "The tool for people who'd rather run their business",
    "Heading": "Built for Every Business Model",
    "Subheading": "Custom Revenue Models That Match Your Business",
    "Section Header": "BETA ACCESS \u2014 $25/MONTH",
    "Body": "Startup Anthology handles the financial modeling so you can focus on running your business.",
    "Quote": "\u201CSee your financial reality clearly, not through rose-colored glasses\u201D",
    "Caption": "Limited slots available. Cancel anytime.",
  };

  const TYPE_SAMPLE_STYLES: Record<string, { fontSize: number; fontFamily: string; fontStyle?: "italic" | "normal" }> = {
    "Title": { fontSize: 28, fontFamily: fonts.bold, fontStyle: "italic" },
    "Subtitle": { fontSize: 18, fontFamily: fonts.regular, fontStyle: "italic" },
    "Heading": { fontSize: 22, fontFamily: fonts.bold },
    "Subheading": { fontSize: 17, fontFamily: fonts.regular },
    "Section Header": { fontSize: 15, fontFamily: fonts.semibold },
    "Body": { fontSize: 14, fontFamily: fonts.regular },
    "Quote": { fontSize: 15, fontFamily: fonts.regular, fontStyle: "italic" },
    "Caption": { fontSize: 11, fontFamily: fonts.regular },
  };

  const renderTypography = () => (
    <View style={s.content}>
      {renderSectionHeader("Typography", "Our typographic system creates clear hierarchy, improves readability, and adds visual interest.")}

      {TYPE_HIERARCHY.map((t) => {
        const sampleStyle = TYPE_SAMPLE_STYLES[t.purpose] || { fontSize: 14, fontFamily: fonts.regular };
        return (
          <View key={t.purpose} style={s.typeCard}>
            <View style={s.typeCardHeader}>
              <Text style={s.typePurpose}>{t.purpose}</Text>
              <Text style={s.typeFont}>{t.font}</Text>
            </View>
            <View style={s.typeCardMeta}>
              <View style={s.typeBadge}>
                <Text style={s.typeBadgeText}>{t.weight}</Text>
              </View>
              <Text style={s.typeSize}>{t.size}</Text>
            </View>
            <View style={s.typeSampleWrap}>
              <Text style={[s.typeSampleText, { fontSize: sampleStyle.fontSize, fontFamily: sampleStyle.fontFamily, fontStyle: sampleStyle.fontStyle || "normal" }]}>
                {TYPE_SAMPLES[t.purpose]}
              </Text>
            </View>
          </View>
        );
      })}

      <Text style={s.subsectionTitle}>Font Pairing Rationale</Text>
      <View style={s.lightCard}>
        <Text style={s.pairingText}><Text style={s.pairingBold}>League Spartan</Text> provides bold, geometric headings that command attention.</Text>
        <Text style={s.pairingText}><Text style={s.pairingBold}>Lato</Text> serves as the title font with bold italic styling for hero sections.</Text>
        <Text style={s.pairingText}><Text style={s.pairingBold}>Montserrat</Text> is the primary body font for subtitles, body text, and captions.</Text>
        <Text style={s.pairingText}><Text style={s.pairingBold}>Lora</Text> adds editorial warmth for quotes and pull-quotes.</Text>
      </View>

      <Text style={s.subsectionTitle}>Font Licensing</Text>
      <View style={s.licenseBadgeRow}>
        <View style={s.licenseFree}>
          <Text style={s.licenseFreeText}>Free</Text>
        </View>
        <Text style={s.licenseDesc}>League Spartan, Lato, Montserrat, Lora, Hanken Grotesk (Google Fonts / OFL)</Text>
      </View>
      <View style={s.licenseBadgeRow}>
        <View style={s.licensePaid}>
          <Text style={s.licensePaidText}>Licensed</Text>
        </View>
        <Text style={s.licenseDesc}>HK Grotesk, Gotham (fallbacks: Inter, Montserrat)</Text>
      </View>
    </View>
  );

  const renderVoice = () => (
    <View style={s.content}>
      {renderSectionHeader("Brand Voice", "How we sound across every touchpoint.")}

      <Text style={s.subsectionTitle}>Voice Characteristics</Text>
      {VOICE_ATTRIBUTES.map((v) => (
        <View key={v.attribute} style={s.voiceCard}>
          <Text style={s.voiceAttribute}>{v.attribute}</Text>
          <Text style={s.voiceDesc}>{v.description}</Text>
          <Text style={s.voiceExample}>"{v.example}"</Text>
        </View>
      ))}

      <Text style={s.subsectionTitle}>Tone Spectrum</Text>
      {TONE_SPECTRUM.map((t) => (
        <View key={t.context} style={s.toneRow}>
          <Text style={s.toneContext}>{t.context}</Text>
          <Text style={s.toneTone}>{t.tone}</Text>
        </View>
      ))}

      <Text style={s.subsectionTitle}>Do</Text>
      {DO_LIST.map((item) => (
        <View key={item} style={s.doCard}>
          <Text style={s.doCardText}>{item}</Text>
        </View>
      ))}

      <Text style={s.subsectionTitle}>Don't</Text>
      {DONT_LIST.map((item) => (
        <View key={item} style={s.dontCardFull}>
          <Text style={s.dontCardFullText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  const renderAudience = () => (
    <View style={s.content}>
      {renderSectionHeader("Audience & Positioning")}

      <Text style={s.subsectionTitle}>B2C Segments</Text>
      {B2C_SEGMENTS.map((seg) => (
        <View key={seg.segment} style={s.segmentCard}>
          <View style={s.segmentHeader}>
            <Text style={s.segmentName}>{seg.segment}</Text>
            <View style={[s.priorityBadge, seg.priority === "Primary" && s.priorityPrimary]}>
              <Text style={[s.priorityText, seg.priority === "Primary" && s.priorityTextPrimary]}>{seg.priority}</Text>
            </View>
          </View>
          <Text style={s.segmentNeeds}>{seg.needs}</Text>
        </View>
      ))}

      <Text style={s.subsectionTitle}>B2B Segments</Text>
      {B2B_SEGMENTS.map((seg) => (
        <View key={seg.segment} style={s.segmentCard}>
          <View style={s.segmentHeader}>
            <Text style={s.segmentName}>{seg.segment}</Text>
            <View style={[s.priorityBadge, seg.priority === "Co-Primary" && s.priorityPrimary]}>
              <Text style={[s.priorityText, seg.priority === "Co-Primary" && s.priorityTextPrimary]}>{seg.priority}</Text>
            </View>
          </View>
          <Text style={s.segmentNeeds}>{seg.needs}</Text>
        </View>
      ))}

      <Text style={s.subsectionTitle}>Brand Focus Principles</Text>
      {BRAND_PRINCIPLES.map((p, i) => (
        <View key={p.title} style={s.principleCard}>
          <View style={s.principleNumber}>
            <Text style={s.principleNumberText}>{i + 1}</Text>
          </View>
          <View style={s.principleContent}>
            <Text style={s.principleTitle}>{p.title}</Text>
            <Text style={s.principleDesc}>{p.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderPatterns = () => (
    <View style={s.content}>
      {renderSectionHeader("Design Patterns", "Component patterns and brand application examples.")}

      <Text style={s.subsectionTitle}>Button Styles</Text>
      <View style={s.lightCard}>
        <Text style={s.patternLabel}>PRIMARY</Text>
        <View style={s.buttonPrimary}>
          <Text style={s.buttonPrimaryText}>Join the Beta - $25/mo</Text>
        </View>
        <Text style={s.patternSpec}>bg: #BB935B, text: #FFF, radius: 6px</Text>

        <Text style={[s.patternLabel, { marginTop: 16 }]}>SECONDARY</Text>
        <View style={s.buttonSecondary}>
          <Text style={s.buttonSecondaryText}>See Live Demo</Text>
        </View>
        <Text style={s.patternSpec}>bg: #F7F9FA, border: #DFE1E3, radius: 6px</Text>
      </View>

      <Text style={s.subsectionTitle}>Spacing System</Text>
      <View style={s.lightCard}>
        {SPACING_VALUES.map((size) => (
          <View key={size} style={s.spacingRow}>
            <Text style={s.spacingLabel}>{size}px</Text>
            <View style={[s.spacingBar, { width: size * 3, opacity: 0.6 + size / 80 }]} />
          </View>
        ))}
        <Text style={s.patternSpec}>Base unit: 4px. All spacing in multiples of 4.</Text>
      </View>

      <Text style={s.subsectionTitle}>Border Radius</Text>
      <View style={s.lightCard}>
        {RADIUS_VALUES.map((r) => (
          <View key={r.label} style={s.radiusRow}>
            <View style={[s.radiusPreview, { borderRadius: parseInt(r.value) }]} />
            <View>
              <Text style={s.radiusLabel}>{r.label}</Text>
              <Text style={s.radiusValue}>{r.value}{r.usage ? ` (${r.usage})` : ""}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={s.subsectionTitle}>Design Tokens</Text>
      <View style={s.codeBlock}>
        <Text style={s.codeText}>{`--sa-gold: #BB935B
--sa-dark-navy: #000000
--sa-white: #FFFFFF
--sa-gray: #999999
--sa-bg-light: #F8FAFC
--sa-text-secondary: #5C6B7F
--sa-border: #E2E8F0
--sa-font-heading: League Spartan
--sa-font-body: Hanken Grotesk
--sa-font-title: Lato
--sa-font-quote: Lora`}</Text>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview": return renderOverview();
      case "logo": return renderLogo();
      case "colors": return renderColors();
      case "typography": return renderTypography();
      case "voice": return renderVoice();
      case "audience": return renderAudience();
      case "patterns": return renderPatterns();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose} onShow={() => setActiveSection("overview")}>
      <View style={s.container}>
        <View style={s.header}>
          <Pressable onPress={onClose} style={s.closeBtn}>
            <Feather name="x" size={20} color={c.text} />
          </Pressable>
          <View style={s.headerCenter}>
            <MaterialCommunityIcons name="book-open-variant" size={18} color={c.tint} />
            <Text style={s.headerTitle}>Brand Guide</Text>
          </View>
          <Pressable onPress={onUseAsTemplate} style={s.templateBtn}>
            <Feather name="copy" size={14} color={c.tint} />
            <Text style={s.templateBtnText}>Use as Template</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.navBar} contentContainerStyle={s.navBarContent}>
          {SECTIONS.map((section) => (
            <Pressable
              key={section.key}
              style={[s.navItem, activeSection === section.key && s.navItemActive]}
              onPress={() => setActiveSection(section.key)}
            >
              <Feather name={section.icon} size={12} color={activeSection === section.key ? c.background : c.textSecondary} />
              <Text style={[s.navItemText, activeSection === section.key && s.navItemTextActive]}>{section.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView style={s.body} contentContainerStyle={s.bodyContent} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>
      </View>
    </Modal>
  );
}

const createS = (c: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  closeBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  headerTitle: { fontFamily: fonts.semibold, fontSize: 16, color: c.text },
  templateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: c.tint + "20",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  templateBtnText: { fontFamily: fonts.medium, fontSize: 11, color: c.tint },
  navBar: { borderBottomWidth: 1, borderBottomColor: c.border, maxHeight: 44 },
  navBarContent: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: "center", paddingVertical: 6 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  navItemActive: { backgroundColor: c.tint },
  navItemText: { fontFamily: fonts.medium, fontSize: 12, color: c.textSecondary },
  navItemTextActive: { color: c.background },
  body: { flex: 1 },
  bodyContent: { paddingBottom: 60 },
  content: { padding: spacing.xl },

  sectionHeader: { marginBottom: spacing.xxl },
  sectionHeaderBar: { width: 48, height: 3, backgroundColor: c.tint, marginBottom: spacing.md, borderRadius: 2 },
  sectionHeaderLabel: { fontFamily: fonts.semibold, fontSize: 10, color: c.tint, letterSpacing: 2, marginBottom: spacing.xs },
  sectionHeaderTitle: { fontFamily: fonts.bold, fontSize: 24, color: c.text, lineHeight: 28 },
  sectionHeaderSubtitle: { fontFamily: fonts.regular, fontSize: 13, color: c.textSecondary, marginTop: spacing.sm, lineHeight: 18 },

  darkCard: {
    backgroundColor: "#0A0A0A",
    borderRadius: radius.lg,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: c.border,
  },
  goldLabel: { fontFamily: fonts.bold, fontSize: 10, color: c.tint, letterSpacing: 2, marginBottom: spacing.sm, marginTop: spacing.lg },
  heroText: { fontFamily: fonts.bold, fontSize: 26, color: c.text, lineHeight: 32, marginBottom: spacing.sm },
  darkCardBody: { fontFamily: fonts.regular, fontSize: 14, color: "#E2E8F0", lineHeight: 22 },

  lightCard: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: c.border,
  },
  messagingItem: { marginBottom: spacing.lg },
  messagingTitle: { fontFamily: fonts.semibold, fontSize: 14, color: c.text, marginBottom: 2 },
  messagingDesc: { fontFamily: fonts.regular, fontSize: 13, color: c.textSecondary, lineHeight: 18 },

  subsectionTitle: { fontFamily: fonts.semibold, fontSize: 16, color: c.text, marginBottom: spacing.md, marginTop: spacing.lg },

  logoVariantCard: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
  },
  logoVariantName: { fontFamily: fonts.semibold, fontSize: 15, color: c.text, marginBottom: 4 },
  logoVariantDesc: { fontFamily: fonts.regular, fontSize: 13, color: c.textSecondary, lineHeight: 18, marginBottom: 4 },
  logoVariantUsage: { fontFamily: fonts.medium, fontSize: 12, color: c.tint },
  logoPreviewRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  logoPreviewLight: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  logoPreviewDark: {
    flex: 1,
    backgroundColor: "#000000",
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  logoPreviewLabel: { fontFamily: fonts.medium, fontSize: 9, color: "#999999", letterSpacing: 1, marginBottom: spacing.sm },
  logoPreviewLabelDark: { fontFamily: fonts.medium, fontSize: 9, color: "#666666", letterSpacing: 1, marginBottom: spacing.sm },
  logoImage: { width: 100, height: 50 },

  ruleRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: spacing.sm },
  checkIcon: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center", marginTop: 1,
  },
  ruleText: { fontFamily: fonts.regular, fontSize: 13, color: c.textSecondary, flex: 1, lineHeight: 18 },

  dontCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#1A0505",
    borderWidth: 1,
    borderColor: "#3D1010",
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  dontIcon: { fontSize: 14, color: "#EF4444", marginTop: 1 },
  dontText: { fontFamily: fonts.regular, fontSize: 13, color: "#FCA5A5", flex: 1, lineHeight: 18 },

  colorCard: {
    flexDirection: "row",
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
    gap: spacing.md,
  },
  colorSwatch: { width: 56, height: 56, borderRadius: radius.sm },
  colorSwatchSmall: { width: 40, height: 40, borderRadius: radius.sm },
  colorInfo: { flex: 1 },
  colorName: { fontFamily: fonts.semibold, fontSize: 14, color: c.text },
  colorHex: { fontFamily: fonts.regular, fontSize: 12, color: c.textSecondary },
  colorRgb: { fontFamily: fonts.regular, fontSize: 11, color: c.textMuted },
  colorUsage: { fontFamily: fonts.regular, fontSize: 11, color: c.textSecondary, marginTop: 4, lineHeight: 15 },

  contrastRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  contrastPreview: {},
  contrastSample: { width: 36, height: 36, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  contrastSampleText: { fontFamily: fonts.bold, fontSize: 14 },
  contrastInfo: { flex: 1 },
  contrastLabel: { fontFamily: fonts.medium, fontSize: 13, color: c.text },
  contrastRatio: { fontFamily: fonts.regular, fontSize: 11, color: c.textSecondary },
  contrastBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: 4 },
  contrastBadgeText: { fontFamily: fonts.semibold, fontSize: 10 },

  doCard: {
    backgroundColor: "#051A0D",
    borderWidth: 1,
    borderColor: "#0F3D1F",
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  doCardText: { fontFamily: fonts.regular, fontSize: 13, color: "#86EFAC", lineHeight: 18 },
  dontCardFull: {
    backgroundColor: "#1A0505",
    borderWidth: 1,
    borderColor: "#3D1010",
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  dontCardFullText: { fontFamily: fonts.regular, fontSize: 13, color: "#FCA5A5", lineHeight: 18 },

  typeCard: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
  },
  typeCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  typePurpose: { fontFamily: fonts.semibold, fontSize: 14, color: c.tint },
  typeFont: { fontFamily: fonts.regular, fontSize: 12, color: c.textSecondary },
  typeCardMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  typeBadge: { backgroundColor: c.border, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 4 },
  typeBadgeText: { fontFamily: fonts.regular, fontSize: 10, color: c.textSecondary },
  typeSize: { fontFamily: fonts.regular, fontSize: 11, color: c.textMuted },
  typeSampleWrap: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  typeSampleText: { color: c.text, lineHeight: 32 },

  pairingText: { fontFamily: fonts.regular, fontSize: 13, color: c.textSecondary, lineHeight: 20, marginBottom: spacing.sm },
  pairingBold: { fontFamily: fonts.semibold, color: c.text },

  licenseBadgeRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: spacing.sm },
  licenseFree: { backgroundColor: "#051A0D", paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 4 },
  licenseFreeText: { fontFamily: fonts.semibold, fontSize: 10, color: "#86EFAC" },
  licensePaid: { backgroundColor: "#1A1505", paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 4 },
  licensePaidText: { fontFamily: fonts.semibold, fontSize: 10, color: "#FCD34D" },
  licenseDesc: { fontFamily: fonts.regular, fontSize: 12, color: c.textSecondary, flex: 1, lineHeight: 16 },

  voiceCard: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
  },
  voiceAttribute: { fontFamily: fonts.semibold, fontSize: 16, color: c.tint, marginBottom: 4 },
  voiceDesc: { fontFamily: fonts.regular, fontSize: 13, color: c.textSecondary, marginBottom: spacing.sm },
  voiceExample: { fontFamily: fonts.regular, fontSize: 13, color: c.text, fontStyle: "italic", lineHeight: 18 },

  toneRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: c.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: c.border,
  },
  toneContext: { fontFamily: fonts.semibold, fontSize: 13, color: c.text },
  toneTone: { fontFamily: fonts.regular, fontSize: 12, color: c.textSecondary, flex: 1, textAlign: "right" },

  segmentCard: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
  },
  segmentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  segmentName: { fontFamily: fonts.semibold, fontSize: 14, color: c.text, flex: 1 },
  priorityBadge: { backgroundColor: c.border, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: 4 },
  priorityPrimary: { backgroundColor: c.tint },
  priorityText: { fontFamily: fonts.semibold, fontSize: 10, color: c.textSecondary },
  priorityTextPrimary: { color: "#FFFFFF" },
  segmentNeeds: { fontFamily: fonts.regular, fontSize: 13, color: c.textSecondary, lineHeight: 18 },

  principleCard: {
    flexDirection: "row",
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
    gap: spacing.md,
  },
  principleNumber: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: c.tint, alignItems: "center", justifyContent: "center",
  },
  principleNumberText: { fontFamily: fonts.bold, fontSize: 13, color: "#FFFFFF" },
  principleContent: { flex: 1 },
  principleTitle: { fontFamily: fonts.semibold, fontSize: 14, color: c.text, marginBottom: 4 },
  principleDesc: { fontFamily: fonts.regular, fontSize: 12, color: c.textSecondary, lineHeight: 17 },

  patternLabel: { fontFamily: fonts.medium, fontSize: 10, color: c.textMuted, letterSpacing: 1, marginBottom: 6 },
  buttonPrimary: {
    backgroundColor: "#BB935B",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 4,
  },
  buttonPrimaryText: { fontFamily: fonts.semibold, fontSize: 14, color: "#FFFFFF" },
  buttonSecondary: {
    backgroundColor: "#1A1A1A",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 4,
  },
  buttonSecondaryText: { fontFamily: fonts.semibold, fontSize: 14, color: c.text },
  patternSpec: { fontFamily: fonts.regular, fontSize: 10, color: c.textMuted, marginTop: 2 },

  spacingRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm },
  spacingLabel: { fontFamily: fonts.regular, fontSize: 12, color: c.textSecondary, width: 36, textAlign: "right" },
  spacingBar: { height: 12, backgroundColor: c.tint, borderRadius: 2 },

  radiusRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  radiusPreview: { width: 40, height: 40, backgroundColor: c.border, borderWidth: 1, borderColor: c.textMuted },
  radiusLabel: { fontFamily: fonts.semibold, fontSize: 13, color: c.text },
  radiusValue: { fontFamily: fonts.regular, fontSize: 11, color: c.textSecondary },

  codeBlock: {
    backgroundColor: "#0A0A0A",
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: c.border,
  },
  codeText: { fontFamily: fonts.regular, fontSize: 11, color: "#E2E8F0", lineHeight: 20 },
});
