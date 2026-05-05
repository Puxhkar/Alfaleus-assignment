/**
 * TopicFilter — Horizontal scrollable pill buttons for topics + sentiment dropdown.
 * @param {{
 *   topics: string[],
 *   activeFilter: string,
 *   onFilterChange: (topic: string) => void,
 *   sentimentFilter: string,
 *   onSentimentChange: (s: string) => void
 * }} props
 */
export default function TopicFilter({
  topics,
  activeFilter,
  onFilterChange,
  sentimentFilter,
  onSentimentChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3" id="topic-filter">
      {/* Topic pills — scrollable row */}
      <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => onFilterChange('all')}
          className={`pill shrink-0 ${activeFilter === 'all' ? 'active' : ''}`}
        >
          All
        </button>

        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => onFilterChange(topic)}
            className={`pill shrink-0 ${activeFilter === topic ? 'active' : ''}`}
          >
            #{topic}
          </button>
        ))}
      </div>

      {/* Sentiment dropdown */}
      <div className="shrink-0 flex items-center gap-2">
        <label htmlFor="sentiment-select" className="text-xs text-muted font-body uppercase tracking-wider">
          Sentiment
        </label>
        <select
          id="sentiment-select"
          value={sentimentFilter}
          onChange={(e) => onSentimentChange(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-1.5
                     text-sm text-offwhite font-body
                     focus:outline-none focus:border-accent/50
                     cursor-pointer appearance-none
                     bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b6b7b%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%20%2F%3E%3C%2Fsvg%3E')]
                     bg-no-repeat bg-[position:right_0.5rem_center] bg-[size:1.25rem] pr-8"
        >
          <option value="all">All</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
      </div>

      {/* Active filters as removable tags */}
      {(activeFilter !== 'all' || sentimentFilter !== 'all') && (
        <div className="flex items-center gap-2 shrink-0">
          {activeFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-body border border-accent/20">
              #{activeFilter}
              <button
                onClick={() => onFilterChange('all')}
                className="ml-0.5 hover:text-offwhite transition-colors"
                aria-label={`Remove ${activeFilter} filter`}
              >
                ×
              </button>
            </span>
          )}
          {sentimentFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface2 text-cream text-xs font-body border border-border">
              {sentimentFilter}
              <button
                onClick={() => onSentimentChange('all')}
                className="ml-0.5 hover:text-offwhite transition-colors"
                aria-label={`Remove ${sentimentFilter} filter`}
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
