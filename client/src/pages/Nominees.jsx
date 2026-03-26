import { useState, useEffect } from 'react';
import { getNominees, addNominee, deleteNominee, verifyNominee } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Nominees() {
  const navigate = useNavigate();
  const [nominees, setNominees] = useState([]);
  const [form, setForm] = useState({ name:'', relation:'', phone:'', email:'' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getNominees().then(r => setNominees(r.data));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await addNominee(form);
      setNominees(prev => [res.data.nominee, ...prev]);
      setForm({ name:'', relation:'', phone:'', email:'' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add nominee');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteNominee(id);
    setNominees(prev => prev.filter(n => n._id !== id));
  };

  const handleVerify = async (id) => {
    const res = await verifyNominee(id);
    setNominees(prev => prev.map(n => n._id === id ? res.data.nominee : n));
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <button style={styles.back} onClick={() => navigate('/dashboard')}>← Dashboard</button>
        <h2 style={styles.title}>Manage Nominees</h2>

        {/* Add form */}
        <div style={styles.card}>
          <h3 style={styles.subtitle}>Add Nominee</h3>
          <form onSubmit={handleAdd}>
            <div style={styles.row}>
              <input style={styles.input} placeholder="Full name"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <input style={styles.input} placeholder="Relation (e.g. Daughter)"
                value={form.relation} onChange={e => setForm({...form, relation: e.target.value})} required />
            </div>
            <div style={styles.row}>
              <input style={styles.input} placeholder="Phone (+91...)"
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
              <input style={styles.input} placeholder="Email"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Adding...' : '+ Add Nominee'}
            </button>
          </form>
        </div>

        {/* Nominees list */}
        {nominees.map(n => (
          <div key={n._id} style={styles.nomineeRow}>
            <div style={styles.nomineeAvatar}>{n.name[0]}</div>
            <div style={styles.nomineeInfo}>
              <div style={styles.nomineeName}>{n.name}</div>
              <div style={styles.nomineeMeta}>{n.relation} · {n.phone}</div>
            </div>
            <div style={styles.nomineeActions}>
              {n.isVerified
                ? <span style={styles.verified}>✓ Verified</span>
                : <button style={styles.verifyBtn} onClick={() => handleVerify(n._id)}>Verify</button>
              }
              <button style={styles.deleteBtn} onClick={() => handleDelete(n._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page:          { minHeight:'100vh', background:'#faf7f2', padding:'32px' },
  wrap:          { maxWidth:'640px', margin:'0 auto' },
  back:          { background:'none', border:'none', color:'#6b6355',
                   cursor:'pointer', fontSize:'14px', marginBottom:'16px', padding:0 },
  title:         { fontFamily:'Georgia,serif', fontSize:'26px', marginBottom:'24px' },
  card:          { background:'white', padding:'24px', borderRadius:'12px',
                   border:'1px solid #ede7d9', marginBottom:'24px' },
  subtitle:      { fontSize:'16px', fontWeight:'500', marginBottom:'16px' },
  row:           { display:'flex', gap:'12px' },
  input:         { flex:1, padding:'10px 12px', marginBottom:'12px',
                   border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px' },
  btn:           { padding:'10px 20px', background:'#1a1208', color:'white',
                   border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px' },
  nomineeRow:    { background:'white', padding:'16px 20px', borderRadius:'12px',
                   border:'1px solid #ede7d9', marginBottom:'12px',
                   display:'flex', alignItems:'center', gap:'14px' },
  nomineeAvatar: { width:'40px', height:'40px', borderRadius:'50%',
                   background:'#f5e8d0', display:'flex', alignItems:'center',
                   justifyContent:'center', fontWeight:'500', fontSize:'16px' },
  nomineeInfo:   { flex:1 },
  nomineeName:   { fontWeight:'500', fontSize:'14px' },
  nomineeMeta:   { fontSize:'12px', color:'#6b6355', marginTop:'2px' },
  nomineeActions:{ display:'flex', gap:'8px', alignItems:'center' },
  verified:      { fontSize:'12px', color:'#2e8b57', background:'#e8f5ee',
                   padding:'3px 8px', borderRadius:'4px' },
  verifyBtn:     { fontSize:'12px', color:'#c9a84c', background:'none',
                   border:'1px solid #c9a84c', borderRadius:'4px',
                   padding:'3px 8px', cursor:'pointer' },
  deleteBtn:     { fontSize:'12px', color:'#e24b4a', background:'none',
                   border:'none', cursor:'pointer' },
};