import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './ui/Loader';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loader fullPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
