import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider }         from './context/ThemeContext';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload    from './pages/Upload';
import Nominees  from './pages/Nominees';
import Insurance from './pages/Insurance';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', gap: '12px',
      fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', fontSize: '18px',
    }}>
      <span style={{ fontSize: '28px', animation: 'pulse 1.5s ease-in-out infinite' }}>🔐</span>
      Loading your vault…
    </div>
  );
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"     element={<Login />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/upload"    element={<PrivateRoute><Upload /></PrivateRoute>} />
            <Route path="/nominees"  element={<PrivateRoute><Nominees /></PrivateRoute>} />
            <Route path="/insurance" element={<PrivateRoute><Insurance /></PrivateRoute>} />
            <Route path="*"          element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}