import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export default function Header({ lastUpdated, onSubscribeClick, onRefresh, refreshing }) {
  const [timeAgo, setTimeAgo] = useState('');
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!lastUpdated) return;
    const tick = () => {
      const now = Date.now();
      const updated = new Date(lastUpdated).getTime();
      const diffSec = Math.floor((now - updated) / 1000);

      if (diffSec < 60) setTimeAgo('just now');
      else if (diffSec < 3600) setTimeAgo(`${Math.floor(diffSec / 60)}m ago`);
      else setTimeAgo(`${Math.floor(diffSec / 3600)}h ago`);

      const REFRESH_INTERVAL = 5 * 60;
      const elapsed = diffSec % REFRESH_INTERVAL;
      const remaining = REFRESH_INTERVAL - elapsed;
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      setCountdown(`${m}m ${s.toString().padStart(2, '0')}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 20px',
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '14px 0',
      }}>
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '14px 22px',
          background: 'rgba(255, 252, 247, 0.97)',
          border: '2px solid #10213a',
          borderRadius: '22px',
          boxShadow: '8px 8px 0 rgba(16, 33, 58, 0.08)',
          backdropFilter: 'blur(12px)',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px',
              borderRadius: '12px',
              background: 'var(--yellow)',
              border: '2px solid var(--line)',
              display: 'grid', placeItems: 'center',
              fontSize: '20px',
              boxShadow: '3px 3px 0 rgba(16,33,58,0.1)',
            }}>📰</div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                AI-Powered
              </div>
              <div style={{ fontSize: '22px', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1, fontFamily: "'DM Serif Display', serif" }}>
                DIGEST
              </div>
            </div>
          </div>

          {/* Center Navigation */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(16,33,58,0.04)', padding: '6px', borderRadius: '14px', border: '1px solid rgba(16,33,58,0.08)' }}>
            <NavLink
              to="/"
              className={({ isActive }) => `sketch-btn ${isActive ? 'primary' : ''}`}
              style={({ isActive }) => isActive ? { minHeight: '36px', padding: '0 16px', fontSize: '13px' } : { minHeight: '36px', padding: '0 16px', fontSize: '13px', border: 'none', background: 'transparent', boxShadow: 'none', color: 'var(--muted)' }}
            >
              📰 Feed
            </NavLink>
            <NavLink
              to="/analytics"
              className={({ isActive }) => `sketch-btn ${isActive ? 'primary' : ''}`}
              style={({ isActive }) => isActive ? { minHeight: '36px', padding: '0 16px', fontSize: '13px' } : { minHeight: '36px', padding: '0 16px', fontSize: '13px', border: 'none', background: 'transparent', boxShadow: 'none', color: 'var(--muted)' }}
            >
              📊 Analytics
            </NavLink>
          </div>

          {/* Status center */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {lastUpdated && (
              <>
                <span className="sketch-badge">
                  <span className="status-dot" style={{ width: '8px', height: '8px' }}></span>
                  Updated {timeAgo}
                </span>
                <span className="sketch-badge blue">⏱ Refresh in {countdown}</span>
              </>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="sketch-btn"
              onClick={onRefresh}
              disabled={refreshing}
              style={{ minHeight: '40px', padding: '0 14px', fontSize: '13px' }}
            >
              {refreshing ? '⏳ Updating…' : '⟳ Live Refresh'}
            </button>
            <button
              className="sketch-btn primary"
              onClick={onSubscribeClick}
              style={{ minHeight: '40px', padding: '0 14px', fontSize: '13px' }}
            >
              Subscribe
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
