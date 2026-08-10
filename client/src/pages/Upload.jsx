import { useState, useEffect, useRef } from 'react';
import { uploadMemory, getNominees } from '../api';
import { useNavigate } from 'react-router-dom';

const TYPE_OPTIONS = [
  { v: 'letter', icon: '✉️', label: 'Letter'  },
  { v: 'video',  icon: '🎥', label: 'Video'   },
  { v: 'voice',  icon: '🎙️', label: 'Voice'   },
  { v: 'photo',  icon: '🖼️', label: 'Photo'   },
];
const ACCEPT_MAP = { video: 'video/*', voice: 'audio/*', photo: 'image/*' };

export default function Upload() {
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [nominees, setNominees] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [file,     setFile]     = useState(null);
  const [form, setForm] = useState({
    title: '', type: 'letter', triggerType: 'on_death',
    textContent: '', nomineeId: '', triggerDate: '',
  });

  useEffect(() => { getNominees().then(r => setNominees(r.data)).catch(() => {}); }, []);

  const handleTypeChange = (v) => {
    setForm(f => ({ ...f, type: v }));
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title',       form.title);
      fd.append('type',        form.type);
      fd.append('triggerType', form.triggerType);
      if (form.textContent)  fd.append('textContent',  form.textContent);
      if (form.nomineeId)    fd.append('nomineeId',    form.nomineeId);
      if (form.triggerDate)  fd.append('triggerDate',  form.triggerDate);
      if (file)              fd.append('file',         file);
      await uploadMemory(fd);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1600);
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  };

  const needsFile = ['video', 'voice', 'photo'].includes(form.type);

  // Minimum date for the date picker = tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div style={page}>
      <div style={card}>
        <button style={backBtn} onClick={() => navigate('/dashboard')}>← Back</button>
        <h2 style={title}>Seal a Memory</h2>

        {success && <div style={successBox}>✅ Memory sealed! Redirecting…</div>}

        <form onSubmit={handleSubmit}>

          {/* Type picker */}
          <label className="label">Memory Type</label>
          <div style={typeGrid}>
            {TYPE_OPTIONS.map(({ v, icon, label }) => (
              <button key={v} type="button"
                style={{ ...typeBtn, ...(form.type === v ? typeBtnActive : {}) }}
                onClick={() => handleTypeChange(v)}>
                <span style={{ fontSize: '20px' }}>{icon}</span>
                <span style={{ fontSize: '11px', fontWeight: 500 }}>{label}</span>
              </button>
            ))}
          </div>

          {/* Title */}
          <label className="label">Title</label>
          <input className="input" style={{ marginBottom: '16px' }}
            placeholder="e.g. For Priya on her wedding day"
            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />

          {/* Letter textarea */}
          {form.type === 'letter' && (
            <>
              <label className="label">Your Message</label>
              <textarea className="input"
                style={{ height: '130px', resize: 'vertical', marginBottom: '16px' }}
                placeholder="Write your heartfelt message here…"
                value={form.textContent}
                onChange={e => setForm(f => ({ ...f, textContent: e.target.value }))} />
            </>
          )}

          {/* File picker */}
          {needsFile && (
            <>
              <label className="label">
                {form.type === 'video' ? 'Video File' : form.type === 'voice' ? 'Audio File' : 'Photo'}
              </label>
              <div style={{ ...dropZone, ...(file ? dropZoneActive : {}) }}
                onClick={() => fileRef.current?.click()}>
                {file ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                    <span style={{ fontSize: '22px' }}>{form.type === 'video' ? '🎥' : form.type === 'voice' ? '🎙️' : '🖼️'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                    <button type="button" style={removeBtn}
                      onClick={ev => { ev.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ''; }}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '26px' }}>☁️</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Click to choose a {form.type} file</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Max 500 MB</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept={ACCEPT_MAP[form.type]}
                style={{ display: 'none' }} onChange={e => setFile(e.target.files[0] || null)} />
            </>
          )}

          {/* Deliver To */}
          <label className="label">Deliver To</label>
          <select className="input" style={{ marginBottom: '16px' }}
            value={form.nomineeId} onChange={e => setForm(f => ({ ...f, nomineeId: e.target.value }))}>
            <option value="">Select nominee…</option>
            {nominees.map(n => <option key={n._id} value={n._id}>{n.name} ({n.relation})</option>)}
          </select>

          {/* Trigger type */}
          <label className="label">Delivery Trigger</label>
          <select className="input" style={{ marginBottom: form.triggerType === 'date' ? '10px' : '24px' }}
            value={form.triggerType} onChange={e => setForm(f => ({ ...f, triggerType: e.target.value, triggerDate: '' }))}>
            <option value="on_death">On death confirmation</option>
            <option value="date">On specific date</option>
            <option value="age_18">When nominee turns 18</option>
          </select>

          {/* Date picker — shown only when triggerType = 'date' */}
          {form.triggerType === 'date' && (
            <>
              <label className="label">Delivery Date</label>
              <input type="date" className="input" style={{ marginBottom: '24px' }}
                min={minDateStr}
                value={form.triggerDate}
                onChange={e => setForm(f => ({ ...f, triggerDate: e.target.value }))}
                required />
            </>
          )}

          {/* age_18 note */}
          {form.triggerType === 'age_18' && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px', marginTop: '6px', lineHeight: 1.5 }}>
              ℹ️ This memory will be delivered on the nominee's 18th birthday. Make sure the nominee has a birth date set in <strong>Nominees</strong>.
            </p>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading || success}
            style={{ width: '100%', padding: '14px' }}>
            {loading ? 'Sealing your memory…' : '🔒 Seal Memory'}
          </button>
        </form>
      </div>
    </div>
  );
}

const page         = { minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 16px' };
const card         = { background: 'var(--bg-card)', padding: '36px 32px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '500px' };
const backBtn      = { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0 };
const title        = { fontSize: '22px', marginBottom: '24px' };
const successBox   = { background: 'var(--success-bg)', color: 'var(--success)', padding: '13px', borderRadius: 'var(--radius-md)', marginBottom: '18px', fontSize: '14px', textAlign: 'center', fontWeight: 500 };
const typeGrid     = { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '18px' };
const typeBtn      = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px 6px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', cursor: 'pointer', transition: 'all 0.2s' };
const typeBtnActive = { borderColor: 'var(--brand-dark)', background: 'var(--brand-gold-light)' };
const dropZone     = { border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '18px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90px' };
const dropZoneActive = { borderColor: 'var(--brand-gold)', background: 'var(--brand-gold-light)' };
const removeBtn    = { background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontSize: '16px', flexShrink: 0 };