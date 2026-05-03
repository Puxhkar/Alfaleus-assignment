export default function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Loading bar overlay hint */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '4px' }}>
        <div style={{ width: '220px', height: '28px', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0,
            border: '2.5px solid var(--ink)', borderRadius: '6px',
            background: 'white',
          }} />
          <div className="loading-bar-fill" />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)' }}>
          Fetching your digest…
        </span>
      </div>

      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="sketch-panel"
          style={{
            padding: '22px',
            transform: i % 2 === 0 ? 'rotate(0.3deg)' : 'rotate(-0.2deg)',
          }}
        >
          <div style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
            <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="skeleton" style={{ height: '14px', width: '35%', borderRadius: '999px' }} />
              <div className="skeleton" style={{ height: '20px', width: '90%' }} />
              <div className="skeleton" style={{ height: '20px', width: '75%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="skeleton" style={{ height: '13px', width: '100%' }} />
            <div className="skeleton" style={{ height: '13px', width: '85%' }} />
            <div className="skeleton" style={{ height: '13px', width: '70%' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <div className="skeleton" style={{ height: '32px', width: '90px', borderRadius: '14px' }} />
            <div className="skeleton" style={{ height: '32px', width: '72px', borderRadius: '14px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
