export default function DashboardMetrics({ totalArticles, totalClusters, clusters }) {
  const sentimentCounts = clusters.reduce(
    (acc, c) => {
      const s = c.articles?.[0]?.sentiment || 'neutral';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  const allTopics = clusters.flatMap(c => c.clusterTopic ? [c.clusterTopic] : []);
  const topicFreq = allTopics.reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
  const trending = Object.entries(topicFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const allSources = new Set(clusters.flatMap(c => c.sources || []));

  const metrics = [
    { value: totalArticles, label: 'Articles Today', badge: '📰', color: 'yellow' },
    { value: allSources.size, label: 'Active Sources', badge: '📡', color: 'blue' },
    { value: totalClusters, label: 'Story Clusters', badge: '🗂', color: '' },
    { value: trending, label: 'Trending Topic', badge: '🔥', color: 'rose', isText: true },
    {
      value: `${sentimentCounts.positive}↑ ${sentimentCounts.negative}↓`,
      label: 'Sentiment Split',
      badge: '🎭',
      color: 'green',
      isText: true,
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
      gap: '14px',
      margin: '20px 0 24px',
    }}>
      {metrics.map((m) => (
        <div key={m.label} className="metric-tile sketch-panel" style={{ padding: '18px 16px' }}>
          <div style={{ fontSize: '22px', marginBottom: '8px' }}>{m.badge}</div>
          <div className="metric-value" style={{ fontSize: m.isText ? '1.1rem' : '1.8rem' }}>
            {m.value}
          </div>
          <div className="metric-label">{m.label}</div>
        </div>
      ))}
    </div>
  );
}
