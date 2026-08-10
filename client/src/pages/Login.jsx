import { useState, useRef, useEffect } from 'react';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [step,    setStep]    = useState('phone');
  const [phone,   setPhone]   = useState('');
  const [otp,     setOtp]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const confirmationRef    = useRef(null);
  const recaptchaVerifier  = useRef(null);

  useEffect(() => {
    recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
    return () => {
      if (recaptchaVerifier.current) {
        recaptchaVerifier.current.clear();
        recaptchaVerifier.current = null;
      }
    };
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone.startsWith('+')) {
      setError('Include country code, e.g. +919876543210');
      return;
    }
    setLoading(true);
    try {
      confirmationRef.current = await sendOtp(phone, recaptchaVerifier.current);
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(confirmationRef.current, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div id="recaptcha-container" />

      <div style={card}>
        {/* Logo */}
        <div style={logoWrap}>
          <span style={{ fontSize: '36px' }}>🔐</span>
          <h1 style={logo}>Legacy Locker</h1>
        </div>
        <p style={sub}>Your emotional vault — secured forever</p>

        {/* Step indicator */}
        <div style={steps}>
          <div style={{ ...step_, ...(step === 'phone' ? stepActive : stepDone) }}>1</div>
          <div style={stepLine} />
          <div style={{ ...step_, ...(step === 'otp' ? stepActive : {}) }}>2</div>
        </div>
        <p style={stepLabel}>
          {step === 'phone' ? 'Enter your phone number' : 'Enter the OTP sent to your phone'}
        </p>

        {error && <div style={errorBox}>{error}</div>}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp}>
            <div style={inputWrap}>
              <span style={inputIcon}>📱</span>
              <input
                style={input} type="tel"
                placeholder="+91 98765 43210"
                value={phone} onChange={e => setPhone(e.target.value)}
                required autoFocus
              />
            </div>
            <p style={hint}>Include country code (e.g. +91 for India)</p>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
              {loading ? 'Sending OTP…' : 'Send OTP →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div style={inputWrap}>
              <span style={inputIcon}>🔑</span>
              <input
                style={{ ...input, letterSpacing: '0.3em', textAlign: 'center', fontSize: '20px' }}
                type="text" inputMode="numeric" placeholder="——————"
                maxLength={6} value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                required autoFocus
              />
            </div>
            <p style={hint}>
              Sent to {phone} —{' '}
              <span style={resend} onClick={() => { setStep('phone'); setOtp(''); setError(''); }}>
                Change number
              </span>
            </p>
            <button className="btn btn-primary" type="submit" disabled={loading || otp.length < 6}
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
              {loading ? 'Verifying…' : '🔓 Enter Your Vault'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const container = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg) 0%, #f0e8d8 100%)', padding: '24px' };
const card      = { background: 'var(--bg-card)', padding: '48px 40px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '420px' };
const logoWrap  = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' };
const logo      = { fontFamily: 'var(--font-heading)', fontSize: '26px', color: 'var(--brand-dark)', margin: 0 };
const sub       = { color: 'var(--text-muted)', textAlign: 'center', marginBottom: '28px', fontSize: '14px' };
const steps     = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' };
const step_     = { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, background: '#eee', color: '#999', transition: 'all 0.3s' };
const stepActive = { background: 'var(--brand-dark)', color: 'white' };
const stepDone   = { background: 'var(--brand-gold)', color: 'white' };
const stepLine  = { width: '40px', height: '2px', background: '#eee', borderRadius: '2px' };
const stepLabel = { textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' };
const errorBox  = { background: '#fff0f0', color: '#c0392b', border: '1px solid #f5c6cb', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' };
const inputWrap = { display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0 14px', marginBottom: '8px' };
const inputIcon = { fontSize: '18px', marginRight: '8px' };
const input     = { flex: 1, border: 'none', outline: 'none', padding: '13px 0', fontSize: '15px', background: 'transparent', fontFamily: 'inherit' };
const hint      = { fontSize: '12px', color: 'var(--text-light)', marginBottom: '20px', paddingLeft: '2px' };
const resend    = { color: 'var(--brand-gold)', cursor: 'pointer', textDecoration: 'underline' };