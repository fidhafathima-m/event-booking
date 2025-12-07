import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from './store/slices/authSlice';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound'; 

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/Users';
import AdminServices from './pages/admin/Services';
import AdminBookings from './pages/admin/Bookings';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import VerifyEmail from './pages/VerifyEmail';
import RoleRedirect from './components/auth/RoleRedirect';

function App() {
  const dispatch = useDispatch();
  const { token, isLoading, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getProfile());
    }
  }, [token, dispatch]);

  if (isLoading && token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes - Redirect if logged in */}
        <Route path="/login" element={user ? <RoleRedirect /> : <Login />} />
        <Route path="/register" element={user ? <RoleRedirect /> : <Register />} />
        <Route path="/verify-email" element={user ? <RoleRedirect /> : <VerifyEmail />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />

        {/* User-only Routes - Block admin access */}
        <Route path="/" element={<Home />} />
        <Route path="/bookings" element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="admin">
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/services" element={
          <ProtectedRoute requiredRole="admin">
            <AdminServices />
          </ProtectedRoute>
        } />
        <Route path="/admin/bookings" element={
          <ProtectedRoute requiredRole="admin">
            <AdminBookings />
          </ProtectedRoute>
        } />

        {/* Catch all route - ADD THIS */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;