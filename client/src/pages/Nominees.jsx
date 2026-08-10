import { useState, useEffect } from 'react';
import { getNominees, addNominee, deleteNominee, verifyNominee } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Nominees() {
  const navigate = useNavigate();
  const [nominees, setNominees] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [form, setForm] = useState({ name: '', relation: '', phone: '', email: '', birthDate: '' });

  useEffect(() => { getNominees().then(r => setNominees(r.data)).catch(() => {}); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await addNominee(form);
      setNominees(prev => [res.data.nominee, ...prev]);
      setForm({ name: '', relation: '', phone: '', email: '', birthDate: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add nominee');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this nominee?')) return;
    await deleteNominee(id);
    setNominees(prev => prev.filter(n => n._id !== id));
  };

  const handleVerify = async (id) => {
    const res = await verifyNominee(id);
    setNominees(prev => prev.map(n => n._id === id ? res.data.nominee : n));
  };

  return (
    <div style={page}>
      <div style={wrap}>
        <button style={backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <h2 style={titleStyle}>Manage Nominees</h2>

        {/* Add form */}
        <div className="card" style={formCard}>
          <h3 style={subtitle}>Add a Nominee</h3>
          <form onSubmit={handleAdd}>
            <div style={row}>
              <div style={field}>
                <label className="label">Full Name</label>
                <input className="input" placeholder="e.g. Priya Sharma"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div style={field}>
                <label className="label">Relation</label>
                <input className="input" placeholder="e.g. Daughter"
                  value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))} required />
              </div>
            </div>
            <div style={row}>
              <div style={field}>
                <label className="label">Phone</label>
                <input className="input" placeholder="+91…"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              </div>
              <div style={field}>
                <label className="label">Email (optional)</label>
                <input className="input" type="email" placeholder="email@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            <div style={field}>
              <label className="label">Date of Birth <span style={{ color: 'var(--text-light)', fontWeight: 400, textTransform: 'none' }}>(for age-18 trigger)</span></label>
              <input className="input" type="date" style={{ marginBottom: '16px' }}
                value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Adding…' : '+ Add Nominee'}
            </button>
          </form>
        </div>

        {/* List */}
        {nominees.length === 0 ? (
          <div className="card" style={emptyState}>
            <span style={{ fontSize: '36px' }}>👥</span>
            <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '14px' }}>No nominees added yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {nominees.map(n => (
              <div key={n._id} className="card" style={nomineeRow}>
                <div style={avatar}>{n.name[0].toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={nomineeName}>{n.name}</div>
                  <div style={nomineeMeta}>
                    {n.relation} · {n.phone}
                    {n.birthDate && <span> · 🎂 {new Date(n.birthDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div style={actions}>
                  {n.isVerified
                    ? <span style={verifiedBadge}>✓ Verified</span>
                    : <button className="btn" style={verifyBtn} onClick={() => handleVerify(n._id)}>Verify</button>
                  }
                  <button className="btn btn-danger" onClick={() => handleDelete(n._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const page         = { minHeight: '100vh', background: 'var(--bg)', padding: '28px 16px' };
const wrap         = { maxWidth: '680px', margin: '0 auto' };
const backBtn      = { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', marginBottom: '8px', padding: 0 };
const titleStyle   = { fontSize: '24px', marginBottom: '24px' };
const formCard     = { padding: '24px', marginBottom: '24px' };
const subtitle     = { fontSize: '15px', fontWeight: 600, marginBottom: '18px', color: 'var(--brand-dark)' };
const row          = { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '0' };
const field        = { flex: '1 1 180px', display: 'flex', flexDirection: 'column', marginBottom: '14px' };
const emptyState   = { padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const nomineeRow   = { padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' };
const avatar       = { width: '40px', height: '40px', borderRadius: '50%', background: 'var(--brand-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '16px', color: 'var(--brand-dark)', flexShrink: 0 };
const nomineeName  = { fontWeight: 600, fontSize: '14px', color: 'var(--brand-dark)' };
const nomineeMeta  = { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' };
const actions      = { display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 };
const verifiedBadge = { fontSize: '12px', color: 'var(--success)', background: 'var(--success-bg)', padding: '3px 10px', borderRadius: '20px', fontWeight: 500 };
const verifyBtn    = { fontSize: '12px', color: 'var(--brand-gold)', background: 'transparent', border: '1px solid var(--brand-gold)', borderRadius: '20px', padding: '3px 10px', cursor: 'pointer' };