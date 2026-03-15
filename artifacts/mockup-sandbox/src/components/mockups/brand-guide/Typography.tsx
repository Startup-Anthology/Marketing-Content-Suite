import './_group.css';

const typeHierarchy = [
  { purpose: "Title", font: "Lato", weight: "Bold Italic", size: "60px", lineHeight: "1.1", source: "Google Fonts", sample: "Financial Modeling, Without the Spreadsheets" },
  { purpose: "Subtitle", font: "Montserrat", weight: "Regular Italic", size: "24px", lineHeight: "1.3", source: "Google Fonts", sample: "The tool for people who'd rather run their business" },
  { purpose: "Heading", font: "League Spartan", weight: "Regular (700)", size: "30px", lineHeight: "1.2", source: "Google Fonts", sample: "Built for Every Business Model" },
  { purpose: "Subheading", font: "HK Grotesk / Inter", weight: "Regular", size: "20px", lineHeight: "1.4", source: "Google / Fallback", sample: "Custom Revenue Models That Match Your Business" },
  { purpose: "Section Header", font: "Gotham / Montserrat", weight: "Regular (600)", size: "18px", lineHeight: "1.4", source: "Adobe / Fallback", sample: "BETA ACCESS — $25/MONTH" },
  { purpose: "Body", font: "Montserrat", weight: "Regular", size: "16px", lineHeight: "1.6", source: "Google Fonts", sample: "Horizon handles the financial modeling so you can focus on running your business. Get forecasts you can trust, KPIs that actually help you decide, and professional financial statements." },
  { purpose: "Quote", font: "Lora", weight: "Italic", size: "18px", lineHeight: "1.6", source: "Google Fonts", sample: '"See your financial reality clearly, not through rose-colored glasses"' },
  { purpose: "Caption", font: "Montserrat", weight: "Regular", size: "12px", lineHeight: "1.4", source: "Google Fonts", sample: "Limited slots available. Cancel anytime." },
];

const fontMap: Record<string, string> = {
  "Lato": "'Lato', sans-serif",
  "Montserrat": "'Montserrat', sans-serif",
  "League Spartan": "'League Spartan', sans-serif",
  "HK Grotesk / Inter": "'Hanken Grotesk', 'Inter', sans-serif",
  "Gotham / Montserrat": "'Montserrat', sans-serif",
  "Lora": "'Lora', serif",
};

const weightMap: Record<string, { fontWeight: number; fontStyle?: string }> = {
  "Bold Italic": { fontWeight: 700, fontStyle: "italic" },
  "Regular Italic": { fontWeight: 400, fontStyle: "italic" },
  "Regular (700)": { fontWeight: 700 },
  "Regular": { fontWeight: 400 },
  "Regular (600)": { fontWeight: 600 },
  "Italic": { fontWeight: 400, fontStyle: "italic" },
};

export function Typography() {
  return (
    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", background: '#FFFFFF', minHeight: '100vh', padding: '48px', color: '#000000' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ borderBottom: '3px solid #BB935B', paddingBottom: 16, marginBottom: 40 }}>
          <div style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 14, fontWeight: 600, color: '#BB935B', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Startup Anthology Brand Guide</div>
          <h1 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 42, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>Typography</h1>
        </div>

        <p style={{ fontSize: 16, color: '#5C6B7F', lineHeight: 1.6, marginBottom: 32, maxWidth: 800 }}>
          Our typographic system is designed to create clear hierarchy, improve readability, and add visual interest. Each typeface has a specific role to ensure a consistent and professional appearance.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 48 }}>
          {typeHierarchy.map((t) => {
            const fontFamily = fontMap[t.font] || `'${t.font}', sans-serif`;
            const weights = weightMap[t.weight] || { fontWeight: 400 };
            return (
              <div key={t.purpose} style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700, fontSize: 14, color: '#BB935B', minWidth: 110 }}>{t.purpose}</span>
                  <span style={{ fontSize: 12, fontFamily: "'Roboto Mono', monospace", color: '#5C6B7F' }}>{t.font}</span>
                  <span style={{ fontSize: 11, background: '#E2E8F0', padding: '2px 8px', borderRadius: 4, color: '#5C6B7F' }}>{t.weight}</span>
                  <span style={{ fontSize: 11, fontFamily: "'Roboto Mono', monospace", color: '#999' }}>{t.size} / {t.lineHeight}</span>
                  <span style={{ fontSize: 10, background: '#000000', color: '#FFFFFF', padding: '2px 8px', borderRadius: 4, marginLeft: 'auto' }}>{t.source}</span>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <p style={{
                    fontFamily,
                    fontSize: t.purpose === 'Title' ? 36 : parseInt(t.size),
                    fontWeight: weights.fontWeight,
                    fontStyle: weights.fontStyle || 'normal',
                    lineHeight: parseFloat(t.lineHeight),
                    margin: 0,
                    color: '#000000',
                  }}>{t.sample}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
          <div>
            <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Font Pairing Rationale</h2>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 20 }}>
              <p style={{ fontSize: 14, color: '#5C6B7F', lineHeight: 1.6, margin: '0 0 12px' }}>
                <strong style={{ color: '#000000' }}>League Spartan</strong> provides bold, geometric headings that command attention and establish hierarchy.
              </p>
              <p style={{ fontSize: 14, color: '#5C6B7F', lineHeight: 1.6, margin: '0 0 12px' }}>
                <strong style={{ color: '#000000' }}>Lato</strong> serves as the title font with bold italic styling for maximum visual impact on hero sections.
              </p>
              <p style={{ fontSize: 14, color: '#5C6B7F', lineHeight: 1.6, margin: '0 0 12px' }}>
                <strong style={{ color: '#000000' }}>Montserrat</strong> is the primary body font and versatile workhorse — used for subtitles, body text, section headers, and captions across different weights.
              </p>
              <p style={{ fontSize: 14, color: '#5C6B7F', lineHeight: 1.6, margin: '0 0 12px' }}>
                <strong style={{ color: '#000000' }}>Gotham</strong> is the preferred section header font (Adobe licensed). When unavailable, Montserrat serves as the open-source fallback with similar geometric proportions.
              </p>
              <p style={{ fontSize: 14, color: '#5C6B7F', lineHeight: 1.6, margin: 0 }}>
                <strong style={{ color: '#000000' }}>Lora</strong> adds editorial warmth for quotes and pull-quotes, contrasting the geometric sans-serif system.
              </p>
            </div>
          </div>
          <div>
            <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Font Licensing Notes</h2>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ background: '#F0FDF4', color: '#166534', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>Free</span>
                  <p style={{ fontSize: 13, color: '#5C6B7F', margin: 0, lineHeight: 1.5 }}>League Spartan, Lato, Montserrat, Lora, Hanken Grotesk — all available via Google Fonts (OFL license)</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>Licensed</span>
                  <p style={{ fontSize: 13, color: '#5C6B7F', margin: 0, lineHeight: 1.5 }}>HK Grotesk — may require licensed access for commercial web projects. Fallback: <strong>Inter</strong> or <strong>Work Sans</strong></p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>Licensed</span>
                  <p style={{ fontSize: 13, color: '#5C6B7F', margin: 0, lineHeight: 1.5 }}>Gotham (Section Header alternate) — Adobe Fonts. Fallback: <strong>Montserrat</strong> or <strong>Proxima Nova</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Type Hierarchy Reference</h2>
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#000000', color: '#FFFFFF' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif" }}>Purpose</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif" }}>Typeface</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif" }}>Weight / Style</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif" }}>Size</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif" }}>Line Height</th>
              </tr>
            </thead>
            <tbody>
              {typeHierarchy.map((t, i) => (
                <tr key={t.purpose} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{t.purpose}</td>
                  <td style={{ padding: '10px 14px' }}>{t.font}</td>
                  <td style={{ padding: '10px 14px', color: '#5C6B7F' }}>{t.weight}</td>
                  <td style={{ padding: '10px 14px', fontFamily: "'Roboto Mono', monospace", color: '#5C6B7F' }}>{t.size}</td>
                  <td style={{ padding: '10px 14px', fontFamily: "'Roboto Mono', monospace", color: '#5C6B7F' }}>{t.lineHeight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
