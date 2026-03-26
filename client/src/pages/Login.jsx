import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [phone,   setPhone]   = useState('');
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(phone, email);
      navigate('/dashboard');
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>🔐 Legacy Locker</h1>
        <p style={styles.sub}>Your emotional vault</p>
        <form onSubmit={handleLogin}>
          <input
            style={styles.input}
            type="tel"
            placeholder="Phone (+919999999999)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Enter Your Vault'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight:'100vh', display:'flex', alignItems:'center',
               justifyContent:'center', background:'#faf7f2' },
  card:      { background:'white', padding:'48px', borderRadius:'16px',
               boxShadow:'0 8px 32px rgba(0,0,0,0.1)', width:'100%', maxWidth:'400px' },
  logo:      { fontFamily:'Georgia,serif', fontSize:'28px', marginBottom:'8px',
               color:'#1a1208', textAlign:'center' },
  sub:       { color:'#6b6355', textAlign:'center', marginBottom:'32px', fontSize:'14px' },
  input:     { width:'100%', padding:'12px 16px', marginBottom:'16px', border:'1px solid #ddd',
               borderRadius:'8px', fontSize:'14px', boxSizing:'border-box' },
  btn:       { width:'100%', padding:'13px', background:'#1a1208', color:'white',
               border:'none', borderRadius:'8px', fontSize:'14px', cursor:'pointer' },
  error:     { color:'red', fontSize:'13px', marginBottom:'12px' },
};