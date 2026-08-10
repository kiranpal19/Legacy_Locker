import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getMemories, getNominees, getStatus, deleteMemory } from '../api';
import { useNavigate } from 'react-router-dom';

/* ── Skeleton card ─────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '20px' }}>
      <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '8px', marginBottom: '12px' }} />
      <div className="skeleton" style={{ width: '80%', height: '14px', marginBottom: '8px' }} />
      <div className="skeleton" style={{ width: '55%', height: '11px', marginBottom: '8px' }} />
      <div className="skeleton" style={{ width: '65%', height: '11px' }} />
    </div>
  );
}

/* ── Delete confirmation modal ─────────────────────────────── */
function DeleteModal({ title, onConfirm, onCancel }) {
  return (
    <div style={overlay} onClick={onCancel}>
      <div className="modal-enter" style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🗑️</div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', marginBottom: '8px', color: 'var(--brand-dark)' }}>Delete Memory?</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
          "<strong>{title}</strong>" will be permanently deleted. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1, background: 'var(--danger)' }} onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── Memory preview modal ──────────────────────────────────── */
function PreviewModal({ memory, onClose }) {
  if (!memory) return null;
  const icons = { video: '🎥', letter: '✉️', voice: '🎙️', photo: '🖼️' };
  return (
    <div style={overlay} onClick={onClose}>
      <div className="modal-enter" style={{ ...modalBox, maxWidth: '540px', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <span style={{ fontSize: '30px' }}>{icons[memory.type]}</span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '19px', margin: '6px 0 6px', color: 'var(--brand-dark)' }}>{memory.title}</h3>
            <span style={badge}>{memory.triggerType.replace(/_/g, ' ')}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
        </div>
        {memory.type === 'letter' && memory.textContent && (
          <div style={letterBox}><p style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: 1.8, color: 'var(--text)' }}>{memory.textContent}</p></div>
        )}
        {memory.type === 'photo' && memory.fileUrl && (
          <img src={memory.fileUrl} alt={memory.title} style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: '300px', objectFit: 'cover', marginBottom: '14px' }} />
        )}
        {memory.type === 'video' && memory.fileUrl && (
          <video controls style={{ width: '100%', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}><source src={memory.fileUrl} /></video>
        )}
        {memory.type === 'voice' && memory.fileUrl && (
          <audio controls style={{ width: '100%', marginBottom: '14px' }}><source src={memory.fileUrl} /></audio>
        )}
        {!memory.textContent && !memory.fileUrl && (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '14px' }}>No content preview available.</p>
        )}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={metaChip}>{memory.isDelivered ? '✅ Delivered' : '🔒 Sealed'}</span>
          {memory.triggerDate && <span style={metaChip}>📅 {new Date(memory.triggerDate).toLocaleDateString()}</span>}
        </div>
      </div>
    </div>
  );
}

/* ── Animated stat card ────────────────────────────────────── */
function StatCard({ icon, num, label, onClick, delay }) {
  return (
    <div
      className={`card page-enter stagger-${delay}`}
      style={{ ...statCard, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div style={{ fontSize: '22px', marginBottom: '6px' }}>{icon}</div>
      <div className="count-enter" style={statNum}>{num}</div>
      <div style={statLabel}>{label}</div>
    </div>
  );
}

/* ── Dashboard ─────────────────────────────────────────────── */
export default function Dashboard() {
  const { user, logout }  = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [memories,  setMemories]  = useState([]);
  const [nominees,  setNominees]  = useState([]);
  const [insurance, setInsurance] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [toDelete,  setToDelete]  = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [navOpen,   setNavOpen]   = useState(false);

  // Search & filter state
  const [search,       setSearch]       = useState('');
  const [typeFilter,   setTypeFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      getMemories().then(r => setMemories(r.data)),
      getNominees().then(r => setNominees(r.data)),
      getStatus().then(r => setInsurance(r.data)),
    ])
      .catch(() => setError('Some data failed to load. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteMemory(toDelete.id);
      setMemories(prev => prev.filter(m => m._id !== toDelete.id));
    } catch { setError('Failed to delete. Please try again.'); }
    finally  { setToDelete(null); }
  };

  // Filter memories
  const filtered = memories.filter(m => {
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter   !== 'all' && m.type       !== typeFilter)   return false;
    if (statusFilter === 'sealed'    && m.isDelivered)  return false;
    if (statusFilter === 'delivered' && !m.isDelivered) return false;
    return true;
  });

  const TYPE_FILTERS   = [
    { v: 'all', label: 'All' }, { v: 'letter', label: '✉️ Letters' },
    { v: 'video', label: '🎥 Videos' }, { v: 'voice', label: '🎙️ Voice' },
    { v: 'photo', label: '🖼️ Photos' },
  ];
  const STATUS_FILTERS = [
    { v: 'all', label: 'All' }, { v: 'sealed', label: '🔒 Sealed' }, { v: 'delivered', label: '✅ Delivered' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', transition: 'background 0.3s' }}>

      {/* ── Sticky Navbar ── */}
      <nav style={nav}>
        <span style={navLogo}>🔐 Legacy Locker</span>
        <div style={navRight} className="hide-mobile">
          <span style={navUser}>{user?.name || user?.phone}</span>
          <button className="btn btn-ghost" style={navBtn} onClick={() => navigate('/insurance')}>🏦 Insurance</button>
          <button className="btn btn-ghost" style={navBtn} onClick={() => navigate('/nominees')}>👥 Nominees</button>
          <button className="btn btn-primary" style={navBtn} onClick={() => navigate('/upload')}>+ Add Memory</button>
          {/* Dark mode toggle */}
          <button className="btn btn-icon" style={{ fontSize: '16px' }} onClick={toggle} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="btn btn-ghost" style={navBtn} onClick={logout}>Logout</button>
        </div>
        <div className="hide-desktop" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn btn-icon" style={{ fontSize: '15px' }} onClick={toggle}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button style={hamburger} onClick={() => setNavOpen(o => !o)}>{navOpen ? '✕' : '☰'}</button>
        </div>
      </nav>

      {navOpen && (
        <div className="fade-enter" style={mobileDrawer}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user?.name || user?.phone}</span>
          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => { navigate('/insurance'); setNavOpen(false); }}>🏦 Insurance</button>
          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => { navigate('/nominees'); setNavOpen(false); }}>👥 Nominees</button>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { navigate('/upload'); setNavOpen(false); }}>+ Add Memory</button>
          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={logout}>Logout</button>
        </div>
      )}

      <div style={content}>

        {error && (
          <div className="fade-enter" style={errorBanner}>
            ⚠️ {error}
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px' }}>✕</button>
          </div>
        )}

        {/* ── Stats ── */}
        <div style={statsRow}>
          <StatCard delay={1} icon="📦" num={loading ? '—' : memories.length}  label="Memories"  />
          <StatCard delay={2} icon="👥" num={loading ? '—' : nominees.length}  label="Nominees"  onClick={() => navigate('/nominees')} />
          <StatCard delay={3} icon="🏦" num={loading ? '—' : (insurance?.linked ? '✓' : '✗')} label="Insurance" onClick={() => navigate('/insurance')} />
          <StatCard delay={4} icon="✅" num={loading ? '—' : memories.filter(m => m.isDelivered).length} label="Delivered" />
        </div>

        {/* ── Search + Filters ── */}
        <div className="page-enter stagger-3" style={filterSection}>
          <div className="search-wrap" style={{ marginBottom: '12px' }}>
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search memories…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={filterRow}>
            {TYPE_FILTERS.map(f => (
              <button key={f.v} className={`filter-chip${typeFilter === f.v ? ' active' : ''}`}
                onClick={() => setTypeFilter(f.v)}>{f.label}</button>
            ))}
            <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }} />
            {STATUS_FILTERS.map(f => (
              <button key={f.v} className={`filter-chip${statusFilter === f.v ? ' active' : ''}`}
                onClick={() => setStatusFilter(f.v)}>{f.label}</button>
            ))}
          </div>
        </div>

        {/* ── Memories grid ── */}
        <div style={sectionHeader}>
          <h2 style={sectionTitle}>
            Your Memories
            {!loading && filtered.length !== memories.length && (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 400, marginLeft: '10px' }}>
                {filtered.length} of {memories.length}
              </span>
            )}
          </h2>
          <button className="btn btn-primary hide-mobile" style={navBtn} onClick={() => navigate('/upload')}>+ Add</button>
        </div>

        {loading ? (
          <div style={grid}>{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="card page-enter" style={emptyState}>
            <span style={{ fontSize: '44px' }}>{memories.length === 0 ? '✉️' : '🔍'}</span>
            <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '15px' }}>
              {memories.length === 0 ? 'No memories sealed yet.' : 'No memories match your search.'}
            </p>
            {memories.length === 0 && (
              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/upload')}>
                Seal your first memory →
              </button>
            )}
          </div>
        ) : (
          <div style={grid}>
            {filtered.map((m, i) => (
              <div
                key={m._id}
                className={`card card-hover page-enter stagger-${Math.min(i + 1, 5)}`}
                style={memCard}
                onClick={() => setPreview(m)}
              >
                <div style={memIcon}>
                  {m.type === 'video' ? '🎥' : m.type === 'letter' ? '✉️' : m.type === 'voice' ? '🎙️' : '🖼️'}
                </div>
                <div style={memTitle}>{m.title}</div>
                <div style={memMeta}>{m.triggerType.replace(/_/g, ' ')}</div>
                {m.type === 'letter' && m.textContent && (
                  <p style={letterSnippet}>{m.textContent.slice(0, 65)}{m.textContent.length > 65 ? '…' : ''}</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <span style={{ fontSize: '11px', color: m.isDelivered ? 'var(--success)' : 'var(--text-light)' }}>
                    {m.isDelivered ? '✅ Delivered' : '🔒 Sealed'}
                  </span>
                  <button className="btn btn-danger"
                    onClick={e => { e.stopPropagation(); setToDelete({ id: m._id, title: m.title }); }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Quick actions ── */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
          <button className="btn btn-gold"  onClick={() => navigate('/nominees')}>👥 Manage Nominees</button>
          <button className="btn btn-ghost" onClick={() => navigate('/insurance')}>🏦 Insurance Settings</button>
        </div>
      </div>

      {toDelete && <DeleteModal title={toDelete.title} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />}
      {preview  && <PreviewModal memory={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

/* ── Styles ── */
const nav         = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow-sm)', transition: 'background 0.3s' };
const navLogo     = { fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, color: 'var(--brand-dark)' };
const navRight    = { display: 'flex', gap: '8px', alignItems: 'center' };
const navUser     = { fontSize: '13px', color: 'var(--text-muted)', marginRight: '4px' };
const navBtn      = { fontSize: '13px', padding: '7px 13px' };
const hamburger   = { background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--brand-dark)' };
const mobileDrawer = { background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', flexDirection: 'column', gap: '10px' };
const content     = { padding: '24px 20px', maxWidth: '1000px', margin: '0 auto', width: '100%' };
const errorBanner = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--warning-bg)', border: '1px solid var(--brand-gold)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: 'var(--warning-text)' };
const statsRow    = { display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' };
const statCard    = { padding: '20px', flex: '1 1 100px', textAlign: 'center' };
const statNum     = { fontFamily: 'var(--font-heading)', fontSize: '30px', color: 'var(--brand-gold)', lineHeight: 1 };
const statLabel   = { fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const filterSection = { marginBottom: '24px' };
const filterRow   = { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' };
const sectionTitle  = { fontSize: '20px', margin: 0, color: 'var(--brand-dark)' };
const grid        = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: '14px', marginBottom: '28px' };
const memCard     = { padding: '18px', cursor: 'pointer' };
const memIcon     = { fontSize: '26px', marginBottom: '10px' };
const memTitle    = { fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: 'var(--brand-dark)', lineHeight: 1.3 };
const memMeta     = { fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' };
const letterSnippet = { fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4, fontStyle: 'italic' };
const emptyState  = { padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const overlay     = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px', backdropFilter: 'blur(4px)' };
const modalBox    = { background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '32px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-lg)' };
const badge       = { display: 'inline-block', fontSize: '11px', background: 'var(--brand-gold-light)', color: 'var(--brand-dark)', borderRadius: '20px', padding: '2px 10px', textTransform: 'capitalize' };
const letterBox   = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px', maxHeight: '220px', overflowY: 'auto' };
const metaChip    = { fontSize: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '3px 10px', color: 'var(--text-muted)' };