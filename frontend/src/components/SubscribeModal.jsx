import { useState } from 'react';
import { subscribe } from '../services/api';

export default function SubscribeModal({ topics, onClose }) {
  const [email, setEmail] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const toggleTopic = (t) => {
    setSelectedTopics(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email.'); return; }
    setLoading(true);
    setError('');
    try {
      await subscribe(email, selectedTopics);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="sketch-panel"
        style={{ width: '100%', maxWidth: '480px', padding: '32px', margin: '20px' }}
        onClick={e => e.stopPropagation()}
      >
        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '52px', marginBottom: '14px' }}>🎉</div>
            <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: '1.6rem', letterSpacing: '-0.04em', marginBottom: '10px' }}>
              You're subscribed!
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.7 }}>
              We'll send you personalized digest updates to <strong>{email}</strong>.
            </p>
            <button className="sketch-btn primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                  Stay Informed
                </div>
                <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: '1.6rem', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                  Subscribe to Digest
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{ fontSize: '20px', color: 'var(--muted)', fontWeight: 700, lineHeight: 1 }}
              >✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                  Your Email
                </label>
                <input
                  className="sketch-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              {topics.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
                    Topics (optional)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {topics.map(t => (
                      <button
                        key={t}
                        type="button"
                        className={`sketch-chip${selectedTopics.includes(t) ? ' active' : ''}`}
                        style={{ textTransform: 'capitalize' }}
                        onClick={() => toggleTopic(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <p style={{ color: '#b91c1c', fontSize: '13px', fontWeight: 600 }}>{error}</p>
              )}

              <button
                type="submit"
                className="sketch-btn primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', minHeight: '48px' }}
              >
                {loading ? '⏳ Subscribing…' : '📬 Subscribe Now'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
