import { useState } from 'react';

function getBookmarks() {
  try { return JSON.parse(localStorage.getItem('news_bookmarks') || '[]'); } catch { return []; }
}

function toggleBookmark(url) {
  const saved = getBookmarks();
  const next = saved.includes(url) ? saved.filter(u => u !== url) : [...saved, url];
  localStorage.setItem('news_bookmarks', JSON.stringify(next));
  return next.includes(url);
}

export default function ArticleCard({ article }) {
  const [bookmarked, setBookmarked] = useState(() => getBookmarks().includes(article.url));

  const handleBookmark = (e) => {
    e.preventDefault();
    const isNow = toggleBookmark(article.url);
    setBookmarked(isNow);
  };

  const readTime = Math.max(1, Math.ceil((article.summary || '').split(' ').length / 200));

  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: '16px',
      background: 'rgba(255,255,255,0.78)',
      border: '1px solid rgba(16,33,58,0.12)',
      boxShadow: '4px 4px 0 rgba(16,33,58,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontWeight: 700,
            fontSize: '14px',
            lineHeight: 1.4,
            color: 'var(--ink)',
            textDecoration: 'none',
            flex: 1,
          }}
          onMouseEnter={e => e.target.style.color = 'var(--accent)'}
          onMouseLeave={e => e.target.style.color = 'var(--ink)'}
        >
          {article.headline || article.title}
        </a>
        <button
          onClick={handleBookmark}
          title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          style={{
            fontSize: '16px',
            opacity: bookmarked ? 1 : 0.4,
            transition: 'opacity 150ms ease',
            flexShrink: 0,
          }}
        >
          {bookmarked ? '🔖' : '🔖'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>{article.sourceName}</span>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>·</span>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{readTime} min read</span>
        {article.publishedAt && (
          <>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>·</span>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
              {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </>
        )}
      </div>

      {article.summary && (
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>
          {article.summary}
        </p>
      )}
    </div>
  );
}
