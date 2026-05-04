export default function AIInsightsPanel({ cluster, onClose }) {
  if (!cluster) return null;

  const insight = cluster.ai_insight || {};
  const confidence = parseFloat(insight.confidence_score || 0.5);
  const confidencePct = Math.round(confidence * 100);
  const keyPoints = Array.isArray(insight.key_points) ? insight.key_points : [];
  const hasUsefulPoints = keyPoints.length > 0 && keyPoints[0] !== 'Information unavailable.';

  return (
    <div className="sketch-panel yellow" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header + close */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>
            🤖 AI Intelligence
          </div>
          <h3 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '1.05rem',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            color: 'var(--ink)',
          }}>
            {cluster.articles?.[0]?.headline || cluster.clusterTopic || 'Story Analysis'}
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: '28px', height: '28px', flexShrink: 0,
              borderRadius: '8px', border: '2px solid var(--line)',
              background: 'rgba(255,255,255,0.8)', fontWeight: 800, fontSize: '14px',
              display: 'grid', placeItems: 'center', cursor: 'pointer',
              boxShadow: '2px 2px 0 rgba(16,33,58,0.1)',
            }}
          >✕</button>
        )}
      </div>

      <div className="sketch-divider" />

      {/* Confidence bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>AI Confidence</span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ink)' }}>{confidencePct}%</span>
        </div>
        <div style={{ height: '7px', borderRadius: '999px', background: 'rgba(16,33,58,0.1)', overflow: 'hidden', border: '1px solid rgba(16,33,58,0.12)' }}>
          <div style={{
            height: '100%', width: `${confidencePct}%`,
            background: confidencePct > 70 ? '#15803d' : confidencePct > 40 ? '#d97706' : '#b91c1c',
            borderRadius: '999px', transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* Why it matters */}
      {insight.why_it_matters && insight.why_it_matters !== 'Details needed for impact analysis.' && (
        <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(16,33,58,0.1)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
            Why It Matters
          </div>
          <p style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
            {insight.why_it_matters}
          </p>
        </div>
      )}

      {/* Key points */}
      {hasUsefulPoints && (
        <div>
          <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
            Key Points
          </div>
          <ul style={{ paddingLeft: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '7px', listStyle: 'none' }}>
            {keyPoints.map((pt, i) => (
              <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6 }}>
                <span style={{
                  flexShrink: 0, width: '20px', height: '20px',
                  borderRadius: '6px', background: 'var(--yellow)',
                  border: '1.5px solid rgba(16,33,58,0.15)',
                  display: 'grid', placeItems: 'center',
                  fontSize: '10px', fontWeight: 800,
                }}>{i + 1}</span>
                {pt}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="sketch-divider" />

      {/* Cluster meta badges */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span className="sketch-badge">{cluster.articleCount || cluster.articles?.length || 1} articles</span>
        <span className="sketch-badge blue" style={{ textTransform: 'capitalize' }}>{cluster.clusterTopic}</span>
        {cluster.articles?.[0]?.sentiment && (
          <span className={`sketch-badge ${cluster.articles[0].sentiment === 'positive' ? 'green' : cluster.articles[0].sentiment === 'negative' ? 'rose' : ''}`}>
            {cluster.articles[0].sentiment}
          </span>
        )}
      </div>
    </div>
  );
}
