import './_group.css';

const b2cSegments = [
  { segment: "Startup Employees & Managers", needs: "Seeking insights to navigate startup culture challenges. Early team members with equity who deserve visibility into financial health.", priority: "Primary" },
  { segment: "Aspiring Entrepreneurs", needs: "Access to a supportive community and mentorship to kickstart their journey. Willing to pay for networking and mentorship.", priority: "Secondary" },
  { segment: "Freelancers & Contractors", needs: "Seeking networking opportunities and skill development resources in the tech startup industry.", priority: "Secondary" },
  { segment: "Startup Enthusiasts", needs: "Stay updated on latest trends and innovations in the startup industry.", priority: "Secondary" },
];

const b2bSegments = [
  { segment: "Current Entrepreneurs & Founders", needs: "Use data insights to match employee types for different roles as the startup grows. Need to model growth, plan fundraising, and present financial projections.", priority: "Co-Primary" },
  { segment: "Angel Investors & VCs", needs: "Need data-driven insights to identify promising startups for investment. See value in cultural data for due diligence and portfolio management.", priority: "Secondary" },
];

const additionalSegments = [
  { segment: "Early-Stage Operators", description: "COOs, heads of finance, and operations leads who manage day-to-day financial planning for growing companies." },
  { segment: "Small Business Owners", description: "Entrepreneurs across industries (SaaS to real estate) who need structured financial forecasting." },
  { segment: "Pre-Revenue Builders", description: "Teams still validating their idea who need to model runway, burn rate, and projected growth." },
];

const brandPrinciples = [
  { title: "Target Audience", description: "Prioritize startup employees and managers as the primary audience, with founders as a co-primary focus. Content and messaging should resonate most strongly with those working within early-stage companies." },
  { title: "Brand Exclusivity", description: "All materials must exclusively feature Startup Anthology branding. Do not include or co-brand with other entities." },
  { title: "Strategic Use of Gold", description: "The Startup Anthology Gold color should be used sparingly and strategically as an accent. Its purpose is to draw attention to key information, highlight calls-to-action, and add a touch of premium quality. Avoid using it for large blocks of text or backgrounds." },
  { title: "Typographic Hierarchy", description: "Consistently apply the defined typographic system. The clear hierarchy of titles, headings, and body text guides the reader through the content and ensures a professional, polished presentation." },
  { title: "Voice Consistency", description: "Maintain an empowering, supportive, and accessible tone across all communications." },
  { title: "Mission Alignment", description: "Document and share the stories of entrepreneurs and small business owners who'd rather run their business than wrestle with complexity." },
];

export function AudiencePositioning() {
  return (
    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif", background: '#FFFFFF', minHeight: '100vh', padding: '48px', color: '#000000' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ borderBottom: '3px solid #BB935B', paddingBottom: 16, marginBottom: 40 }}>
          <div style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 14, fontWeight: 600, color: '#BB935B', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Startup Anthology Brand Guide</div>
          <h1 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 42, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>Audience & Positioning</h1>
        </div>

        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 16 }}>B2C Segments</h2>
          <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#000000', color: '#FFFFFF' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif", fontWeight: 600, width: '22%' }}>Segment</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif", fontWeight: 600 }}>Needs & Behaviors</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif", fontWeight: 600, width: '12%' }}>Priority</th>
                </tr>
              </thead>
              <tbody>
                {b2cSegments.map((s, i) => (
                  <tr key={s.segment} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{s.segment}</td>
                    <td style={{ padding: '12px 16px', color: '#5C6B7F', lineHeight: 1.5 }}>{s.needs}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: s.priority === 'Primary' ? '#BB935B' : '#E2E8F0', color: s.priority === 'Primary' ? '#FFFFFF' : '#5C6B7F', padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{s.priority}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 16 }}>B2B Segments</h2>
          <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#000000', color: '#FFFFFF' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif", fontWeight: 600, width: '22%' }}>Segment</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif", fontWeight: 600 }}>Needs & Behaviors</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: "'League Spartan', sans-serif", fontWeight: 600, width: '12%' }}>Priority</th>
                </tr>
              </thead>
              <tbody>
                {b2bSegments.map((s, i) => (
                  <tr key={s.segment} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{s.segment}</td>
                    <td style={{ padding: '12px 16px', color: '#5C6B7F', lineHeight: 1.5 }}>{s.needs}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: s.priority === 'Co-Primary' ? '#BB935B' : '#E2E8F0', color: s.priority === 'Co-Primary' ? '#FFFFFF' : '#5C6B7F', padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{s.priority}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Additional Audience Segments</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {additionalSegments.map((s) => (
              <div key={s.segment} style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 20 }}>
                <div style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.segment}</div>
                <p style={{ fontSize: 14, color: '#5C6B7F', margin: 0, lineHeight: 1.5 }}>{s.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Brand Focus Principles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {brandPrinciples.map((p, i) => (
              <div key={p.title} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 20, display: 'flex', gap: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#BB935B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'League Spartan', sans-serif", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{i + 1}</div>
                <div>
                  <div style={{ fontFamily: "'League Spartan', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{p.title}</div>
                  <p style={{ fontSize: 13, color: '#5C6B7F', margin: 0, lineHeight: 1.5 }}>{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
