export default function SearchBar({ value, onChange, resultCount }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute', left: '14px', top: '50%',
        transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none',
      }}>🔍</span>
      <input
        className="sketch-input"
        style={{ paddingLeft: '40px' }}
        type="text"
        placeholder={`Search headlines, topics… (${resultCount} clusters)`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '14px', color: 'var(--muted)', fontWeight: 700,
          }}
        >✕</button>
      )}
    </div>
  );
}
