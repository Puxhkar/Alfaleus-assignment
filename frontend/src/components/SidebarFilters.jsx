export default function SidebarFilters({
  topics,
  activeFilter,
  onFilterChange,
  sources,
  activeSource,
  onSourceChange,
  showBookmarks,
  onToggleBookmarks,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Bookmarks */}
      <div className="sketch-panel" style={{ padding: '18px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
          Library
        </div>
        <button
          className={`sketch-chip${showBookmarks ? ' active' : ''}`}
          style={{ width: '100%', justifyContent: 'flex-start', gap: '8px' }}
          onClick={onToggleBookmarks}
        >
          🔖 Saved Stories
        </button>
      </div>

      {/* Topics */}
      <div className="sketch-panel yellow" style={{ padding: '18px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
          Topics
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            className={`sketch-chip${activeFilter === 'all' ? ' active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
            onClick={() => onFilterChange('all')}
          >
            All Topics
          </button>
          {topics.map((t) => (
            <button
              key={t}
              className={`sketch-chip${activeFilter === t ? ' active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', textTransform: 'capitalize' }}
              onClick={() => onFilterChange(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <div className="sketch-panel blue" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
            Sources
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              className={`sketch-chip${activeSource === 'all' ? ' active' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start' }}
              onClick={() => onSourceChange('all')}
            >
              All Sources
            </button>
            {sources.map((s) => (
              <button
                key={s}
                className={`sketch-chip${activeSource === s ? ' active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => onSourceChange(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
