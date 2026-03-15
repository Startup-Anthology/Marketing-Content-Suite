import './_group.css';

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
}

const coreColors = [
  { name: "SA Gold", hex: "#BB935B", rgb: "187, 147, 91", usage: "Accent color for highlights, calls-to-action, and key information" },
  { name: "Dark Navy", hex: "#0F1729", rgb: "15, 23, 41", usage: "Primary text color, dark backgrounds, headers" },
  { name: "White", hex: "#FFFFFF", rgb: "255, 255, 255", usage: "Primary background color, text on dark backgrounds" },
  { name: "Black", hex: "#000000", rgb: "0, 0, 0", usage: "Primary text color, dark backgrounds" },
  { name: "Gray", hex: "#999999", rgb: "153, 153, 153", usage: "Secondary text, subtle UI elements, and borders" },
];

const uiColors = [
  { name: "Background Light", hex: "#F8FAFC", usage: "App background, card backgrounds" },
  { name: "Text Secondary", hex: "#5C6B7F", usage: "Body text, descriptions" },
  { name: "Border", hex: "#E2E8F0", usage: "Card borders, dividers" },
];

function generateShades(baseHex: string, name: string) {
  const { r, g, b } = hexToRgb(baseHex);
  const shades: { step: number; hex: string }[] = [];
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  steps.forEach(step => {
    const factor = step / 500;
    let nr, ng, nb;
    if (step < 500) {
      const mix = 1 - factor;
      nr = Math.round(r + (255 - r) * mix);
      ng = Math.round(g + (255 - g) * mix);
      nb = Math.round(b + (255 - b) * mix);
    } else {
      const mix = (factor - 1);
      nr = Math.round(r * (1 - mix));
      ng = Math.round(g * (1 - mix));
      nb = Math.round(b * (1 - mix));
    }
    const hex = `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
    shades.push({ step, hex });
  });
  return shades;
}

const contrastPairs = [
  { fg: "#0F1729", bg: "#FFFFFF", label: "Navy on White" },
  { fg: "#FFFFFF", bg: "#0F1729", label: "White on Navy" },
  { fg: "#BB935B", bg: "#FFFFFF", label: "Gold on White" },
  { fg: "#BB935B", bg: "#0F1729", label: "Gold on Navy" },
  { fg: "#FFFFFF", bg: "#BB935B", label: "White on Gold" },
  { fg: "#0F1729", bg: "#BB935B", label: "Navy on Gold" },
  { fg: "#5C6B7F", bg: "#FFFFFF", label: "Text on White" },
  { fg: "#999999", bg: "#FFFFFF", label: "Gray on White" },
];

const goldShades = generateShades("#BB935B", "SA Gold");
const navyShades = generateShades("#0F1729", "Dark Navy");

export function ColorSystem() {
  return (
    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", background: '#FFFFFF', minHeight: '100vh', padding: '48px', color: '#0F1729' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ borderBottom: '3px solid #BB935B', paddingBottom: 16, marginBottom: 40 }}>
          <div style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 14, fontWeight: 600, color: '#BB935B', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Startup Anthology Brand Guide</div>
          <h1 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 42, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>Color System</h1>
        </div>

        <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Core Palette</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 40 }}>
          {coreColors.map((c) => (
            <div key={c.name} style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ height: 80, background: c.hex, border: c.hex === '#FFFFFF' ? '1px solid #E2E8F0' : 'none' }} />
              <div style={{ padding: 12 }}>
                <div style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontSize: 12, fontFamily: "'Roboto Mono', monospace", color: '#5C6B7F', marginBottom: 2 }}>{c.hex}</div>
                <div style={{ fontSize: 11, fontFamily: "'Roboto Mono', monospace", color: '#999' }}>RGB {c.rgb}</div>
                <p style={{ fontSize: 11, color: '#5C6B7F', margin: '8px 0 0', lineHeight: 1.4 }}>{c.usage}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 16 }}>UI Colors</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
          {uiColors.map((c) => (
            <div key={c.name} style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ height: 48, background: c.hex, border: '1px solid #E2E8F0' }} />
              <div style={{ padding: 12 }}>
                <div style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontSize: 12, fontFamily: "'Roboto Mono', monospace", color: '#5C6B7F' }}>{c.hex}</div>
                <p style={{ fontSize: 11, color: '#5C6B7F', margin: '6px 0 0', lineHeight: 1.4 }}>{c.usage}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
          <div>
            <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>SA Gold Ramp</h2>
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              {goldShades.map((s) => (
                <div key={s.step} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: 48, background: s.hex }} />
                  <div style={{ padding: '4px 2px', fontSize: 9, fontFamily: "'Roboto Mono', monospace" }}>
                    <div style={{ fontWeight: 600 }}>{s.step}</div>
                    <div style={{ color: '#999' }}>{s.hex}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Dark Navy Ramp</h2>
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              {navyShades.map((s) => (
                <div key={s.step} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: 48, background: s.hex }} />
                  <div style={{ padding: '4px 2px', fontSize: 9, fontFamily: "'Roboto Mono', monospace" }}>
                    <div style={{ fontWeight: 600 }}>{s.step}</div>
                    <div style={{ color: '#999' }}>{s.hex}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 16 }}>WCAG Contrast Audit</h2>
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0', marginBottom: 40 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#0F1729', color: '#FFFFFF' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif" }}>Combination</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif" }}>Preview</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif" }}>Ratio</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif" }}>AA Normal</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif" }}>AA Large</th>
              </tr>
            </thead>
            <tbody>
              {contrastPairs.map((p, i) => {
                const ratio = parseFloat(contrastRatio(p.fg, p.bg));
                const aaNormal = ratio >= 4.5;
                const aaLarge = ratio >= 3;
                return (
                  <tr key={p.label} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 500 }}>{p.label}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: p.bg, color: p.fg, padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600, border: p.bg === '#FFFFFF' ? '1px solid #E2E8F0' : 'none' }}>Sample Text</span>
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: "'Roboto Mono', monospace", fontWeight: 600 }}>{ratio}:1</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ color: aaNormal ? '#166534' : '#991B1B', fontWeight: 600 }}>{aaNormal ? 'Pass' : 'Fail'}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ color: aaLarge ? '#166534' : '#991B1B', fontWeight: 600 }}>{aaLarge ? 'Pass' : 'Fail'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Dark Mode Guidelines</h2>
            <div style={{ background: '#0F1729', borderRadius: 8, padding: 24, color: '#E2E8F0' }}>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 12px' }}>Use <span style={{ fontFamily: "'Roboto Mono', monospace", background: '#1E293B', padding: '2px 6px', borderRadius: 4 }}>#0F1729</span> as the primary dark background — not pure black.</p>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 12px' }}>Slightly desaturate SA Gold for dark backgrounds to reduce visual vibration.</p>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>Use <span style={{ fontFamily: "'Roboto Mono', monospace", background: '#1E293B', padding: '2px 6px', borderRadius: 4 }}>#E2E8F0</span> for primary text on dark backgrounds.</p>
            </div>
          </div>
          <div>
            <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Color Do's & Don'ts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#166534' }}>Use gold sparingly as an accent for CTAs and highlights</div>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#166534' }}>Use black badge on light backgrounds, white badge on dark</div>
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#991B1B' }}>Don't use gold for large blocks of text or backgrounds</div>
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#991B1B' }}>Don't use pure black (#000) as a background — use Dark Navy instead</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
