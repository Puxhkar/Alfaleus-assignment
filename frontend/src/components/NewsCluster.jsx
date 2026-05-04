import { useState } from 'react';
import ArticleCard from './ArticleCard';

const TONE_MAP = {
  technology: 'blue', business: 'yellow', science: 'blue',
  health: 'rose', politics: 'rose', entertainment: '', general: '',
};
const EMOJI_MAP = {
  technology: '💻', business: '📊', science: '🔬',
  health: '🏥', politics: '🏛️', sports: '⚽',
  entertainment: '🎬', general: '📰',
};

function ReadingTime({ text }) {
  const words = (text || '').split(' ').length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 500 }}>{mins} min read</span>;
}

function SentimentChip({ sentiment }) {
  const config = {
    positive: { bg: 'var(--green-soft)', color: '#15803d', icon: '↑' },
    negative: { bg: 'var(--rose-soft)', color: '#b91c1c', icon: '↓' },
    neutral:  { bg: 'rgba(16,33,58,0.07)', color: 'var(--muted)', icon: '—' },
  }[sentiment] || { bg: 'rgba(16,33,58,0.07)', color: 'var(--muted)', icon: '—' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '4px 10px', borderRadius: '999px',
      background: config.bg, color: config.color,
      fontSize: '12px', fontWeight: 700, border: '1px solid rgba(16,33,58,0.1)',
    }}>
      {config.icon} {sentiment}
    </span>
  );
}

export default function NewsCluster({ cluster, isActive, onSelect, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [bookmarked, setBookmarked] = useState(false);

  const topic = cluster.clusterTopic?.toLowerCase() || 'general';
  const tone = TONE_MAP[topic] || '';
  const emoji = EMOJI_MAP[topic] || '📰';
  const articles = cluster.articles || [];
  const primary = articles[0];
  const rest = articles.slice(1);

  const sentiment = primary?.sentiment || 'neutral';
  const formattedDate = primary?.publishedAt
    ? new Date(primary.publishedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : null;

  const handleBookmark = (e) => {
    e.stopPropagation();
    setBookmarked(b => !b);
  };

  return (
    <article
      className={`sketch-panel ${tone}`}
      style={{
        padding: '28px 30px',
        cursor: 'pointer',
        borderColor: isActive ? 'var(--accent)' : 'var(--line)',
        boxShadow: isActive ? '8px 8px 0 rgba(242,111,82,0.2)' : '8px 8px 0 rgba(16,33,58,0.08)',
        transition: 'all 160ms ease',
        transform: isActive ? 'translate(-2px,-2px)' : 'translate(0,0)',
      }}
      onClick={() => onSelect(isActive ? null : cluster)}
    >
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
        {/* Icon */}
        <div style={{
          width: '52px', height: '52px', flexShrink: 0,
          borderRadius: '16px', border: '2px solid var(--line)',
          background: 'rgba(255,255,255,0.85)',
          display: 'grid', placeItems: 'center', fontSize: '24px',
          boxShadow: '3px 3px 0 rgba(16,33,58,0.08)',
        }}>
          {emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Meta pills row */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
            <span className="sketch-badge" style={{ textTransform: 'capitalize', background: 'rgba(255,255,255,0.8)' }}>
              {topic}
            </span>
            <SentimentChip sentiment={sentiment} />
            {articles.length > 1 && (
              <span className="sketch-badge blue">{articles.length} sources</span>
            )}
            {formattedDate && (
              <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '4px' }}>{formattedDate}</span>
            )}
          </div>

          {/* Headline */}
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: expanded ? '1.45rem' : '1.2rem',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            color: 'var(--ink)',
            transition: 'font-size 200ms ease',
          }}>
            {primary?.headline || primary?.title || 'Untitled Story'}
          </h2>
        </div>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          title={bookmarked ? 'Remove bookmark' : 'Save story'}
          style={{
            fontSize: '18px', flexShrink: 0,
            opacity: bookmarked ? 1 : 0.35,
            transition: 'opacity 150ms ease',
            color: bookmarked ? 'var(--accent)' : 'inherit',
          }}
        >
          🔖
        </button>
      </div>

      {/* ─── Summary ─── */}
      {primary?.summary && (
        <p style={{
          fontSize: '15px',
          color: '#3a4a5c',
          lineHeight: 1.8,
          marginBottom: '16px',
          display: '-webkit-box',
          WebkitLineClamp: expanded ? 'unset' : 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {primary.summary}
        </p>
      )}

      {/* ─── Expanded rich content ─── */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Why it Matters */}
          {primary?.why_it_matters && primary.why_it_matters !== 'Details needed for impact analysis.' && (
            <div style={{
              padding: '16px 18px',
              borderRadius: '14px',
              background: 'rgba(253,224,71,0.25)',
              border: '1.5px solid rgba(16,33,58,0.12)',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                💡 Why It Matters
              </div>
              <p style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                {primary.why_it_matters}
              </p>
            </div>
          )}

          {/* Key Points */}
          {Array.isArray(primary?.key_points) && primary.key_points[0] !== 'Information unavailable.' && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
                📌 Key Points
              </div>
              <ul style={{ paddingLeft: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none' }}>
                {primary.key_points.map((pt, i) => (
                  <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '14px', color: 'var(--ink)', lineHeight: 1.65 }}>
                    <span style={{
                      flexShrink: 0, width: '24px', height: '24px',
                      borderRadius: '8px', background: 'var(--yellow)',
                      border: '2px solid rgba(16,33,58,0.15)',
                      display: 'grid', placeItems: 'center',
                      fontSize: '11px', fontWeight: 800, color: 'var(--ink)',
                    }}>{i + 1}</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Article image */}
          {primary?.urlToImage && (
            <img
              src={primary.urlToImage}
              alt={primary.headline || 'Article image'}
              style={{
                width: '100%', height: '220px', objectFit: 'cover',
                borderRadius: '14px', border: '2px solid rgba(16,33,58,0.1)',
              }}
              onError={e => e.target.style.display = 'none'}
            />
          )}

          {/* Related Coverage */}
          {rest.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
                📎 Related Coverage ({rest.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {rest.map((article, i) => (
                  <ArticleCard key={i} article={article} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Footer ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '18px', flexWrap: 'wrap', gap: '10px' }}>
        {/* Source chips + read time */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {(cluster.sources || []).map(src => (
            <span key={src} style={{
              fontSize: '12px', fontWeight: 600, color: 'var(--muted)',
              background: 'rgba(255,255,255,0.7)', padding: '3px 10px',
              borderRadius: '999px', border: '1px solid rgba(16,33,58,0.1)',
            }}>{src}</span>
          ))}
          {primary?.summary && <ReadingTime text={primary.summary + ' ' + (primary.key_points?.join(' ') || '')} />}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="sketch-btn"
            style={{ minHeight: '34px', padding: '0 14px', fontSize: '13px' }}
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            {expanded ? '↑ Collapse' : '↓ Expand'}
          </button>
          {primary?.url && (
            <a
              href={primary.url}
              target="_blank"
              rel="noopener noreferrer"
              className="sketch-btn primary"
              style={{ minHeight: '34px', padding: '0 14px', fontSize: '13px' }}
              onClick={e => e.stopPropagation()}
            >
              Read Full →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
