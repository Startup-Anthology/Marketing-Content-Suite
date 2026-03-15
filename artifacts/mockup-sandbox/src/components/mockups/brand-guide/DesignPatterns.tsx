import './_group.css';

export function DesignPatterns() {
  return (
    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", background: '#FFFFFF', minHeight: '100vh', padding: '48px', color: '#000000' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ borderBottom: '3px solid #BB935B', paddingBottom: 16, marginBottom: 40 }}>
          <div style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 14, fontWeight: 600, color: '#BB935B', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Startup Anthology Brand Guide</div>
          <h1 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 42, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>Design Patterns & Brand in Action</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 48 }}>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>Button Styles</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Primary</div>
                <button style={{ background: '#BB935B', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '10px 20px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%' }}>Join the Beta - $25/mo</button>
                <div style={{ fontSize: 10, fontFamily: "'Roboto Mono', monospace", color: '#999', marginTop: 4 }}>bg: #BB935B, text: #FFF, radius: 6px</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Secondary</div>
                <button style={{ background: '#F7F9FA', color: '#000000', border: '1px solid #DFE1E3', borderRadius: 6, padding: '10px 20px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%' }}>See Live Demo</button>
                <div style={{ fontSize: 10, fontFamily: "'Roboto Mono', monospace", color: '#999', marginTop: 4 }}>bg: #F7F9FA, border: #DFE1E3, radius: 6px</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>On Dark</div>
                <div style={{ background: '#000000', borderRadius: 6, padding: 12 }}>
                  <button style={{ background: '#BB935B', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '10px 20px', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%' }}>Get Started</button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>Spacing System</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[4, 8, 12, 16, 20, 24, 32, 48].map((size) => (
                <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, fontFamily: "'Roboto Mono', monospace", color: '#5C6B7F', width: 36, textAlign: 'right' }}>{size}px</span>
                  <div style={{ height: 12, width: size * 3, background: '#BB935B', borderRadius: 2, opacity: 0.6 + (size / 80) }} />
                </div>
              ))}
              <p style={{ fontSize: 12, color: '#999', margin: '8px 0 0' }}>Base unit: 4px. All spacing increments in multiples of 4.</p>
            </div>
          </div>

          <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>Border Radius & Shadows</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 4 }} />
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>Small</div><div style={{ fontSize: 11, fontFamily: "'Roboto Mono', monospace", color: '#999' }}>4px</div></div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6 }} />
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>Default</div><div style={{ fontSize: 11, fontFamily: "'Roboto Mono', monospace", color: '#999' }}>6px (buttons, inputs)</div></div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8 }} />
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>Medium</div><div style={{ fontSize: 11, fontFamily: "'Roboto Mono', monospace", color: '#999' }}>8px (cards)</div></div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12 }} />
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>Large</div><div style={{ fontSize: 11, fontFamily: "'Roboto Mono', monospace", color: '#999' }}>12px (modals, panels)</div></div>
              </div>
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 12, marginTop: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Shadow</div>
                <div style={{ fontSize: 12, color: '#5C6B7F' }}>No shadows on buttons (flat design). Minimal shadow on elevated cards only when needed for depth.</div>
              </div>
            </div>
          </div>
        </div>

        <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Brand in Action</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ fontSize: 11, color: '#999', padding: '8px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: 1 }}>Hero Section</div>
            <div style={{ background: '#000000', padding: '40px 32px', color: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <img src="/__mockup/images/logos/icon-white.png" alt="SA" style={{ height: 28 }} />
                <span style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700, fontSize: 14, color: '#FFFFFF' }}>HORIZON</span>
                <span style={{ fontSize: 11, color: '#5C6B7F' }}>by Startup Anthology</span>
              </div>
              <h2 style={{ fontFamily: "'Lato', sans-serif", fontSize: 28, fontWeight: 700, fontStyle: 'italic', margin: '0 0 12px', lineHeight: 1.2 }}>Financial Modeling, without the spreadsheets.</h2>
              <p style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 14, color: '#94A3B8', margin: '0 0 20px', lineHeight: 1.6, maxWidth: 400 }}>Get forecasts you can trust, KPIs that actually help you decide, and professional financial statements.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ background: '#BB935B', color: '#FFF', border: 'none', borderRadius: 6, padding: '10px 16px', fontSize: 13, fontWeight: 600, fontFamily: "'Hanken Grotesk', sans-serif" }}>Join the Beta</button>
                <button style={{ background: 'transparent', color: '#FFF', border: '1px solid #334155', borderRadius: 6, padding: '10px 16px', fontSize: 13, fontWeight: 600, fontFamily: "'Hanken Grotesk', sans-serif" }}>See Demo</button>
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ fontSize: 11, color: '#999', padding: '8px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: 1 }}>Dashboard Card</div>
            <div style={{ background: '#F8FAFC', padding: '24px' }}>
              <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700, fontSize: 16 }}>Monthly Recurring Revenue</div>
                    <div style={{ fontSize: 12, color: '#5C6B7F' }}>Last 30 days</div>
                  </div>
                  <div style={{ background: '#F0FDF4', color: '#166534', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>+12.4%</div>
                </div>
                <div style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 32, fontWeight: 700, color: '#000000', marginBottom: 8 }}>$24,500</div>
                <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '68%', background: '#BB935B', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>68% of $36,000 target</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ fontSize: 11, color: '#999', padding: '8px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: 1 }}>Social Media Post</div>
            <div style={{ background: '#000000', padding: '32px 24px', color: '#FFFFFF', textAlign: 'center' }}>
              <img src="/__mockup/images/logos/icon-white.png" alt="SA" style={{ height: 32, marginBottom: 16 }} />
              <p style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 20, fontWeight: 700, margin: '0 0 8px', lineHeight: 1.3 }}>Your job isn't building spreadsheets.</p>
              <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 16px' }}>Let Horizon handle the financial modeling.</p>
              <div style={{ display: 'inline-block', background: '#BB935B', color: '#FFF', padding: '8px 20px', borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: "'Hanken Grotesk', sans-serif" }}>Try it free</div>
              <div style={{ marginTop: 16, fontSize: 11, color: '#5C6B7F' }}>horizon.startupanthology.com</div>
            </div>
          </div>

          <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ fontSize: 11, color: '#999', padding: '8px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: 1 }}>Email Header</div>
            <div style={{ background: '#FFFFFF', padding: '24px', borderBottom: '3px solid #BB935B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
                <img src="/__mockup/images/logos/v-badge-black.png" alt="SA" style={{ height: 28 }} />
                <span style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700, fontSize: 16, color: '#000000' }}>Startup Anthology</span>
              </div>
              <h3 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 22, fontWeight: 700, color: '#000000', margin: '0 0 8px' }}>Your monthly KPIs are ready</h3>
              <p style={{ fontSize: 14, color: '#5C6B7F', margin: '0 0 16px', lineHeight: 1.5 }}>Here's a quick look at how your business performed this month. Your MRR is up 12% and runway has extended to 14 months.</p>
              <button style={{ background: '#BB935B', color: '#FFF', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 13, fontWeight: 600, fontFamily: "'Hanken Grotesk', sans-serif", cursor: 'pointer' }}>View Full Dashboard</button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 40, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0', padding: 20 }}>
          <h3 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 12 }}>Design Tokens (CSS Custom Properties)</h3>
          <pre style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 12, lineHeight: 1.8, margin: 0, color: '#5C6B7F', whiteSpace: 'pre-wrap' }}>{`:root {
  --sa-gold: #BB935B;
  --sa-dark-navy: #000000;
  --sa-white: #FFFFFF;
  --sa-black: #000000;
  --sa-gray: #999999;
  --sa-bg-light: #F8FAFC;
  --sa-text-primary: #000000;
  --sa-text-secondary: #5C6B7F;
  --sa-border: #E2E8F0;
  --sa-radius-sm: 4px;
  --sa-radius-default: 6px;
  --sa-radius-md: 8px;
  --sa-radius-lg: 12px;
  --sa-spacing-unit: 4px;
  --sa-font-heading: 'League Spartan', sans-serif;
  --sa-font-body: 'Hanken Grotesk', sans-serif;
  --sa-font-title: 'Lato', sans-serif;
  --sa-font-subtitle: 'Montserrat', sans-serif;
  --sa-font-quote: 'Lora', serif;
}`}</pre>
        </div>
      </div>
    </div>
  );
}
