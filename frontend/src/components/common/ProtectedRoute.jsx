import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();
  
  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If user exists but profile is still loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If route requires admin role but user is not admin
  if (requiredRole === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  // If user is admin and trying to access user-only pages, redirect to admin dashboard
  if (user?.role === 'admin' && !requiredRole && location.pathname !== '/admin' && !location.pathname.startsWith('/admin/')) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

export default ProtectedRoute;