import json
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfgen import canvas as pdfcanvas

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(SCRIPT_DIR, "brand_data.json"), "r") as f:
    BRAND = json.load(f)

SA_GOLD = HexColor(BRAND["palette"]["SA Gold"])
SA_BLACK = HexColor(BRAND["palette"]["Black"])
SA_WHITE = HexColor(BRAND["palette"]["White"])
SA_GRAY = HexColor("#999999")
SA_LIGHT_BG = HexColor(BRAND["palette"]["Gray 100"])
SA_BORDER = HexColor(BRAND["palette"]["Gray 200"])
SA_TEXT_SEC = HexColor("#5C6B7F")
SA_GREEN = HexColor("#166534")
SA_RED = HexColor("#991B1B")

WIDTH, HEIGHT = letter

styles = {
    "title": ParagraphStyle("title", fontName="Helvetica-Bold", fontSize=28, leading=34, textColor=SA_BLACK),
    "heading": ParagraphStyle("heading", fontName="Helvetica-Bold", fontSize=20, leading=26, textColor=SA_BLACK, spaceBefore=16),
    "subheading": ParagraphStyle("subheading", fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=SA_BLACK, spaceBefore=10),
    "body": ParagraphStyle("body", fontName="Helvetica", fontSize=11, leading=16, textColor=SA_TEXT_SEC),
    "body_bold": ParagraphStyle("body_bold", fontName="Helvetica-Bold", fontSize=11, leading=16, textColor=SA_BLACK),
    "small": ParagraphStyle("small", fontName="Helvetica", fontSize=9, leading=13, textColor=SA_GRAY),
    "gold_label": ParagraphStyle("gold_label", fontName="Helvetica-Bold", fontSize=10, leading=14, textColor=SA_GOLD),
    "tagline": ParagraphStyle("tagline", fontName="Helvetica-Bold", fontSize=22, leading=28, textColor=SA_WHITE),
    "cover_sub": ParagraphStyle("cover_sub", fontName="Helvetica", fontSize=12, leading=16, textColor=HexColor("#E2E8F0")),
}


class BrandPDF:
    def __init__(self, filename):
        self.filename = filename
        self.story = []

    def _gold_rule(self):
        t = Table([[""]],colWidths=[6.5*inch], rowHeights=[3])
        t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),SA_GOLD),("LINEBELOW",(0,0),(-1,-1),0,SA_GOLD)]))
        self.story.append(t)
        self.story.append(Spacer(1,12))

    def _section_header(self, text):
        self.story.append(Paragraph(text, styles["heading"]))
        self._gold_rule()

    def cover_page(self):
        self.story.append(Spacer(1, 2*inch))
        cover_title = ParagraphStyle("ct", fontName="Helvetica-Bold", fontSize=36, leading=44, textColor=SA_BLACK, alignment=TA_CENTER)
        self.story.append(Paragraph("STARTUP ANTHOLOGY", cover_title))
        self.story.append(Spacer(1, 8))
        cover_sub = ParagraphStyle("cs", fontName="Helvetica-Bold", fontSize=18, leading=24, textColor=SA_GOLD, alignment=TA_CENTER)
        self.story.append(Paragraph("Brand Identity Guide", cover_sub))
        self.story.append(Spacer(1, 24))
        tagline = ParagraphStyle("tg", fontName="Helvetica-Bold", fontSize=14, leading=20, textColor=SA_TEXT_SEC, alignment=TA_CENTER)
        self.story.append(Paragraph("Educate. Equip. Elevate.", tagline))
        self.story.append(Spacer(1, 2*inch))
        date_style = ParagraphStyle("dt", fontName="Helvetica", fontSize=10, leading=14, textColor=SA_GRAY, alignment=TA_CENTER)
        self.story.append(Paragraph("Comprehensive Brand Analysis &amp; Style Guide", date_style))
        self.story.append(PageBreak())

    def executive_summary(self):
        self._section_header("Executive Summary")
        self.story.append(Paragraph(
            "This brand guide documents the complete visual and verbal identity system for Startup Anthology. "
            "It covers the color palette, typography specimen, logo identity and usage guidelines, brand voice and tone, "
            "audience positioning, and brand applications. All stakeholders should reference this document to ensure "
            "consistency across every touchpoint.",
            styles["body"]
        ))
        self.story.append(Spacer(1,12))

        summary_data = [
            ["Brand Name", "Startup Anthology"],
            ["Tagline", "Educate. Equip. Elevate."],
            ["Primary Color", "SA Gold #BB935B"],
            ["Background", "Black #000000 / White #FFFFFF"],
            ["Primary Typeface", "League Spartan (headings), Montserrat (body)"],
            ["Tone", "Empowering, Supportive, Honest, Accessible"],
            ["Primary Audience", "Startup Employees &amp; Managers"],
            ["Co-Primary Audience", "Entrepreneurs &amp; Founders"],
        ]
        t = Table(summary_data, colWidths=[2*inch, 4.5*inch])
        t.setStyle(TableStyle([
            ("FONTNAME",(0,0),(0,-1),"Helvetica-Bold"),
            ("FONTNAME",(1,0),(1,-1),"Helvetica"),
            ("FONTSIZE",(0,0),(-1,-1),10),
            ("TEXTCOLOR",(0,0),(0,-1),SA_BLACK),
            ("TEXTCOLOR",(1,0),(1,-1),SA_TEXT_SEC),
            ("BOTTOMPADDING",(0,0),(-1,-1),8),
            ("TOPPADDING",(0,0),(-1,-1),8),
            ("LINEBELOW",(0,0),(-1,-2),0.5,SA_BORDER),
            ("VALIGN",(0,0),(-1,-1),"TOP"),
        ]))
        self.story.append(t)
        self.story.append(PageBreak())

    def color_system(self):
        self._section_header("Color System")
        self.story.append(Paragraph("Core Palette", styles["subheading"]))
        self.story.append(Spacer(1,8))

        core_colors = [
            ("SA Gold", "#BB935B", "187, 147, 91", "Accent color for highlights, CTAs, and key information"),
            ("Black", "#000000", "0, 0, 0", "Primary text color, dark backgrounds, headers"),
            ("White", "#FFFFFF", "255, 255, 255", "Primary background color, text on dark backgrounds"),
            ("Gray", "#999999", "153, 153, 153", "Secondary text, subtle UI elements, and borders"),
        ]

        color_data = [
            [Paragraph("<b>Name</b>", styles["body_bold"]),
             Paragraph("<b>Hex</b>", styles["body_bold"]),
             Paragraph("<b>RGB</b>", styles["body_bold"]),
             Paragraph("<b>Swatch</b>", styles["body_bold"]),
             Paragraph("<b>Usage</b>", styles["body_bold"])]
        ]
        for name, hexv, rgb, usage in core_colors:
            color_data.append([
                Paragraph(name, styles["body"]),
                Paragraph(hexv, styles["small"]),
                Paragraph(rgb, styles["small"]),
                "",
                Paragraph(usage, styles["small"]),
            ])
        t = Table(color_data, colWidths=[1.1*inch, 0.9*inch, 1.1*inch, 0.6*inch, 2.8*inch])
        ts = [
            ("FONTSIZE",(0,0),(-1,-1),10),
            ("BOTTOMPADDING",(0,0),(-1,-1),8),
            ("TOPPADDING",(0,0),(-1,-1),8),
            ("LINEBELOW",(0,0),(-1,0),1,SA_BLACK),
            ("LINEBELOW",(0,1),(-1,-1),0.5,SA_BORDER),
            ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ]
        for i, (_, hexv, _, _) in enumerate(core_colors):
            ts.append(("BACKGROUND",(3,i+1),(3,i+1),HexColor(hexv)))
            if hexv == "#FFFFFF":
                ts.append(("BOX",(3,i+1),(3,i+1),0.5,SA_BORDER))
        t.setStyle(TableStyle(ts))
        self.story.append(t)
        self.story.append(Spacer(1,16))

        self.story.append(Paragraph("UI Colors", styles["subheading"]))
        self.story.append(Spacer(1,6))
        ui_colors = [
            ("Background Light", "#F8FAFC", "App background, card backgrounds"),
            ("Text Secondary", "#5C6B7F", "Body text, descriptions"),
            ("Border", "#E2E8F0", "Card borders, dividers"),
        ]
        ui_data = [
            [Paragraph("<b>Name</b>", styles["body_bold"]),
             Paragraph("<b>Hex</b>", styles["body_bold"]),
             Paragraph("<b>Swatch</b>", styles["body_bold"]),
             Paragraph("<b>Usage</b>", styles["body_bold"])]
        ]
        for name, hexv, usage in ui_colors:
            ui_data.append([
                Paragraph(name, styles["body"]),
                Paragraph(hexv, styles["small"]),
                "",
                Paragraph(usage, styles["small"]),
            ])
        t = Table(ui_data, colWidths=[1.5*inch, 1*inch, 0.6*inch, 3.4*inch])
        ts2 = [
            ("BOTTOMPADDING",(0,0),(-1,-1),6),
            ("TOPPADDING",(0,0),(-1,-1),6),
            ("LINEBELOW",(0,0),(-1,0),1,SA_BLACK),
            ("LINEBELOW",(0,1),(-1,-1),0.5,SA_BORDER),
            ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ]
        for i, (_, hexv, _) in enumerate(ui_colors):
            ts2.append(("BACKGROUND",(2,i+1),(2,i+1),HexColor(hexv)))
            ts2.append(("BOX",(2,i+1),(2,i+1),0.5,SA_BORDER))
        t.setStyle(TableStyle(ts2))
        self.story.append(t)
        self.story.append(Spacer(1,16))

        self.story.append(Paragraph("WCAG Contrast Audit", styles["subheading"]))
        self.story.append(Spacer(1,6))

        def rel_lum(hex_color):
            r = int(hex_color[1:3], 16) / 255
            g = int(hex_color[3:5], 16) / 255
            b = int(hex_color[5:7], 16) / 255
            rs = r / 12.92 if r <= 0.03928 else ((r + 0.055) / 1.055) ** 2.4
            gs = g / 12.92 if g <= 0.03928 else ((g + 0.055) / 1.055) ** 2.4
            bs = b / 12.92 if b <= 0.03928 else ((b + 0.055) / 1.055) ** 2.4
            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs

        def contrast(c1, c2):
            l1 = rel_lum(c1)
            l2 = rel_lum(c2)
            lighter = max(l1, l2)
            darker = min(l1, l2)
            return (lighter + 0.05) / (darker + 0.05)

        pairs = [
            ("#000000", "#FFFFFF", "Black on White"),
            ("#FFFFFF", "#000000", "White on Black"),
            ("#BB935B", "#FFFFFF", "Gold on White"),
            ("#BB935B", "#000000", "Gold on Black"),
            ("#FFFFFF", "#BB935B", "White on Gold"),
            ("#000000", "#BB935B", "Black on Gold"),
            ("#5C6B7F", "#FFFFFF", "Text on White"),
            ("#999999", "#FFFFFF", "Gray on White"),
        ]

        contrast_data = [
            [Paragraph("<b>Combination</b>", styles["body_bold"]),
             Paragraph("<b>Ratio</b>", styles["body_bold"]),
             Paragraph("<b>AA Normal</b>", styles["body_bold"]),
             Paragraph("<b>AA Large</b>", styles["body_bold"])]
        ]
        for fg, bg, label in pairs:
            ratio = contrast(fg, bg)
            aa_normal = ratio >= 4.5
            aa_large = ratio >= 3.0
            contrast_data.append([
                Paragraph(label, styles["body"]),
                Paragraph(f"{ratio:.2f}:1", styles["small"]),
                Paragraph("Pass" if aa_normal else "Fail",
                          ParagraphStyle("r", fontName="Helvetica-Bold", fontSize=10, textColor=SA_GREEN if aa_normal else SA_RED)),
                Paragraph("Pass" if aa_large else "Fail",
                          ParagraphStyle("r2", fontName="Helvetica-Bold", fontSize=10, textColor=SA_GREEN if aa_large else SA_RED)),
            ])
        t = Table(contrast_data, colWidths=[2.5*inch, 1.2*inch, 1.4*inch, 1.4*inch])
        t.setStyle(TableStyle([
            ("BOTTOMPADDING",(0,0),(-1,-1),6),
            ("TOPPADDING",(0,0),(-1,-1),6),
            ("LINEBELOW",(0,0),(-1,0),1,SA_BLACK),
            ("LINEBELOW",(0,1),(-1,-1),0.5,SA_BORDER),
            ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
            ("BACKGROUND",(0,0),(-1,0),SA_BLACK),
            ("TEXTCOLOR",(0,0),(-1,0),SA_WHITE),
        ]))
        self.story.append(t)
        self.story.append(Spacer(1,16))

        self.story.append(Paragraph("Color Guidelines", styles["subheading"]))
        self.story.append(Spacer(1,6))
        dos = [
            "Use gold sparingly as an accent for CTAs and highlights",
            "Use black badge on light backgrounds, white badge on dark",
        ]
        donts = [
            "Don't use gold for large blocks of text or backgrounds",
            "Use pure black (#000000) for dark backgrounds and headers",
        ]
        for d in dos:
            self.story.append(Paragraph(f'<font color="#166534">\u2713 {d}</font>', styles["body"]))
        for d in donts:
            self.story.append(Paragraph(f'<font color="#991B1B">\u2717 {d}</font>', styles["body"]))

        self.story.append(PageBreak())

    def typography(self):
        self._section_header("Typography Specimen")
        self.story.append(Paragraph(
            "Our typographic system creates clear hierarchy, improves readability, and adds visual interest. "
            "Each typeface has a specific role for consistent, professional appearance.",
            styles["body"]
        ))
        self.story.append(Spacer(1,12))

        type_hierarchy = [
            ("Title", "Lato", "Bold Italic", "60px", "1.1", "Google Fonts"),
            ("Subtitle", "Montserrat", "Regular Italic", "24px", "1.3", "Google Fonts"),
            ("Heading", "League Spartan", "Regular (700)", "30px", "1.2", "Google Fonts"),
            ("Subheading", "HK Grotesk / Inter", "Regular", "20px", "1.4", "Google / Fallback"),
            ("Section Header", "Gotham / Montserrat", "Regular (600)", "18px", "1.4", "Adobe / Fallback"),
            ("Body", "Montserrat", "Regular", "16px", "1.6", "Google Fonts"),
            ("Quote", "Lora", "Italic", "18px", "1.6", "Google Fonts"),
            ("Caption", "Montserrat", "Regular", "12px", "1.4", "Google Fonts"),
        ]

        type_data = [
            [Paragraph("<b>Purpose</b>", styles["body_bold"]),
             Paragraph("<b>Typeface</b>", styles["body_bold"]),
             Paragraph("<b>Weight / Style</b>", styles["body_bold"]),
             Paragraph("<b>Size</b>", styles["body_bold"]),
             Paragraph("<b>Line Height</b>", styles["body_bold"]),
             Paragraph("<b>Source</b>", styles["body_bold"])]
        ]
        for purpose, font, weight, size, lh, source in type_hierarchy:
            type_data.append([
                Paragraph(f"<b>{purpose}</b>", styles["body"]),
                Paragraph(font, styles["body"]),
                Paragraph(weight, styles["small"]),
                Paragraph(size, styles["small"]),
                Paragraph(lh, styles["small"]),
                Paragraph(source, styles["small"]),
            ])
        t = Table(type_data, colWidths=[1*inch, 1.3*inch, 1.1*inch, 0.7*inch, 0.8*inch, 1.1*inch])
        t.setStyle(TableStyle([
            ("BOTTOMPADDING",(0,0),(-1,-1),6),
            ("TOPPADDING",(0,0),(-1,-1),6),
            ("LINEBELOW",(0,0),(-1,0),1,SA_BLACK),
            ("LINEBELOW",(0,1),(-1,-1),0.5,SA_BORDER),
            ("BACKGROUND",(0,0),(-1,0),SA_BLACK),
            ("TEXTCOLOR",(0,0),(-1,0),SA_WHITE),
            ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ]))
        self.story.append(t)
        self.story.append(Spacer(1,16))

        self.story.append(Paragraph("Font Pairing Rationale", styles["subheading"]))
        self.story.append(Spacer(1,6))
        pairings = [
            ("League Spartan", "Bold, geometric headings that command attention and establish hierarchy."),
            ("Lato", "Title font with bold italic styling for maximum visual impact on hero sections."),
            ("Montserrat", "Primary body font and versatile workhorse \u2014 subtitles, body text, section headers, and captions."),
            ("Gotham", "Preferred section header font (Adobe licensed). Fallback: Montserrat."),
            ("Lora", "Editorial warmth for quotes and pull-quotes, contrasting the geometric sans-serif system."),
        ]
        for name, desc in pairings:
            self.story.append(Paragraph(f"<b>{name}</b> \u2014 {desc}", styles["body"]))
            self.story.append(Spacer(1,4))

        self.story.append(Spacer(1,12))
        self.story.append(Paragraph("Font Licensing", styles["subheading"]))
        self.story.append(Spacer(1,6))
        self.story.append(Paragraph('<font color="#166534"><b>Free (OFL)</b></font> \u2014 League Spartan, Lato, Montserrat, Lora, Hanken Grotesk (Google Fonts)', styles["body"]))
        self.story.append(Paragraph('<font color="#92400E"><b>Licensed</b></font> \u2014 HK Grotesk (commercial web). Fallback: Inter or Work Sans', styles["body"]))
        self.story.append(Paragraph('<font color="#92400E"><b>Licensed</b></font> \u2014 Gotham (Adobe Fonts). Fallback: Montserrat or Proxima Nova', styles["body"]))
        self.story.append(PageBreak())

    def logo_identity(self):
        self._section_header("Logo Identity &amp; Usage")
        self.story.append(Paragraph(
            "The Startup Anthology logo is a key element of our brand identity. It is available in several configurations "
            "to suit different contexts and layouts. Consistent and correct application is essential.",
            styles["body"]
        ))
        self.story.append(Spacer(1,12))

        variants = [
            ("Vertical Badge (Icon Only)", "Compact spaces, social media profile pictures, and application icons."),
            ("Vertical Badge + Wordmark (Black)", "The primary logo for most light-background applications."),
            ("Vertical Badge + Gold Wordmark", "Reserved for premium materials or instances where special emphasis is desired."),
            ("Vertical Badge + Gold Background", "Branded merchandise, signage, and high-visibility placements."),
            ("Horizontal Badge + Wordmark", "Best for wide layouts such as website headers and banners."),
        ]
        self.story.append(Paragraph("Logo Variants", styles["subheading"]))
        self.story.append(Spacer(1,6))
        for name, usage in variants:
            self.story.append(Paragraph(f"<b>{name}</b>", styles["body_bold"]))
            self.story.append(Paragraph(usage, styles["body"]))
            self.story.append(Spacer(1,6))

        self.story.append(Spacer(1,12))
        self.story.append(Paragraph("Clear Space &amp; Minimum Size", styles["subheading"]))
        self.story.append(Spacer(1,6))
        self.story.append(Paragraph("<b>Clear space:</b> Maintain minimum clear space around the logo equal to the height of the icon badge on all sides.", styles["body"]))
        self.story.append(Paragraph("<b>Icon minimum:</b> 32px height", styles["body"]))
        self.story.append(Paragraph("<b>Full logo minimum:</b> 80px width (with wordmark)", styles["body"]))

        self.story.append(Spacer(1,12))
        self.story.append(Paragraph("Color Application", styles["subheading"]))
        self.story.append(Spacer(1,6))
        self.story.append(Paragraph("\u2022 Use the <b>black badge</b> and wordmark on light backgrounds (white, light gray).", styles["body"]))
        self.story.append(Paragraph("\u2022 Use the <b>white badge</b> and wordmark on dark backgrounds (black, dark images).", styles["body"]))
        self.story.append(Paragraph("\u2022 The <b>gold wordmark</b> variant is versatile for both light and dark backgrounds.", styles["body"]))

        self.story.append(Spacer(1,12))
        self.story.append(Paragraph("Incorrect Usage", styles["subheading"]))
        self.story.append(Spacer(1,6))
        incorrect = [
            "Don't stretch or distort the logo proportions",
            "Don't place on busy or patterned backgrounds without sufficient contrast",
            "Don't change the logo colors outside of the approved variants",
            "Don't rotate or flip the logo",
            "Don't add drop shadows or effects to the logo",
            "Don't place the logo smaller than 32px (icon) or 80px (with wordmark)",
        ]
        for item in incorrect:
            self.story.append(Paragraph(f'<font color="#991B1B">\u2717 {item}</font>', styles["body"]))
        self.story.append(Spacer(1,4))

        self.story.append(Spacer(1,12))
        self.story.append(Paragraph("All 9 Logo Files", styles["subheading"]))
        self.story.append(Spacer(1,6))
        files = [
            "v-badge-black.png", "v-badge-black-text.png", "v-badge-black-gold.png",
            "v-badge-black-gold-bg.png", "v-white.png", "v-badge-white-gold.png",
            "icon-white.png", "h-badge-black.png", "h-white.png",
        ]
        file_data = [[Paragraph("<b>File</b>", styles["body_bold"]), Paragraph("<b>Description</b>", styles["body_bold"])]]
        labels = [
            "Vertical Badge (Black)", "Vertical Badge + Text (Black)", "Vertical Badge + Gold Text",
            "Vertical Badge on Gold BG", "Vertical (White)", "Vertical White + Gold Text",
            "Icon Only (White)", "Horizontal (Black)", "Horizontal (White)",
        ]
        for f, l in zip(files, labels):
            file_data.append([Paragraph(f, styles["small"]), Paragraph(l, styles["body"])])
        t = Table(file_data, colWidths=[2.5*inch, 4*inch])
        t.setStyle(TableStyle([
            ("BOTTOMPADDING",(0,0),(-1,-1),5),
            ("TOPPADDING",(0,0),(-1,-1),5),
            ("LINEBELOW",(0,0),(-1,0),1,SA_BLACK),
            ("LINEBELOW",(0,1),(-1,-1),0.5,SA_BORDER),
            ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ]))
        self.story.append(t)
        self.story.append(PageBreak())

    def brand_voice(self):
        self._section_header("Brand Voice &amp; Tone")

        self.story.append(Paragraph("Brand Overview", styles["subheading"]))
        self.story.append(Spacer(1,6))
        self.story.append(Paragraph('<b>Tagline:</b> Educate. Equip. Elevate.', styles["body"]))
        self.story.append(Spacer(1,4))
        self.story.append(Paragraph(
            '<b>Mission:</b> Empowering entrepreneurs and small business owners who\'d rather run their business than wrestle with it. '
            'We give them the tools and knowledge to focus on growth, not complexity.',
            styles["body"]
        ))
        self.story.append(Spacer(1,4))
        self.story.append(Paragraph(
            '<b>Positioning:</b> Championing the operators and doers who don\'t have time for spreadsheet headaches or financial jargon. '
            'We make professional financial tools accessible to everyone building something.',
            styles["body"]
        ))
        self.story.append(Spacer(1,12))

        self.story.append(Paragraph("Voice Characteristics", styles["subheading"]))
        self.story.append(Spacer(1,6))
        voice_attrs = [
            ("Empowering", "Gives confidence and control", '"Take control of your financial destiny"'),
            ("Supportive", "Acts as a partner, not a vendor", '"Your partner in navigating the complex world of startup finance"'),
            ("Honest", "Transparent and realistic", '"See your financial reality clearly, not through rose-colored glasses"'),
            ("Accessible", "No jargon, no gatekeeping", '"Financial modeling shouldn\'t require a finance degree"'),
            ("Action-Oriented", "Direct and practical", '"Stop fighting your spreadsheet"'),
            ("Builder-Centric", "Celebrates operators and doers", '"Built for the operators, the visionaries, and the unsung heroes"'),
        ]
        voice_data = [
            [Paragraph("<b>Attribute</b>", styles["body_bold"]),
             Paragraph("<b>Description</b>", styles["body_bold"]),
             Paragraph("<b>Example</b>", styles["body_bold"])]
        ]
        for attr, desc, ex in voice_attrs:
            voice_data.append([
                Paragraph(f'<font color="#BB935B"><b>{attr}</b></font>', styles["body"]),
                Paragraph(desc, styles["body"]),
                Paragraph(f'<i>{ex}</i>', styles["small"]),
            ])
        t = Table(voice_data, colWidths=[1.3*inch, 1.8*inch, 3.4*inch])
        t.setStyle(TableStyle([
            ("BOTTOMPADDING",(0,0),(-1,-1),6),
            ("TOPPADDING",(0,0),(-1,-1),6),
            ("LINEBELOW",(0,0),(-1,0),1,SA_BLACK),
            ("LINEBELOW",(0,1),(-1,-1),0.5,SA_BORDER),
            ("BACKGROUND",(0,0),(-1,0),SA_BLACK),
            ("TEXTCOLOR",(0,0),(-1,0),SA_WHITE),
            ("VALIGN",(0,0),(-1,-1),"TOP"),
        ]))
        self.story.append(t)
        self.story.append(Spacer(1,12))

        self.story.append(Paragraph("Tone Spectrum", styles["subheading"]))
        self.story.append(Spacer(1,6))
        tone_data = [
            [Paragraph("<b>Context</b>", styles["body_bold"]),
             Paragraph("<b>Tone</b>", styles["body_bold"]),
             Paragraph("<b>Example</b>", styles["body_bold"])]
        ]
        tones = [
            ("Marketing / Landing Pages", "Confident, bold, aspirational", "Financial Modeling, without the spreadsheets."),
            ("Product UI", "Clear, concise, helpful", "Your runway is 14 months at current burn rate."),
            ("Onboarding", "Warm, encouraging, guiding", "Let's set up your first forecast. It only takes a few minutes."),
            ("Error / Support", "Empathetic, solution-focused", "Something went wrong with your model. Let's fix it together."),
            ("Email / Updates", "Personal, informative, actionable", "Your monthly KPIs are ready. Here's what changed."),
        ]
        for ctx, tone, ex in tones:
            tone_data.append([
                Paragraph(f"<b>{ctx}</b>", styles["body"]),
                Paragraph(tone, styles["body"]),
                Paragraph(f"<i>{ex}</i>", styles["small"]),
            ])
        t = Table(tone_data, colWidths=[1.8*inch, 1.8*inch, 2.9*inch])
        t.setStyle(TableStyle([
            ("BOTTOMPADDING",(0,0),(-1,-1),6),
            ("TOPPADDING",(0,0),(-1,-1),6),
            ("LINEBELOW",(0,0),(-1,0),1,SA_BLACK),
            ("LINEBELOW",(0,1),(-1,-1),0.5,SA_BORDER),
            ("BACKGROUND",(0,0),(-1,0),SA_BLACK),
            ("TEXTCOLOR",(0,0),(-1,0),SA_WHITE),
            ("VALIGN",(0,0),(-1,-1),"TOP"),
        ]))
        self.story.append(t)
        self.story.append(Spacer(1,16))

        self.story.append(Paragraph("Voice Do's &amp; Don'ts", styles["subheading"]))
        self.story.append(Spacer(1,6))
        dos = [
            'Use "you" and "your" to create personal connection',
            "Frame problems and solutions clearly (problem \u2192 solution)",
            "Focus on benefits and outcomes (clarity, confidence, accessibility)",
            "Be empathetic about struggles while offering practical solutions",
            "Speak to the operator \u2014 the person running the business",
        ]
        donts = [
            "Use finance jargon or unnecessary complexity",
            "Sound corporate, stiff, or overly formal",
            "Make promises you can't back up with the product",
            "Talk down to users or assume they lack intelligence",
            "Use passive voice when active voice is clearer",
        ]
        for d in dos:
            self.story.append(Paragraph(f'<font color="#166534">\u2713 {d}</font>', styles["body"]))
        self.story.append(Spacer(1,6))
        for d in donts:
            self.story.append(Paragraph(f'<font color="#991B1B">\u2717 {d}</font>', styles["body"]))
        self.story.append(PageBreak())

    def audience_positioning(self):
        self._section_header("Audience &amp; Positioning")

        self.story.append(Paragraph("B2C Segments", styles["subheading"]))
        self.story.append(Spacer(1,6))
        b2c = [
            ("Startup Employees &amp; Managers", "Seeking insights to navigate startup culture challenges. Early team members with equity who deserve visibility into financial health.", "Primary"),
            ("Aspiring Entrepreneurs", "Access to a supportive community and mentorship to kickstart their journey.", "Secondary"),
            ("Freelancers &amp; Contractors", "Seeking networking opportunities and skill development resources in the tech startup industry.", "Secondary"),
            ("Startup Enthusiasts", "Stay updated on latest trends and innovations in the startup industry.", "Secondary"),
        ]
        b2c_data = [
            [Paragraph("<b>Segment</b>", styles["body_bold"]),
             Paragraph("<b>Needs &amp; Behaviors</b>", styles["body_bold"]),
             Paragraph("<b>Priority</b>", styles["body_bold"])]
        ]
        for seg, needs, pri in b2c:
            b2c_data.append([
                Paragraph(f"<b>{seg}</b>", styles["body"]),
                Paragraph(needs, styles["small"]),
                Paragraph(f'<font color="#BB935B"><b>{pri}</b></font>' if pri in ("Primary","Co-Primary") else pri, styles["body"]),
            ])
        t = Table(b2c_data, colWidths=[1.8*inch, 3.5*inch, 1.2*inch])
        t.setStyle(TableStyle([
            ("BOTTOMPADDING",(0,0),(-1,-1),6),
            ("TOPPADDING",(0,0),(-1,-1),6),
            ("LINEBELOW",(0,0),(-1,0),1,SA_BLACK),
            ("LINEBELOW",(0,1),(-1,-1),0.5,SA_BORDER),
            ("BACKGROUND",(0,0),(-1,0),SA_BLACK),
            ("TEXTCOLOR",(0,0),(-1,0),SA_WHITE),
            ("VALIGN",(0,0),(-1,-1),"TOP"),
        ]))
        self.story.append(t)
        self.story.append(Spacer(1,12))

        self.story.append(Paragraph("B2B Segments", styles["subheading"]))
        self.story.append(Spacer(1,6))
        b2b = [
            ("Entrepreneurs &amp; Founders", "Use data insights to match employee types for different roles as the startup grows. Need to model growth, plan fundraising, and present financial projections.", "Co-Primary"),
            ("Angel Investors &amp; VCs", "Need data-driven insights to identify promising startups for investment.", "Secondary"),
        ]
        b2b_data = [
            [Paragraph("<b>Segment</b>", styles["body_bold"]),
             Paragraph("<b>Needs &amp; Behaviors</b>", styles["body_bold"]),
             Paragraph("<b>Priority</b>", styles["body_bold"])]
        ]
        for seg, needs, pri in b2b:
            b2b_data.append([
                Paragraph(f"<b>{seg}</b>", styles["body"]),
                Paragraph(needs, styles["small"]),
                Paragraph(f'<font color="#BB935B"><b>{pri}</b></font>' if pri in ("Primary","Co-Primary") else pri, styles["body"]),
            ])
        t = Table(b2b_data, colWidths=[1.8*inch, 3.5*inch, 1.2*inch])
        t.setStyle(TableStyle([
            ("BOTTOMPADDING",(0,0),(-1,-1),6),
            ("TOPPADDING",(0,0),(-1,-1),6),
            ("LINEBELOW",(0,0),(-1,0),1,SA_BLACK),
            ("LINEBELOW",(0,1),(-1,-1),0.5,SA_BORDER),
            ("BACKGROUND",(0,0),(-1,0),SA_BLACK),
            ("TEXTCOLOR",(0,0),(-1,0),SA_WHITE),
            ("VALIGN",(0,0),(-1,-1),"TOP"),
        ]))
        self.story.append(t)
        self.story.append(Spacer(1,12))

        self.story.append(Paragraph("Additional Audience Segments", styles["subheading"]))
        self.story.append(Spacer(1,6))
        additional = [
            ("Early-Stage Operators", "COOs, heads of finance, and operations leads who manage day-to-day financial planning for growing companies."),
            ("Small Business Owners", "Entrepreneurs across industries (SaaS to real estate) who need structured financial forecasting."),
            ("Pre-Revenue Builders", "Teams still validating their idea who need to model runway, burn rate, and projected growth."),
        ]
        for name, desc in additional:
            self.story.append(Paragraph(f"<b>{name}</b> \u2014 {desc}", styles["body"]))
            self.story.append(Spacer(1,4))

        self.story.append(Spacer(1,12))
        self.story.append(Paragraph("Brand Focus Principles", styles["subheading"]))
        self.story.append(Spacer(1,6))
        principles = [
            ("Target Audience", "Prioritize startup employees and managers as the primary audience, with founders as a co-primary focus."),
            ("Brand Exclusivity", "All materials must exclusively feature Startup Anthology branding. Do not co-brand with other entities."),
            ("Strategic Use of Gold", "SA Gold should be used sparingly as an accent to draw attention to key information and CTAs."),
            ("Typographic Hierarchy", "Consistently apply the defined typographic system for professional presentation."),
            ("Voice Consistency", "Maintain an empowering, supportive, and accessible tone across all communications."),
            ("Mission Alignment", "Document and share the stories of entrepreneurs who'd rather run their business than wrestle with complexity."),
        ]
        for i, (title, desc) in enumerate(principles, 1):
            self.story.append(Paragraph(f'<font color="#BB935B"><b>{i}.</b></font> <b>{title}</b> \u2014 {desc}', styles["body"]))
            self.story.append(Spacer(1,4))
        self.story.append(PageBreak())

    def brand_applications(self):
        self._section_header("Brand Applications")
        self.story.append(Paragraph(
            "The Startup Anthology brand system is applied across multiple touchpoints to create a cohesive experience.",
            styles["body"]
        ))
        self.story.append(Spacer(1,12))

        apps = [
            ("Website &amp; Landing Pages", "Black backgrounds with gold accents. League Spartan headings, Montserrat body text. Primary CTA buttons in SA Gold with white text."),
            ("Mobile Application (Marketing Studio)", "Dark-themed interface using #000000 background, #1A1A1A surfaces, and SA Gold (#BB935B) as the tint color. Inter font family for mobile readability."),
            ("Social Media", "Profile pictures use the standalone rocket icon badge. Posts maintain the black/gold/white palette. Content follows the empowering, accessible voice."),
            ("Email Communications", "Personal, informative tone. SA Gold for key CTAs. Clean layout with Montserrat body text."),
            ("Presentations &amp; Reports", "Black slide backgrounds with gold accents. League Spartan for slide titles. Data visualizations use the SA color ramp."),
            ("Merchandise &amp; Print", "Vertical badge on gold background for high-visibility placements. Horizontal badge for wide-format materials. Clear space rules strictly observed."),
        ]
        for name, desc in apps:
            self.story.append(Paragraph(f"<b>{name}</b>", styles["body_bold"]))
            self.story.append(Paragraph(desc, styles["body"]))
            self.story.append(Spacer(1,10))

        self.story.append(Spacer(1,16))
        self.story.append(Paragraph("Core Messaging Framework", styles["subheading"]))
        self.story.append(Spacer(1,6))
        messaging = [
            ("For Entrepreneurs &amp; Small Business Owners", "Your job isn't building spreadsheets. Startup Anthology provides the tools and knowledge so you can focus on running your business."),
            ("For Pre-Revenue Teams", "Not making money yet? Model your burn rate, runway, and projected growth before your first dollar comes in."),
            ("For Real Estate &amp; Contractors", "Track job pipelines, deposits, and material costs with a model built for how you actually work."),
            ("For Founders Raising Capital", "Get investor-ready financial statements and KPIs without hiring an analyst."),
        ]
        for audience, msg in messaging:
            self.story.append(Paragraph(f"<b>{audience}</b>", styles["body_bold"]))
            self.story.append(Paragraph(msg, styles["body"]))
            self.story.append(Spacer(1,6))

    def _header_footer(self, canvas, doc):
        canvas.saveState()
        canvas.setFillColor(SA_GOLD)
        canvas.rect(0.75*inch, HEIGHT - 0.5*inch, 6.5*inch, 2, fill=1, stroke=0)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(SA_GRAY)
        canvas.drawString(0.75*inch, 0.4*inch, "Startup Anthology Brand Guide")
        canvas.drawRightString(WIDTH - 0.75*inch, 0.4*inch, f"Page {doc.page}")
        canvas.restoreState()

    def build(self):
        doc = SimpleDocTemplate(
            self.filename,
            pagesize=letter,
            leftMargin=0.75*inch,
            rightMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch,
        )
        self.cover_page()
        self.executive_summary()
        self.color_system()
        self.typography()
        self.logo_identity()
        self.brand_voice()
        self.audience_positioning()
        self.brand_applications()
        doc.build(self.story, onFirstPage=lambda c, d: None, onLaterPages=self._header_footer)
        print(f"PDF generated: {self.filename}")


if __name__ == "__main__":
    pdf = BrandPDF("SA_Brand_Guide.pdf")
    pdf.build()
