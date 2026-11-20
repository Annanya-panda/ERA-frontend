import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function RequireAuth({ children, roles }) {
  const { token, user } = useSelector((state) => state.auth);
  const location = useLocation();
  if (!token || !user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
