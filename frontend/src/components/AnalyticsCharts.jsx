import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SENTIMENT_COLORS = { positive: '#15803d', neutral: '#94a3b8', negative: '#b91c1c' };
const TOPIC_COLORS = ['#fde047', '#d4e8ff', '#f5d1da', '#d9ecd2', '#ffd8c8', '#e0e7ff'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', border: '2px solid var(--line)', borderRadius: '12px', padding: '8px 14px', fontSize: '13px', fontWeight: 700, boxShadow: '4px 4px 0 rgba(16,33,58,0.08)' }}>
        {label && <div style={{ color: 'var(--muted)', marginBottom: '2px', textTransform: 'capitalize' }}>{label}</div>}
        <div style={{ color: 'var(--ink)' }}>{payload[0].name}: <strong>{payload[0].value}</strong></div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsCharts({ clusters }) {
  const sentimentCounts = clusters.reduce((acc, c) => {
    const s = c.articles?.[0]?.sentiment || 'neutral';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const sentimentData = Object.entries(sentimentCounts).map(([name, value]) => ({ name, value }));

  const topicCounts = clusters.reduce((acc, c) => {
    const t = c.clusterTopic || 'general';
    acc[t] = (acc[t] || 0) + (c.articleCount || c.articles?.length || 1);
    return acc;
  }, {});

  const topicData = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {/* Sentiment Pie */}
      <div className="sketch-panel rose" style={{ padding: '22px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>
          Sentiment Breakdown
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie data={sentimentData} dataKey="value" cx="50%" cy="50%" outerRadius={52} paddingAngle={3} innerRadius={20}>
                {sentimentData.map((entry) => (
                  <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name] || '#94a3b8'} stroke="rgba(255,255,255,0.8)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sentimentData.map(entry => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 600 }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: SENTIMENT_COLORS[entry.name], display: 'inline-block', flexShrink: 0 }} />
                <span style={{ textTransform: 'capitalize', color: 'var(--ink)' }}>{entry.name}</span>
                <span style={{ color: 'var(--muted)', marginLeft: 'auto', paddingLeft: '8px', fontWeight: 700 }}>{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Bar */}
      <div className="sketch-panel blue" style={{ padding: '22px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px' }}>
          Top Topics by Articles
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={topicData} layout="vertical" margin={{ left: 0, right: 12, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category" dataKey="name" width={80}
              tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--ink)', textTransform: 'capitalize' }}
              axisLine={false} tickLine={false}
              tickFormatter={v => v.charAt(0).toUpperCase() + v.slice(1)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {topicData.map((_, i) => (
                <Cell key={i} fill={TOPIC_COLORS[i % TOPIC_COLORS.length]} stroke="rgba(16,33,58,0.15)" strokeWidth={1} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
