import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload    from './pages/Upload';
import Nominees  from './pages/Nominees';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div style={{display:'flex',alignItems:'center',
    justifyContent:'center',height:'100vh',fontFamily:'Georgia,serif',
    color:'#6b6355'}}>Loading your vault...</div>;
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/upload" element={
            <PrivateRoute><Upload /></PrivateRoute>} />
          <Route path="/nominees" element={
            <PrivateRoute><Nominees /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}