import { useState, useEffect } from 'react';
import { linkPolicy, getStatus, testTrigger } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Insurance() {
  const navigate = useNavigate();
  const [status,   setStatus]   = useState(null);
  const [policyId, setPolicyId] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [testing,  setTesting]  = useState(false);
  const [msg,      setMsg]      = useState('');
  const [err,      setErr]      = useState('');

  useEffect(() => {
    getStatus().then(r => setStatus(r.data)).catch(() => {});
  }, []);

  const handleLink = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(''); setErr('');
    try {
      await linkPolicy({ policyId });
      const r = await getStatus();
      setStatus(r.data);
      setMsg('✅ Policy linked successfully!');
      setPolicyId('');
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to link policy.');
    } finally { setLoading(false); }
  };

  const handleTest = async () => {
    setTesting(true); setMsg(''); setErr('');
    try {
      await testTrigger();
      setMsg('✅ Test delivery triggered! Check nominee emails.');
    } catch (e) {
      setErr(e.response?.data?.message || 'Test trigger failed.');
    } finally { setTesting(false); }
  };

  return (
    <div style={page}>
      <div style={wrap}>
        <button style={backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <h2 style={titleStyle}>🏦 Insurance Integration</h2>
        <p style={desc}>
          Link your insurance policy so Legacy Locker can automatically deliver your sealed memories
          to your nominees when a death claim is settled.
        </p>

        {msg && <div style={successBox}>{msg}</div>}
        {err && <div style={errBox}>{err}</div>}

        {/* Status card */}
        <div className="card" style={statusCard}>
          <div style={statusRow}>
            <div>
              <div style={statusLabel}>Policy Status</div>
              <div style={statusVal}>
                {status === null ? '—' : status.linked
                  ? <span style={{ color: 'var(--success)', fontWeight: 600 }}>✓ Linked</span>
                  : <span style={{ color: 'var(--text-muted)' }}>Not linked</span>
                }
              </div>
            </div>
            <div>
              <div style={statusLabel}>Policy ID</div>
              <div style={statusVal}>{status?.policyId || '—'}</div>
            </div>
            <div>
              <div style={statusLabel}>Delivery Trigger</div>
              <div style={statusVal}>On CLAIM_SETTLED webhook</div>
            </div>
          </div>
        </div>

        {/* Link form */}
        <div className="card" style={formCard}>
          <h3 style={cardTitle}>Link a Policy</h3>
          <p style={cardDesc}>Enter the policy ID provided by your insurance company.</p>
          <form onSubmit={handleLink}>
            <label className="label">Policy ID</label>
            <input
              className="input"
              style={{ marginBottom: '16px' }}
              placeholder="e.g. LIC-2024-ABC123"
              value={policyId}
              onChange={e => setPolicyId(e.target.value)}
              required
            />
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Linking…' : '🔗 Link Policy'}
            </button>
          </form>
        </div>

        {/* How it works */}
        <div className="card" style={formCard}>
          <h3 style={cardTitle}>How It Works</h3>
          <ol style={howList}>
            <li>You link your insurance policy ID above</li>
            <li>When a death claim is settled, the insurer calls our webhook:<br />
              <code style={codeStyle}>POST /api/insurance/webhook</code>
            </li>
            <li>We verify the event and automatically deliver all your <strong>on_death</strong> memories to your nominees via email</li>
          </ol>
        </div>

        {/* Dev test trigger */}
        <div className="card" style={{ ...formCard, borderColor: '#f5c842', background: 'var(--warning-bg)' }}>
          <h3 style={{ ...cardTitle, color: 'var(--warning-text)' }}>⚠️ Test Delivery (Dev Only)</h3>
          <p style={cardDesc}>Manually trigger delivery of all your <em>on_death</em> memories right now — for testing purposes.</p>
          <button className="btn" style={testBtn} onClick={handleTest} disabled={testing}>
            {testing ? 'Triggering…' : '🚀 Trigger Test Delivery'}
          </button>
        </div>
      </div>
    </div>
  );
}

const page       = { minHeight: '100vh', background: 'var(--bg)', padding: '28px 16px' };
const wrap       = { maxWidth: '680px', margin: '0 auto' };
const backBtn    = { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', marginBottom: '8px', padding: 0 };
const titleStyle = { fontSize: '24px', marginBottom: '8px' };
const desc       = { color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 };
const successBox = { background: 'var(--success-bg)', color: 'var(--success)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '14px', fontWeight: 500 };
const errBox     = { background: '#fff0f0', color: '#c0392b', border: '1px solid #f5c6cb', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '16px', fontSize: '14px' };
const statusCard = { padding: '24px', marginBottom: '20px' };
const statusRow  = { display: 'flex', gap: '32px', flexWrap: 'wrap' };
const statusLabel = { fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' };
const statusVal  = { fontSize: '15px', fontWeight: 500, color: 'var(--brand-dark)' };
const formCard   = { padding: '24px', marginBottom: '20px' };
const cardTitle  = { fontSize: '16px', fontWeight: 600, marginBottom: '6px', color: 'var(--brand-dark)' };
const cardDesc   = { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 };
const howList    = { paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.8 };
const codeStyle  = { background: '#f0ebe3', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--brand-dark)' };
const testBtn    = { background: 'var(--warning-bg)', color: 'var(--warning-text)', border: '1px solid #f5c842' };
