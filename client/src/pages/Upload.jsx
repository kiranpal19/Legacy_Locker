import { useState, useEffect } from 'react';
import { uploadMemory, getNominees } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const navigate = useNavigate();
  const [nominees, setNominees] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [form, setForm] = useState({
    title: '', type: 'letter', triggerType: 'on_death',
    textContent: '', nomineeId: '',
  });

  useEffect(() => {
    getNominees().then(r => setNominees(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await uploadMemory(form);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      alert('Failed: ' + err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button style={styles.back} onClick={() => navigate('/dashboard')}>← Back</button>
        <h2 style={styles.title}>Seal a Memory</h2>

        {success && <div style={styles.success}>✅ Memory sealed successfully!</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Memory Type</label>
          <select style={styles.input} value={form.type}
            onChange={e => setForm({...form, type: e.target.value})}>
            <option value="letter">✉️ Letter</option>
            <option value="video">🎥 Video</option>
            <option value="voice">🎙️ Voice</option>
            <option value="photo">🖼️ Photo</option>
          </select>

          <label style={styles.label}>Title</label>
          <input style={styles.input} placeholder="e.g. For Priya on her wedding day"
            value={form.title} onChange={e => setForm({...form, title: e.target.value})}
            required />

          {form.type === 'letter' && (
            <>
              <label style={styles.label}>Your Message</label>
              <textarea style={{...styles.input, height:'120px', resize:'vertical'}}
                placeholder="Write your message here..."
                value={form.textContent}
                onChange={e => setForm({...form, textContent: e.target.value})} />
            </>
          )}

          <label style={styles.label}>Deliver To</label>
          <select style={styles.input} value={form.nomineeId}
            onChange={e => setForm({...form, nomineeId: e.target.value})}>
            <option value="">Select nominee...</option>
            {nominees.map(n => (
              <option key={n._id} value={n._id}>{n.name} ({n.relation})</option>
            ))}
          </select>

          <label style={styles.label}>Delivery Trigger</label>
          <select style={styles.input} value={form.triggerType}
            onChange={e => setForm({...form, triggerType: e.target.value})}>
            <option value="on_death">On death confirmation</option>
            <option value="date">On specific date</option>
            <option value="age_18">When nominee turns 18</option>
          </select>

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Sealing...' : '🔒 Seal Memory'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page:    { minHeight:'100vh', background:'#faf7f2', display:'flex',
             alignItems:'center', justifyContent:'center', padding:'32px' },
  card:    { background:'white', padding:'40px', borderRadius:'16px',
             boxShadow:'0 8px 32px rgba(0,0,0,0.08)', width:'100%', maxWidth:'480px' },
  back:    { background:'none', border:'none', color:'#6b6355', cursor:'pointer',
             fontSize:'14px', marginBottom:'16px', padding:0 },
  title:   { fontFamily:'Georgia,serif', fontSize:'24px', marginBottom:'24px',
             color:'#1a1208' },
  label:   { display:'block', fontSize:'12px', fontWeight:'500', color:'#6b6355',
             textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:'6px' },
  input:   { width:'100%', padding:'10px 14px', marginBottom:'16px',
             border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px',
             boxSizing:'border-box', fontFamily:'inherit' },
  btn:     { width:'100%', padding:'13px', background:'#1a1208', color:'white',
             border:'none', borderRadius:'8px', fontSize:'14px', cursor:'pointer' },
  success: { background:'#e8f5ee', color:'#2e8b57', padding:'12px', borderRadius:'8px',
             marginBottom:'16px', fontSize:'14px', textAlign:'center' },
};