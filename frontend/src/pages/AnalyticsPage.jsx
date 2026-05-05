import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchDigest } from '../services/api';

const SENTIMENT_COLORS = { positive: '#15803d', neutral: '#b8c7d9', negative: '#b91c1c' };
const TOPIC_COLORS = ['#fde047', '#d4e8ff', '#f5d1da', '#d9ecd2', '#ffd8c8', '#e0e7ff', '#f3e8ff', '#ffe4b8'];

const SketchTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '2px solid #10213a', borderRadius: '12px', padding: '10px 14px', fontSize: '13px', fontWeight: 700, boxShadow: '4px 4px 0 rgba(16,33,58,0.1)' }}>
      {label && <div style={{ color: 'var(--muted)', marginBottom: '4px', textTransform: 'capitalize', fontWeight: 600 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--ink)' }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  );
};

const StatCard = ({ emoji, value, label, tone }) => (
  <div className={`sketch-panel ${tone || ''}`} style={{ padding: '24px 22px' }}>
    <div style={{ fontSize: '28px', marginBottom: '10px' }}>{emoji}</div>
    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2.4rem', fontWeight: 400, letterSpacing: '-0.03em', color: 'var(--ink)', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px', fontWeight: 500 }}>{label}</div>
  </div>
);

export default function AnalyticsPage() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDigest({ page: 1, limit: 50 }).then(d => {
      setClusters(d.clusters || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Compute metrics
  const totalArticles = clusters.reduce((s, c) => s + (c.articleCount || c.articles?.length || 0), 0);
  const allSources = new Set(clusters.flatMap(c => c.sources || []));
  const sentimentCounts = clusters.reduce((acc, c) => {
    const s = c.articles?.[0]?.sentiment || 'neutral';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, { positive: 0, neutral: 0, negative: 0 });

  const sentimentData = Object.entries(sentimentCounts).map(([name, value]) => ({ name, value }));
  const positivityRate = totalArticles
    ? Math.round((sentimentCounts.positive / clusters.length) * 100)
    : 0;

  // Topic breakdown
  const topicMap = clusters.reduce((acc, c) => {
    const t = c.clusterTopic || 'general';
    acc[t] = (acc[t] || 0) + (c.articleCount || c.articles?.length || 1);
    return acc;
  }, {});
  const topicData = Object.entries(topicMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));

  // Source breakdown
  const sourceMap = clusters.reduce((acc, c) => {
    (c.sources || []).forEach(s => { acc[s] = (acc[s] || 0) + (c.articleCount || 1); });
    return acc;
  }, {});
  const sourceData = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

  // Article topic tags frequency
  const tagMap = {};
  clusters.forEach(c => c.articles?.forEach(a => (a.topics || []).forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; })));
  const tagData = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));

  // Confidence distribution
  const confidenceBuckets = { 'Low (0–40%)': 0, 'Medium (40–70%)': 0, 'High (70–100%)': 0 };
  clusters.forEach(c => {
    const score = parseFloat(c.articles?.[0]?.confidence_score || 0.5);
    if (score < 0.4) confidenceBuckets['Low (0–40%)']++;
    else if (score < 0.7) confidenceBuckets['Medium (40–70%)']++;
    else confidenceBuckets['High (70–100%)']++;
  });
  const confidenceData = Object.entries(confidenceBuckets).map(([name, value]) => ({ name, value }));

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div style={{ fontSize: '40px' }}>📊</div>
        <p style={{ color: 'var(--muted)', fontWeight: 600 }}>Loading analytics…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 28px 80px' }}>

      {/* Page header */}
      <div style={{ padding: '32px 0 24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
          Intelligence Dashboard
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--ink)', marginBottom: '10px' }}>
          Analytics Overview
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '16px', lineHeight: 1.7 }}>
          Real-time insights across {clusters.length} story clusters from {allSources.size} active sources.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <StatCard emoji="📰" value={totalArticles} label="Total Articles" tone="yellow" />
        <StatCard emoji="📡" value={allSources.size} label="Active Sources" tone="blue" />
        <StatCard emoji="🗂" value={clusters.length} label="Story Clusters" />
        <StatCard emoji="✅" value={`${positivityRate}%`} label="Positive Coverage" tone="rose" />
      </div>

      {/* Row 1: Sentiment + Topic */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '16px', marginBottom: '16px' }}>

        {/* Sentiment Pie */}
        <div className="sketch-panel rose" style={{ padding: '26px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>Sentiment Analysis</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '20px' }}>How the news feels</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={sentimentData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={28} paddingAngle={4}>
                  {sentimentData.map(e => <Cell key={e.name} fill={SENTIMENT_COLORS[e.name]} stroke="rgba(255,255,255,0.8)" strokeWidth={3} />)}
                </Pie>
                <Tooltip content={<SketchTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sentimentData.map(e => (
                <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: SENTIMENT_COLORS[e.name], display: 'inline-block', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'capitalize', color: 'var(--ink)' }}>{e.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{e.value} clusters</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Topic bar */}
        <div className="sketch-panel yellow" style={{ padding: '26px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>Topic Distribution</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '20px' }}>Top categories by article count</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topicData} margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--ink)' }} axisLine={false} tickLine={false} tickFormatter={v => v.charAt(0).toUpperCase() + v.slice(1, 8)} />
              <YAxis hide />
              <Tooltip content={<SketchTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Articles">
                {topicData.map((_, i) => <Cell key={i} fill={TOPIC_COLORS[i % TOPIC_COLORS.length]} stroke="rgba(16,33,58,0.15)" strokeWidth={1} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Tag Cloud + Source Breakdown + Confidence */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Top AI tags */}
        <div className="sketch-panel blue" style={{ padding: '26px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>Trending Tags</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '18px' }}>Most frequent AI-extracted tags</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {tagData.map((t, i) => (
              <span key={t.name} style={{
                padding: '7px 14px', borderRadius: '999px',
                fontSize: Math.max(11, 15 - i) + 'px',
                fontWeight: 700,
                background: TOPIC_COLORS[i % TOPIC_COLORS.length],
                border: '1.5px solid rgba(16,33,58,0.15)',
                color: 'var(--ink)',
                textTransform: 'capitalize',
              }}>
                {t.name} <span style={{ fontSize: '11px', opacity: 0.6 }}>×{t.value}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Source breakdown */}
        <div className="sketch-panel" style={{ padding: '26px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>Sources</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '18px' }}>Coverage by source</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sourceData.map((s, i) => {
              const max = sourceData[0]?.value || 1;
              const pct = Math.round((s.value / max) * 100);
              return (
                <div key={s.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{s.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>{s.value} stories</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(16,33,58,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: TOPIC_COLORS[i % TOPIC_COLORS.length], borderRadius: '999px', border: '1px solid rgba(16,33,58,0.1)', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Confidence */}
        <div className="sketch-panel" style={{ padding: '26px', background: 'linear-gradient(180deg, rgba(217,236,210,0.6), rgba(255,252,247,0.95))' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>AI Quality</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '18px' }}>Confidence distribution</h2>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={confidenceData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600, fill: 'var(--muted)' }} axisLine={false} tickLine={false} tickFormatter={v => v.split(' ')[0]} />
              <YAxis hide />
              <Tooltip content={<SketchTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Clusters">
                <Cell fill="#f5d1da" stroke="rgba(16,33,58,0.15)" strokeWidth={1} />
                <Cell fill="#fde047" stroke="rgba(16,33,58,0.15)" strokeWidth={1} />
                <Cell fill="#d9ecd2" stroke="rgba(16,33,58,0.15)" strokeWidth={1} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(16,33,58,0.1)', fontSize: '13px', color: 'var(--muted)' }}>
            {confidenceBuckets['High (70–100%)']} of {clusters.length} clusters scored high confidence
          </div>
        </div>
      </div>

      {/* Key insights panel */}
      <div className="sketch-panel yellow" style={{ padding: '28px 32px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>🤖 AI Summary</div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', fontWeight: 400, letterSpacing: '-0.02em', marginBottom: '16px' }}>Today's Digest at a Glance</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { icon: '📊', title: 'Coverage Breadth', body: `${clusters.length} clustered stories spanning ${Object.keys(topicMap).length} unique topics, sourced from ${allSources.size} independent outlets.` },
            { icon: '🎭', title: 'Sentiment Balance', body: `${sentimentCounts.neutral} neutral · ${sentimentCounts.positive} positive · ${sentimentCounts.negative} negative. The majority of today's coverage maintains a neutral journalistic tone.` },
            { icon: '🔬', title: 'AI Processing', body: `${confidenceBuckets['High (70–100%)']} high-confidence summaries generated by Groq (Llama 3.3 70B). All articles enriched with key points, sentiment, and topic tags.` },
          ].map(c => (
            <div key={c.title} style={{ padding: '18px', borderRadius: '16px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(16,33,58,0.12)' }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px', color: 'var(--ink)' }}>{c.title}</div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
