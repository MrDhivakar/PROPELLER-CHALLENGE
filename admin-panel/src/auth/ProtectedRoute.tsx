import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, color: '#8B96A5' }}>Loadingâ€¦</div>;
  if (!admin) return <Navigate to="/login" replace />;
  return <>{children}</>;
}