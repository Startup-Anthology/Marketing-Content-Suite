import './_group.css';

const logoVariants = [
  { name: "Vertical Badge (Icon Only)", description: "The standalone rocket icon badge without any text.", usage: "Compact spaces, social media profile pictures, and application icons where the brand is already established.", lightFile: "v-badge-black.png", darkFile: "icon-white.png" },
  { name: "Vertical Badge + Wordmark (Black)", description: 'The icon badge positioned above the "STARTUP ANTHOLOGY" wordmark in black.', usage: "The primary logo for most light-background applications.", lightFile: "v-badge-black-text.png", darkFile: "v-white.png" },
  { name: "Vertical Badge + Gold Wordmark", description: "The icon badge with the wordmark in Startup Anthology Gold.", usage: "Reserved for premium materials or instances where special emphasis is desired.", lightFile: "v-badge-black-gold.png", darkFile: "v-badge-white-gold.png" },
  { name: "Vertical Badge + Gold Background", description: "The vertical badge on a Startup Anthology Gold background.", usage: "Branded merchandise, signage, and high-visibility placements.", lightFile: "v-badge-black-gold-bg.png", darkFile: "v-badge-black-gold-bg.png" },
  { name: "Horizontal Badge + Wordmark", description: 'The icon badge positioned to the left of the "STARTUP ANTHOLOGY" wordmark.', usage: "Best for wide layouts such as website headers and banners.", lightFile: "h-badge-black.png", darkFile: "h-white.png" },
];

const allFiles = [
  { file: "v-badge-black.png", label: "Vertical Badge (Black)" },
  { file: "v-badge-black-text.png", label: "Vertical Badge + Text (Black)" },
  { file: "v-badge-black-gold.png", label: "Vertical Badge + Gold Text" },
  { file: "v-badge-black-gold-bg.png", label: "Vertical Badge on Gold BG" },
  { file: "v-white.png", label: "Vertical (White)" },
  { file: "v-badge-white-gold.png", label: "Vertical White + Gold Text" },
  { file: "icon-white.png", label: "Icon Only (White)" },
  { file: "h-badge-black.png", label: "Horizontal (Black)" },
  { file: "h-white.png", label: "Horizontal (White)" },
];

const incorrectUsage = [
  "Don't stretch or distort the logo proportions",
  "Don't place on busy or patterned backgrounds without sufficient contrast",
  "Don't change the logo colors outside of the approved variants",
  "Don't rotate or flip the logo",
  "Don't add drop shadows or effects to the logo",
  "Don't place the logo smaller than 32px (icon) or 80px (with wordmark)",
];

export function LogoIdentity() {
  return (
    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", background: '#FFFFFF', minHeight: '100vh', padding: '48px', color: '#000000' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ borderBottom: '3px solid #BB935B', paddingBottom: 16, marginBottom: 40 }}>
          <div style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 14, fontWeight: 600, color: '#BB935B', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Startup Anthology Brand Guide</div>
          <h1 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 42, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>Logo & Identity</h1>
        </div>

        <p style={{ fontSize: 16, color: '#5C6B7F', lineHeight: 1.6, marginBottom: 32, maxWidth: 800 }}>
          The Startup Anthology logo is a key element of our brand identity. It is available in several configurations to suit different contexts and layouts. Consistent and correct application is essential.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 48 }}>
          {logoVariants.map((v) => (
            <div key={v.name} style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{v.name}</div>
                <p style={{ fontSize: 13, color: '#5C6B7F', margin: '0 0 4px' }}>{v.description}</p>
                <p style={{ fontSize: 12, color: '#BB935B', margin: 0, fontWeight: 600 }}>{v.usage}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 180 }}>
                <div style={{ background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, border: '1px solid #F1F5F9' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Light Background</div>
                    <img
                      src={`/__mockup/images/logos/${v.lightFile}`}
                      alt={`${v.name} on light`}
                      style={{ maxHeight: 120, maxWidth: 240, objectFit: 'contain' }}
                    />
                  </div>
                </div>
                <div style={{ background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Dark Background</div>
                    <img
                      src={`/__mockup/images/logos/${v.darkFile}`}
                      alt={`${v.name} on dark`}
                      style={{ maxHeight: 120, maxWidth: 240, objectFit: 'contain' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
          <div>
            <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Clear Space & Minimum Size</h2>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: 8, padding: 32, marginBottom: 16, position: 'relative' }}>
                <div style={{ border: '2px dashed #BB935B', padding: 24, borderRadius: 8 }}>
                  <img src="/__mockup/images/logos/v-badge-black.png" alt="Logo with clear space" style={{ height: 64, display: 'block' }} />
                </div>
                <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 11, color: '#BB935B', fontWeight: 600 }}>Clear space = 1x icon height</div>
              </div>
              <div style={{ fontSize: 13, color: '#5C6B7F', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 8px' }}><strong style={{ color: '#000000' }}>Clear space:</strong> Maintain a minimum clear space around the logo equal to the height of the icon badge on all sides.</p>
                <p style={{ margin: '0 0 8px' }}><strong style={{ color: '#000000' }}>Icon minimum:</strong> 32px height</p>
                <p style={{ margin: 0 }}><strong style={{ color: '#000000' }}>Full logo minimum:</strong> 80px width (with wordmark)</p>
              </div>
            </div>
          </div>
          <div>
            <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Color Application</h2>
            <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#000', flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 13, color: '#5C6B7F', margin: 0, lineHeight: 1.5 }}>Use the <strong style={{ color: '#000000' }}>black badge</strong> and wordmark on light backgrounds (white, light gray).</p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#FFF', border: '1px solid #E2E8F0', flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 13, color: '#5C6B7F', margin: 0, lineHeight: 1.5 }}>Use the <strong style={{ color: '#000000' }}>white badge</strong> and wordmark on dark backgrounds (black, dark images).</p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#BB935B', flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 13, color: '#5C6B7F', margin: 0, lineHeight: 1.5 }}>The <strong style={{ color: '#000000' }}>gold wordmark</strong> variant is versatile and can be used on both light and dark backgrounds.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>All 9 Logo Files</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {allFiles.map((f) => {
              const isDark = f.file.includes('white') || f.file.includes('gold-bg');
              return (
                <div key={f.file} style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ background: isDark ? '#000000' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, minHeight: 80, border: isDark ? 'none' : '1px solid #F1F5F9' }}>
                    <img src={`/__mockup/images/logos/${f.file}`} alt={f.label} style={{ maxHeight: 60, maxWidth: 180, objectFit: 'contain' }} />
                  </div>
                  <div style={{ padding: '8px 12px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontSize: 10, fontFamily: "'Roboto Mono', monospace", color: '#999' }}>{f.file}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Incorrect Usage</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {incorrectUsage.map((item) => (
            <div key={item} style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#991B1B', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>&#10007;</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
