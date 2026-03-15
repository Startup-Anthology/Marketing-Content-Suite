import './_group.css';

const voiceAttributes = [
  { attribute: "Empowering", description: "Gives confidence and control", example: '"Take control of your financial destiny"' },
  { attribute: "Supportive", description: "Acts as a partner, not a vendor", example: '"Your partner in navigating the complex world of startup finance"' },
  { attribute: "Honest", description: "Transparent and realistic", example: '"See your financial reality clearly, not through rose-colored glasses"' },
  { attribute: "Accessible", description: "No jargon, no gatekeeping", example: '"Financial modeling shouldn\'t require a finance degree"' },
  { attribute: "Action-Oriented", description: "Direct and practical", example: '"Stop fighting your spreadsheet"' },
  { attribute: "Builder-Centric", description: "Celebrates operators and doers", example: '"Built for the operators, the visionaries, and the unsung heroes"' },
];

const toneSpectrum = [
  { context: "Marketing / Landing Pages", tone: "Confident, bold, aspirational", example: "Financial Modeling, without the spreadsheets." },
  { context: "Product UI", tone: "Clear, concise, helpful", example: "Your runway is 14 months at current burn rate." },
  { context: "Onboarding", tone: "Warm, encouraging, guiding", example: "Let's set up your first forecast. It only takes a few minutes." },
  { context: "Error / Support", tone: "Empathetic, solution-focused", example: "Something went wrong with your model. Let's fix it together." },
  { context: "Email / Updates", tone: "Personal, informative, actionable", example: "Your monthly KPIs are ready. Here's what changed." },
];

const doList = [
  'Use "you" and "your" to create personal connection',
  'Frame problems and solutions clearly (problem → solution)',
  'Focus on benefits and outcomes (clarity, confidence, accessibility)',
  'Be empathetic about struggles while offering practical solutions',
  'Speak to the operator — the person running the business',
];

const dontList = [
  "Use finance jargon or unnecessary complexity",
  "Sound corporate, stiff, or overly formal",
  "Make promises you can't back up with the product",
  "Talk down to users or assume they lack intelligence",
  "Use passive voice when active voice is clearer",
];

export function BrandVoice() {
  return (
    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", background: '#FFFFFF', minHeight: '100vh', padding: '48px', color: '#0F1729' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ borderBottom: '3px solid #BB935B', paddingBottom: 16, marginBottom: 40 }}>
          <div style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 14, fontWeight: 600, color: '#BB935B', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Startup Anthology Brand Guide</div>
          <h1 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 42, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>Brand Overview & Voice</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ background: '#0F1729', borderRadius: 12, padding: 32, color: '#FFFFFF', height: '100%' }}>
              <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#BB935B', marginBottom: 16 }}>Tagline</div>
              <p style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 32, fontWeight: 700, margin: '0 0 24px', lineHeight: 1.2 }}>Educate. Equip. Elevate.</p>
              <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#BB935B', marginBottom: 16 }}>Mission</div>
              <p style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 16, lineHeight: 1.6, margin: '0 0 24px', color: '#E2E8F0' }}>
                Empowering entrepreneurs and small business owners who'd rather run their business than wrestle with it. We give them the tools and knowledge to focus on growth, not complexity.
              </p>
              <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#BB935B', marginBottom: 16 }}>Positioning</div>
              <p style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 16, lineHeight: 1.6, margin: 0, color: '#E2E8F0' }}>
                Championing the operators and doers who don't have time for spreadsheet headaches or financial jargon. We make professional financial tools accessible to everyone building something.
              </p>
            </div>
          </div>
          <div>
            <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 32, border: '1px solid #E2E8F0', height: '100%' }}>
              <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#BB935B', marginBottom: 16 }}>Core Messaging Framework</div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>For Entrepreneurs & Small Business Owners</div>
                <p style={{ fontSize: 14, color: '#5C6B7F', margin: 0, lineHeight: 1.6 }}>Your job isn't building spreadsheets. Horizon handles the financial modeling so you can focus on running your business.</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>For Pre-Revenue Teams</div>
                <p style={{ fontSize: 14, color: '#5C6B7F', margin: 0, lineHeight: 1.6 }}>Not making money yet? Model your burn rate, runway, and projected growth before your first dollar comes in.</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>For Real Estate & Contractors</div>
                <p style={{ fontSize: 14, color: '#5C6B7F', margin: 0, lineHeight: 1.6 }}>Track job pipelines, deposits, and material costs with a model built for how you actually work.</p>
              </div>
              <div>
                <div style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>For Founders Raising Capital</div>
                <p style={{ fontSize: 14, color: '#5C6B7F', margin: 0, lineHeight: 1.6 }}>Get investor-ready financial statements and KPIs without hiring an analyst.</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Voice Characteristics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {voiceAttributes.map((v) => (
              <div key={v.attribute} style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, background: '#FFFFFF' }}>
                <div style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 18, fontWeight: 700, color: '#BB935B', marginBottom: 8 }}>{v.attribute}</div>
                <p style={{ fontSize: 14, color: '#5C6B7F', margin: '0 0 12px', lineHeight: 1.5 }}>{v.description}</p>
                <p style={{ fontSize: 13, fontStyle: 'italic', color: '#0F1729', margin: 0, lineHeight: 1.5, fontFamily: "'Lora', serif" }}>{v.example}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Tone Spectrum</h2>
          <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#0F1729', color: '#FFFFFF' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif", fontWeight: 600 }}>Context</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif", fontWeight: 600 }}>Tone</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif", fontWeight: 600 }}>Example</th>
                </tr>
              </thead>
              <tbody>
                {toneSpectrum.map((t, i) => (
                  <tr key={t.context} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{t.context}</td>
                    <td style={{ padding: '12px 16px', color: '#5C6B7F' }}>{t.tone}</td>
                    <td style={{ padding: '12px 16px', fontStyle: 'italic', fontFamily: "'Lora', serif" }}>{t.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: 24 }}>
            <h3 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 20, fontWeight: 700, color: '#166534', marginTop: 0, marginBottom: 16 }}>Do</h3>
            <ul style={{ margin: 0, padding: '0 0 0 20px', fontSize: 14, lineHeight: 1.8, color: '#166534' }}>
              {doList.map((d) => <li key={d}>{d}</li>)}
            </ul>
          </div>
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: 24 }}>
            <h3 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 20, fontWeight: 700, color: '#991B1B', marginTop: 0, marginBottom: 16 }}>Don't</h3>
            <ul style={{ margin: 0, padding: '0 0 0 20px', fontSize: 14, lineHeight: 1.8, color: '#991B1B' }}>
              {dontList.map((d) => <li key={d}>{d}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
