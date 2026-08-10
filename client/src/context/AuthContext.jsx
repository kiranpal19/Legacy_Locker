import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase';
import { verifyFirebaseToken, getMe } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On mount: if we have a stored JWT, fetch the current user
  useEffect(() => {
    if (token) {
      getMe()
        .then(res => setUser(res.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Step 1 — Send OTP.
   * Accepts the RecaptchaVerifier created by the Login component.
   */
  const sendOtp = async (phone, recaptchaVerifier) => {
    const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
    return confirmationResult;
  };

  /**
   * Step 2 — Verify OTP and exchange Firebase idToken for backend JWT.
   */
  const verifyOtp = async (confirmationResult, otp) => {
    const credential = await confirmationResult.confirm(otp);
    const idToken = await credential.user.getIdToken();
    const res = await verifyFirebaseToken({ idToken });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, sendOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);