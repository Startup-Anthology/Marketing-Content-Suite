const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const BRAND = JSON.parse(fs.readFileSync(path.join(__dirname, "brand_data.json"), "utf-8"));

const GOLD = BRAND.palette["SA Gold"].replace("#", "");
const BLACK = BRAND.palette["Black"].replace("#", "");
const WHITE = BRAND.palette["White"].replace("#", "");
const GRAY = "999999";
const DARK_SURFACE = BRAND.palette["Dark Surface"].replace("#", "");
const LIGHT_GRAY = BRAND.palette["Surface Elevated"].replace("#", "");
const TEXT_SEC = "5C6B7F";
const BORDER_COLOR = BRAND.palette["Surface High"].replace("#", "");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Startup Anthology";
pres.title = "Startup Anthology Brand Guide";

function makeShadow() {
  return { type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.3 };
}

// Slide 1: Title
{
  const slide = pres.addSlide();
  slide.background = { color: BLACK };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: BLACK } });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.8, w: 10, h: 0.04, fill: { color: GOLD } });
  slide.addText("STARTUP ANTHOLOGY", {
    x: 0.8, y: 1.2, w: 8.4, h: 1.0,
    fontSize: 38, fontFace: "Georgia", bold: true, color: WHITE, align: "center", charSpacing: 6
  });
  slide.addText("Brand Identity Guide", {
    x: 0.8, y: 2.3, w: 8.4, h: 0.8,
    fontSize: 24, fontFace: "Georgia", color: GOLD, align: "center"
  });
  slide.addText("Educate. Equip. Elevate.", {
    x: 0.8, y: 3.3, w: 8.4, h: 0.6,
    fontSize: 16, fontFace: "Calibri", color: GRAY, align: "center", italic: true
  });
  slide.addText("Comprehensive Brand Analysis", {
    x: 0.8, y: 4.3, w: 8.4, h: 0.4,
    fontSize: 10, fontFace: "Calibri", color: GRAY, align: "center"
  });
}

// Slide 2: Executive Summary
{
  const slide = pres.addSlide();
  slide.background = { color: BLACK };
  slide.addText("Executive Summary", {
    x: 0.7, y: 0.4, w: 8.6, h: 0.7,
    fontSize: 32, fontFace: "Georgia", bold: true, color: WHITE, margin: 0
  });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.1, w: 2, h: 0.04, fill: { color: GOLD } });

  const summaryItems = [
    ["Brand Name", "Startup Anthology"],
    ["Tagline", "Educate. Equip. Elevate."],
    ["Primary Color", "SA Gold #BB935B"],
    ["Backgrounds", "Black #000000 / White #FFFFFF"],
    ["Typefaces", "League Spartan / Montserrat / Lora"],
    ["Tone", "Empowering, Supportive, Honest"],
    ["Primary Audience", "Startup Employees & Managers"],
    ["Co-Primary", "Entrepreneurs & Founders"],
  ];

  summaryItems.forEach((item, i) => {
    const y = 1.4 + i * 0.45;
    slide.addText(item[0], {
      x: 0.7, y, w: 2.8, h: 0.4,
      fontSize: 12, fontFace: "Calibri", bold: true, color: GOLD, valign: "middle", margin: 0
    });
    slide.addText(item[1], {
      x: 3.6, y, w: 5.7, h: 0.4,
      fontSize: 12, fontFace: "Calibri", color: WHITE, valign: "middle", margin: 0
    });
    if (i < summaryItems.length - 1) {
      slide.addShape(pres.shapes.LINE, { x: 0.7, y: y + 0.40, w: 8.6, h: 0, line: { color: "3A3A3A", width: 0.5 } });
    }
  });
}

// Slide 3: Color Palette
{
  const slide = pres.addSlide();
  slide.background = { color: BLACK };
  slide.addText("Color Palette", {
    x: 0.7, y: 0.4, w: 8.6, h: 0.7,
    fontSize: 32, fontFace: "Georgia", bold: true, color: WHITE, margin: 0
  });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.1, w: 2, h: 0.04, fill: { color: GOLD } });

  const colors = [
    { name: "SA Gold", hex: "#BB935B", fill: GOLD, textColor: BLACK },
    { name: "Black", hex: "#000000", fill: BLACK, textColor: WHITE, border: true },
    { name: "White", hex: "#FFFFFF", fill: WHITE, textColor: BLACK },
    { name: "Gray", hex: "#999999", fill: GRAY, textColor: BLACK },
  ];

  colors.forEach((c, i) => {
    const x = 0.7 + i * 2.25;
    const opts = { x, y: 1.5, w: 2.0, h: 1.4, fill: { color: c.fill }, shadow: makeShadow() };
    if (c.border) opts.line = { color: BORDER_COLOR, width: 1 };
    slide.addShape(pres.shapes.RECTANGLE, opts);
    slide.addText(c.name, {
      x, y: 3.05, w: 2.0, h: 0.35,
      fontSize: 13, fontFace: "Georgia", bold: true, color: WHITE, align: "center", margin: 0
    });
    slide.addText(c.hex, {
      x, y: 3.35, w: 2.0, h: 0.3,
      fontSize: 10, fontFace: "Calibri", color: GRAY, align: "center", margin: 0
    });
  });

  slide.addText("UI Colors", {
    x: 0.7, y: 3.9, w: 3, h: 0.4,
    fontSize: 16, fontFace: "Georgia", bold: true, color: GOLD, margin: 0
  });

  const uiColors = [
    { name: "Background Light", hex: "#F8FAFC", fill: "F8FAFC" },
    { name: "Text Secondary", hex: "#5C6B7F", fill: TEXT_SEC },
    { name: "Border", hex: "#E2E8F0", fill: "E2E8F0" },
  ];

  uiColors.forEach((c, i) => {
    const x = 0.7 + i * 3.1;
    slide.addShape(pres.shapes.RECTANGLE, { x, y: 4.4, w: 0.5, h: 0.5, fill: { color: c.fill }, shadow: makeShadow() });
    slide.addText(c.name, {
      x: x + 0.6, y: 4.4, w: 2.3, h: 0.25,
      fontSize: 11, fontFace: "Calibri", bold: true, color: WHITE, margin: 0
    });
    slide.addText(c.hex, {
      x: x + 0.6, y: 4.65, w: 2.3, h: 0.25,
      fontSize: 9, fontFace: "Calibri", color: GRAY, margin: 0
    });
  });
}

// Slide 4: WCAG Contrast Audit
{
  const slide = pres.addSlide();
  slide.background = { color: BLACK };
  slide.addText("WCAG Contrast Audit", {
    x: 0.7, y: 0.4, w: 8.6, h: 0.7,
    fontSize: 32, fontFace: "Georgia", bold: true, color: WHITE, margin: 0
  });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.1, w: 2, h: 0.04, fill: { color: GOLD } });

  function relLum(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const toL = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * toL(r) + 0.7152 * toL(g) + 0.0722 * toL(b);
  }
  function contrastRatio(c1, c2) {
    const l1 = relLum(c1), l2 = relLum(c2);
    return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
  }

  const pairs = [
    ["#000000", "#FFFFFF", "Black on White"],
    ["#FFFFFF", "#000000", "White on Black"],
    ["#BB935B", "#FFFFFF", "Gold on White"],
    ["#BB935B", "#000000", "Gold on Black"],
    ["#FFFFFF", "#BB935B", "White on Gold"],
    ["#000000", "#BB935B", "Black on Gold"],
    ["#5C6B7F", "#FFFFFF", "Text on White"],
    ["#999999", "#FFFFFF", "Gray on White"],
  ];

  const headerRow = [
    { text: "Combination", options: { bold: true, color: BLACK, fill: { color: GOLD }, fontSize: 10, fontFace: "Georgia" } },
    { text: "Ratio", options: { bold: true, color: BLACK, fill: { color: GOLD }, fontSize: 10, fontFace: "Georgia" } },
    { text: "AA Normal", options: { bold: true, color: BLACK, fill: { color: GOLD }, fontSize: 10, fontFace: "Georgia" } },
    { text: "AA Large", options: { bold: true, color: BLACK, fill: { color: GOLD }, fontSize: 10, fontFace: "Georgia" } },
  ];

  const rows = [headerRow];
  pairs.forEach((p, i) => {
    const ratio = contrastRatio(p[0], p[1]);
    const aaNormal = ratio >= 4.5;
    const aaLarge = ratio >= 3.0;
    const bgColor = i % 2 === 0 ? DARK_SURFACE : LIGHT_GRAY;
    rows.push([
      { text: p[2], options: { color: WHITE, fill: { color: bgColor }, fontSize: 10, fontFace: "Calibri" } },
      { text: `${ratio.toFixed(2)}:1`, options: { color: WHITE, fill: { color: bgColor }, fontSize: 10, fontFace: "Calibri" } },
      { text: aaNormal ? "Pass" : "Fail", options: { color: aaNormal ? "22C55E" : "EF4444", fill: { color: bgColor }, fontSize: 10, fontFace: "Calibri", bold: true } },
      { text: aaLarge ? "Pass" : "Fail", options: { color: aaLarge ? "22C55E" : "EF4444", fill: { color: bgColor }, fontSize: 10, fontFace: "Calibri", bold: true } },
    ]);
  });

  slide.addTable(rows, {
    x: 0.7, y: 1.4, w: 8.6,
    colW: [3.5, 1.7, 1.7, 1.7],
    border: { pt: 0.5, color: BORDER_COLOR },
    rowH: [0.4, 0.38, 0.38, 0.38, 0.38, 0.38, 0.38, 0.38, 0.38],
  });
}

// Slide 5: Typography
{
  const slide = pres.addSlide();
  slide.background = { color: BLACK };
  slide.addText("Typography Specimen", {
    x: 0.7, y: 0.4, w: 8.6, h: 0.7,
    fontSize: 32, fontFace: "Georgia", bold: true, color: WHITE, margin: 0
  });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.1, w: 2, h: 0.04, fill: { color: GOLD } });

  const typeRows = [
    [
      { text: "Purpose", options: { bold: true, color: BLACK, fill: { color: GOLD }, fontSize: 10, fontFace: "Georgia" } },
      { text: "Typeface", options: { bold: true, color: BLACK, fill: { color: GOLD }, fontSize: 10, fontFace: "Georgia" } },
      { text: "Weight", options: { bold: true, color: BLACK, fill: { color: GOLD }, fontSize: 10, fontFace: "Georgia" } },
      { text: "Size", options: { bold: true, color: BLACK, fill: { color: GOLD }, fontSize: 10, fontFace: "Georgia" } },
    ],
  ];

  const typeData = [
    ["Title", "Lato", "Bold Italic", "60px"],
    ["Subtitle", "Montserrat", "Regular Italic", "24px"],
    ["Heading", "League Spartan", "700", "30px"],
    ["Subheading", "HK Grotesk / Inter", "Regular", "20px"],
    ["Section Header", "Gotham / Montserrat", "600", "18px"],
    ["Body", "Montserrat", "Regular", "16px"],
    ["Quote", "Lora", "Italic", "18px"],
    ["Caption", "Montserrat", "Regular", "12px"],
  ];

  typeData.forEach((row, i) => {
    const bgColor = i % 2 === 0 ? DARK_SURFACE : LIGHT_GRAY;
    typeRows.push([
      { text: row[0], options: { bold: true, color: GOLD, fill: { color: bgColor }, fontSize: 10, fontFace: "Calibri" } },
      { text: row[1], options: { color: WHITE, fill: { color: bgColor }, fontSize: 10, fontFace: "Calibri" } },
      { text: row[2], options: { color: GRAY, fill: { color: bgColor }, fontSize: 10, fontFace: "Calibri" } },
      { text: row[3], options: { color: GRAY, fill: { color: bgColor }, fontSize: 10, fontFace: "Calibri" } },
    ]);
  });

  slide.addTable(typeRows, {
    x: 0.7, y: 1.3, w: 8.6,
    colW: [2.2, 2.5, 2.2, 1.7],
    border: { pt: 0.5, color: BORDER_COLOR },
    rowH: [0.35, 0.33, 0.33, 0.33, 0.33, 0.33, 0.33, 0.33, 0.33],
  });

  slide.addText("Font Pairing Rationale", {
    x: 0.7, y: 4.2, w: 4, h: 0.3,
    fontSize: 13, fontFace: "Georgia", bold: true, color: GOLD, margin: 0
  });
  slide.addText([
    { text: "League Spartan ", options: { bold: true, color: WHITE, fontSize: 9 } },
    { text: "Bold geometric headings  |  ", options: { color: GRAY, fontSize: 9 } },
    { text: "Montserrat ", options: { bold: true, color: WHITE, fontSize: 9 } },
    { text: "Primary body font  |  ", options: { color: GRAY, fontSize: 9 } },
    { text: "Lora ", options: { bold: true, color: WHITE, fontSize: 9 } },
    { text: "Editorial warmth for quotes", options: { color: GRAY, fontSize: 9 } },
  ], { x: 0.7, y: 4.5, w: 8.6, h: 0.5, valign: "top", margin: 0 });
}

// Slide 6: Logo Showcase
{
  const slide = pres.addSlide();
  slide.background = { color: BLACK };
  slide.addText("Logo Identity & Usage", {
    x: 0.7, y: 0.4, w: 8.6, h: 0.7,
    fontSize: 32, fontFace: "Georgia", bold: true, color: WHITE, margin: 0
  });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.1, w: 2, h: 0.04, fill: { color: GOLD } });

  const variants = [
    "Vertical Badge (Icon Only)",
    "Vertical Badge + Wordmark (Black)",
    "Vertical Badge + Gold Wordmark",
    "Vertical Badge + Gold Background",
    "Horizontal Badge + Wordmark",
  ];

  variants.forEach((v, i) => {
    const y = 1.45 + i * 0.55;
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 0.08, h: 0.45, fill: { color: GOLD } });
    slide.addText(v, {
      x: 1.0, y, w: 8.3, h: 0.45,
      fontSize: 13, fontFace: "Calibri", color: WHITE, valign: "middle", margin: 0
    });
  });

  slide.addText("Clear Space & Minimum Sizes", {
    x: 0.7, y: 4.0, w: 4, h: 0.35,
    fontSize: 14, fontFace: "Georgia", bold: true, color: GOLD, margin: 0
  });
  slide.addText([
    { text: "Icon minimum: 32px height", options: { color: WHITE, fontSize: 11, breakLine: true } },
    { text: "Full logo minimum: 80px width (with wordmark)", options: { color: WHITE, fontSize: 11, breakLine: true } },
    { text: "Clear space: 1x icon height on all sides", options: { color: WHITE, fontSize: 11 } },
  ], { x: 0.7, y: 4.35, w: 8.6, h: 0.7, valign: "top", margin: 0 });
}

// Slide 7: Voice & Tone
{
  const slide = pres.addSlide();
  slide.background = { color: BLACK };
  slide.addText("Brand Voice & Tone", {
    x: 0.7, y: 0.4, w: 8.6, h: 0.7,
    fontSize: 32, fontFace: "Georgia", bold: true, color: WHITE, margin: 0
  });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.1, w: 2, h: 0.04, fill: { color: GOLD } });

  const voiceAttrs = [
    ["Empowering", '"Take control of your financial destiny"'],
    ["Supportive", '"Your partner in navigating startup finance"'],
    ["Honest", '"See your financial reality clearly"'],
    ["Accessible", '"Financial modeling shouldn\'t require a degree"'],
    ["Action-Oriented", '"Stop fighting your spreadsheet"'],
    ["Builder-Centric", '"Built for the operators and visionaries"'],
  ];

  voiceAttrs.forEach((v, i) => {
    const col = i < 3 ? 0 : 1;
    const row = i % 3;
    const x = 0.7 + col * 4.5;
    const y = 1.35 + row * 0.95;

    slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.2, h: 0.82, fill: { color: DARK_SURFACE }, shadow: makeShadow() });
    slide.addText(v[0], {
      x: x + 0.15, y, w: 3.9, h: 0.38,
      fontSize: 13, fontFace: "Georgia", bold: true, color: GOLD, valign: "bottom", margin: 0
    });
    slide.addText(v[1], {
      x: x + 0.15, y: y + 0.38, w: 3.9, h: 0.38,
      fontSize: 10, fontFace: "Calibri", italic: true, color: GRAY, valign: "top", margin: 0
    });
  });

  slide.addText("Tagline", {
    x: 0.7, y: 4.3, w: 2, h: 0.3,
    fontSize: 12, fontFace: "Calibri", bold: true, color: GOLD, margin: 0
  });
  slide.addText("Educate. Equip. Elevate.", {
    x: 2.7, y: 4.3, w: 6.6, h: 0.3,
    fontSize: 18, fontFace: "Georgia", bold: true, color: WHITE, margin: 0
  });
  slide.addText("Mission", {
    x: 0.7, y: 4.65, w: 2, h: 0.3,
    fontSize: 12, fontFace: "Calibri", bold: true, color: GOLD, margin: 0
  });
  slide.addText("Empowering entrepreneurs who'd rather run their business than wrestle with it.", {
    x: 2.7, y: 4.65, w: 6.6, h: 0.4,
    fontSize: 11, fontFace: "Calibri", color: GRAY, margin: 0
  });
}

// Slide 8: Tone Spectrum
{
  const slide = pres.addSlide();
  slide.background = { color: BLACK };
  slide.addText("Tone Spectrum", {
    x: 0.7, y: 0.4, w: 8.6, h: 0.7,
    fontSize: 32, fontFace: "Georgia", bold: true, color: WHITE, margin: 0
  });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.1, w: 2, h: 0.04, fill: { color: GOLD } });

  const tones = [
    ["Marketing", "Confident, bold, aspirational", "Financial Modeling, without the spreadsheets."],
    ["Product UI", "Clear, concise, helpful", "Your runway is 14 months at current burn rate."],
    ["Onboarding", "Warm, encouraging, guiding", "Let's set up your first forecast."],
    ["Error / Support", "Empathetic, solution-focused", "Something went wrong. Let's fix it together."],
    ["Email / Updates", "Personal, informative", "Your monthly KPIs are ready."],
  ];

  tones.forEach((t, i) => {
    const y = 1.4 + i * 0.8;
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 8.6, h: 0.7, fill: { color: i % 2 === 0 ? DARK_SURFACE : LIGHT_GRAY } });
    slide.addText(t[0], {
      x: 0.85, y, w: 2.0, h: 0.7,
      fontSize: 12, fontFace: "Georgia", bold: true, color: GOLD, valign: "middle", margin: 0
    });
    slide.addText(t[1], {
      x: 2.9, y, w: 2.5, h: 0.7,
      fontSize: 11, fontFace: "Calibri", color: WHITE, valign: "middle", margin: 0
    });
    slide.addText(t[2], {
      x: 5.5, y, w: 3.6, h: 0.7,
      fontSize: 10, fontFace: "Calibri", italic: true, color: GRAY, valign: "middle", margin: 0
    });
  });
}

// Slide 9: Audience Positioning
{
  const slide = pres.addSlide();
  slide.background = { color: BLACK };
  slide.addText("Audience & Positioning", {
    x: 0.7, y: 0.4, w: 8.6, h: 0.7,
    fontSize: 32, fontFace: "Georgia", bold: true, color: WHITE, margin: 0
  });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.1, w: 2, h: 0.04, fill: { color: GOLD } });

  const segments = [
    { name: "Startup Employees & Managers", priority: "Primary", type: "B2C" },
    { name: "Aspiring Entrepreneurs", priority: "Secondary", type: "B2C" },
    { name: "Freelancers & Contractors", priority: "Secondary", type: "B2C" },
    { name: "Entrepreneurs & Founders", priority: "Co-Primary", type: "B2B" },
    { name: "Angel Investors & VCs", priority: "Secondary", type: "B2B" },
    { name: "Early-Stage Operators", priority: "Secondary", type: "Product" },
  ];

  segments.forEach((s, i) => {
    const col = i < 3 ? 0 : 1;
    const row = i % 3;
    const x = 0.7 + col * 4.5;
    const y = 1.35 + row * 1.05;

    slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.2, h: 0.9, fill: { color: DARK_SURFACE }, shadow: makeShadow() });
    slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 0.9, fill: { color: GOLD } });
    slide.addText(s.name, {
      x: x + 0.2, y, w: 3.8, h: 0.45,
      fontSize: 13, fontFace: "Calibri", bold: true, color: WHITE, valign: "bottom", margin: 0
    });

    const priColor = (s.priority === "Primary" || s.priority === "Co-Primary") ? GOLD : GRAY;
    slide.addText([
      { text: s.priority, options: { bold: true, color: priColor, fontSize: 10 } },
      { text: `  |  ${s.type}`, options: { color: GRAY, fontSize: 10 } },
    ], { x: x + 0.2, y: y + 0.45, w: 3.8, h: 0.35, valign: "top", margin: 0 });
  });

  slide.addText("Positioning: Championing the operators and doers who don't have time for spreadsheet headaches.", {
    x: 0.7, y: 4.7, w: 8.6, h: 0.4,
    fontSize: 11, fontFace: "Calibri", italic: true, color: GRAY, margin: 0
  });
}

// Slide 10: Brand Applications
{
  const slide = pres.addSlide();
  slide.background = { color: BLACK };
  slide.addText("Brand Applications", {
    x: 0.7, y: 0.4, w: 8.6, h: 0.7,
    fontSize: 32, fontFace: "Georgia", bold: true, color: WHITE, margin: 0
  });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.1, w: 2, h: 0.04, fill: { color: GOLD } });

  const apps = [
    ["Website & Landing Pages", "Black backgrounds with gold accents, League Spartan headings"],
    ["Mobile App (Marketing Studio)", "Dark-themed, #000000 background, SA Gold tint, Inter font"],
    ["Social Media", "Rocket icon badge for profiles, black/gold/white palette"],
    ["Email Communications", "Personal tone, SA Gold CTAs, Montserrat body"],
    ["Presentations & Reports", "Black slides with gold accents, SA color ramp for data"],
    ["Merchandise & Print", "Vertical badge on gold background, clear space rules"],
  ];

  apps.forEach((a, i) => {
    const col = i < 3 ? 0 : 1;
    const row = i % 3;
    const x = 0.7 + col * 4.5;
    const y = 1.35 + row * 1.15;

    slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.2, h: 1.0, fill: { color: DARK_SURFACE }, shadow: makeShadow() });
    slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 1.0, fill: { color: GOLD } });
    slide.addText(a[0], {
      x: x + 0.2, y: y + 0.05, w: 3.8, h: 0.4,
      fontSize: 13, fontFace: "Georgia", bold: true, color: GOLD, valign: "bottom", margin: 0
    });
    slide.addText(a[1], {
      x: x + 0.2, y: y + 0.45, w: 3.8, h: 0.45,
      fontSize: 10, fontFace: "Calibri", color: WHITE, valign: "top", margin: 0
    });
  });
}

// Slide 11: Messaging Framework
{
  const slide = pres.addSlide();
  slide.background = { color: BLACK };
  slide.addText("Core Messaging Framework", {
    x: 0.7, y: 0.4, w: 8.6, h: 0.7,
    fontSize: 32, fontFace: "Georgia", bold: true, color: WHITE, margin: 0
  });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.1, w: 2, h: 0.04, fill: { color: GOLD } });

  const msgs = [
    ["For Entrepreneurs & SMBs", "Your job isn't building spreadsheets. Startup Anthology provides the tools and knowledge so you can focus on running your business."],
    ["For Pre-Revenue Teams", "Not making money yet? Model your burn rate, runway, and projected growth before your first dollar comes in."],
    ["For Real Estate & Contractors", "Track job pipelines, deposits, and material costs with a model built for how you actually work."],
    ["For Founders Raising Capital", "Get investor-ready financial statements and KPIs without hiring an analyst."],
  ];

  msgs.forEach((m, i) => {
    const y = 1.35 + i * 0.95;
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 8.6, h: 0.8, fill: { color: DARK_SURFACE }, shadow: makeShadow() });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 0.06, h: 0.8, fill: { color: GOLD } });
    slide.addText(m[0], {
      x: 0.95, y, w: 8.2, h: 0.32,
      fontSize: 13, fontFace: "Georgia", bold: true, color: GOLD, valign: "bottom", margin: 0
    });
    slide.addText(m[1], {
      x: 0.95, y: y + 0.32, w: 8.2, h: 0.42,
      fontSize: 11, fontFace: "Calibri", color: WHITE, valign: "top", margin: 0
    });
  });
}

// Slide 12: Summary
{
  const slide = pres.addSlide();
  slide.background = { color: BLACK };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.8, w: 10, h: 0.04, fill: { color: GOLD } });

  slide.addText("STARTUP ANTHOLOGY", {
    x: 0.8, y: 1.5, w: 8.4, h: 0.8,
    fontSize: 36, fontFace: "Georgia", bold: true, color: WHITE, align: "center", charSpacing: 6
  });
  slide.addText("Educate. Equip. Elevate.", {
    x: 0.8, y: 2.4, w: 8.4, h: 0.6,
    fontSize: 20, fontFace: "Georgia", color: GOLD, align: "center"
  });
  slide.addText("Brand consistency builds trust. Every touchpoint is an opportunity to reinforce who we are.", {
    x: 1.5, y: 3.3, w: 7, h: 0.8,
    fontSize: 14, fontFace: "Calibri", color: GRAY, align: "center", italic: true
  });
  slide.addText("For questions about brand usage, contact the Startup Anthology brand team.", {
    x: 1.5, y: 4.5, w: 7, h: 0.4,
    fontSize: 10, fontFace: "Calibri", color: GRAY, align: "center"
  });
}

pres.writeFile({ fileName: "SA_Brand_Guide.pptx" }).then(() => {
  console.log("PPTX generated: SA_Brand_Guide.pptx");
}).catch(err => {
  console.error("Error:", err);
});
