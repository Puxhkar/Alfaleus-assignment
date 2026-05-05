/**
 * SentimentBadge — Small pill displaying positive / neutral / negative sentiment.
 * @param {{ sentiment: 'positive' | 'neutral' | 'negative' }} props
 */

const CONFIG = {
  positive: { color: 'text-positive', bg: 'bg-positive/10', border: 'border-positive/20', dot: 'bg-positive' },
  neutral:  { color: 'text-neutral',  bg: 'bg-neutral/10',  border: 'border-neutral/20', dot: 'bg-neutral'  },
  negative: { color: 'text-negative', bg: 'bg-negative/10', border: 'border-negative/20', dot: 'bg-negative' },
};

export default function SentimentBadge({ sentiment }) {
  const s = sentiment?.toLowerCase() || 'neutral';
  const cfg = CONFIG[s] || CONFIG.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium font-body
                  ${cfg.bg} ${cfg.color} border ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}
