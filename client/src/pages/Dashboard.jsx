import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMemories, getNominees, getStatus, deleteMemory } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [memories,  setMemories]  = useState([]);
  const [nominees,  setNominees]  = useState([]);
  const [insurance, setInsurance] = useState(null);

  useEffect(() => {
    getMemories().then(r => setMemories(r.data));
    getNominees().then(r => setNominees(r.data));
    getStatus().then(r => setInsurance(r.data));
  }, []);

  const handleDelete = async (id) => {
    await deleteMemory(id);
    setMemories(prev => prev.filter(m => m._id !== id));
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.navLogo}>🔐 Legacy Locker</span>
        <div style={styles.navRight}>
          <span style={styles.navUser}>{user?.name || user?.phone}</span>
          <button style={styles.navBtn} onClick={() => navigate('/upload')}>+ Add Memory</button>
          <button style={styles.navBtnOut} onClick={logout}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <div style={styles.statNum}>{memories.length}</div>
            <div style={styles.statLabel}>Memories</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statNum}>{nominees.length}</div>
            <div style={styles.statLabel}>Nominees</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statNum}>{insurance?.linked ? '✓' : '✗'}</div>
            <div style={styles.statLabel}>Insurance</div>
          </div>
        </div>

        {/* Memories */}
        <h2 style={styles.sectionTitle}>Your Memories</h2>
        {memories.length === 0 && (
          <p style={styles.empty}>No memories yet.
            <span style={styles.link} onClick={() => navigate('/upload')}> Add one →</span>
          </p>
        )}
        <div style={styles.grid}>
          {memories.map(m => (
            <div key={m._id} style={styles.card}>
              <div style={styles.cardIcon}>
                {m.type === 'video' ? '🎥' : m.type === 'letter' ? '✉️' :
                 m.type === 'voice' ? '🎙️' : '🖼️'}
              </div>
              <div style={styles.cardTitle}>{m.title}</div>
              <div style={styles.cardMeta}>{m.triggerType.replace('_', ' ')}</div>
              <div style={styles.cardDelivered}>
                {m.isDelivered ? '✅ Delivered' : '🔒 Sealed'}
              </div>
              <button style={styles.deleteBtn} onClick={() => handleDelete(m._id)}>
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Nominees */}
        <h2 style={styles.sectionTitle}>Nominees</h2>
        <button style={styles.addBtn} onClick={() => navigate('/nominees')}>
          Manage Nominees
        </button>
      </div>
    </div>
  );
}

const styles = {
  page:        { minHeight:'100vh', background:'#faf7f2' },
  nav:         { display:'flex', justifyContent:'space-between', alignItems:'center',
                 padding:'16px 32px', background:'white',
                 borderBottom:'1px solid #ede7d9' },
  navLogo:     { fontFamily:'Georgia,serif', fontSize:'20px', fontWeight:'600' },
  navRight:    { display:'flex', gap:'12px', alignItems:'center' },
  navUser:     { fontSize:'14px', color:'#6b6355' },
  navBtn:      { padding:'8px 16px', background:'#1a1208', color:'white',
                 border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  navBtnOut:   { padding:'8px 16px', background:'transparent', color:'#6b6355',
                 border:'1px solid #ddd', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  content:     { padding:'32px', maxWidth:'1000px', margin:'0 auto' },
  statsRow:    { display:'flex', gap:'16px', marginBottom:'32px' },
  stat:        { background:'white', padding:'24px', borderRadius:'12px', flex:1,
                 textAlign:'center', border:'1px solid #ede7d9' },
  statNum:     { fontFamily:'Georgia,serif', fontSize:'32px', color:'#c9a84c' },
  statLabel:   { fontSize:'12px', color:'#6b6355', marginTop:'4px', textTransform:'uppercase' },
  sectionTitle:{ fontFamily:'Georgia,serif', fontSize:'22px', marginBottom:'16px',
                 color:'#1a1208' },
  grid:        { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',
                 gap:'16px', marginBottom:'32px' },
  card:        { background:'white', padding:'20px', borderRadius:'12px',
                 border:'1px solid #ede7d9' },
  cardIcon:    { fontSize:'28px', marginBottom:'10px' },
  cardTitle:   { fontWeight:'500', fontSize:'14px', marginBottom:'6px' },
  cardMeta:    { fontSize:'12px', color:'#6b6355', marginBottom:'6px',
                 textTransform:'capitalize' },
  cardDelivered:{ fontSize:'11px', marginBottom:'10px' },
  deleteBtn:   { fontSize:'11px', color:'#e24b4a', background:'none',
                 border:'none', cursor:'pointer', padding:0 },
  empty:       { color:'#6b6355', fontSize:'14px' },
  link:        { color:'#c9a84c', cursor:'pointer' },
  addBtn:      { padding:'10px 20px', background:'#c9a84c', color:'white',
                 border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px' },
};