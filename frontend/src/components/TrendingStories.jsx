export default function TrendingStories({ clusters, onSelectCluster }) {
  const trending = [...clusters]
    .sort((a, b) => (b.articleCount || b.articles?.length || 0) - (a.articleCount || a.articles?.length || 0))
    .slice(0, 5);

  if (!trending.length) return null;

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          🔥 Breaking
        </span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(16,33,58,0.1)' }} />
      </div>
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
        {trending.map((cluster, i) => {
          const article = cluster.articles?.[0];
          return (
            <button
              key={cluster.id || i}
              onClick={() => onSelectCluster(cluster)}
              style={{
                flexShrink: 0,
                width: '200px',
                padding: '14px',
                borderRadius: '18px',
                border: '2px solid var(--line)',
                background: i === 0 ? 'var(--yellow)' : 'rgba(255,255,255,0.82)',
                boxShadow: '4px 4px 0 rgba(16,33,58,0.08)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'transform 140ms ease, box-shadow 140ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translate(-2px,-2px)';
                e.currentTarget.style.boxShadow = '6px 6px 0 rgba(16,33,58,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translate(0,0)';
                e.currentTarget.style.boxShadow = '4px 4px 0 rgba(16,33,58,0.08)';
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                #{i + 1} Trending
              </div>
              <div style={{
                fontSize: '13px', fontWeight: 700, lineHeight: 1.35, color: 'var(--ink)',
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {article?.headline || article?.title || 'Story'}
              </div>
              {cluster.sources?.[0] && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                  {cluster.sources[0]}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
