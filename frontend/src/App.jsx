import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from './store/slices/authSlice';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
// import Services from './pages/Services';
// import ServiceDetail from './pages/ServiceDetail';
// import Bookings from './pages/Bookings';
// import Profile from './pages/Profile';

// Admin Pages
// import AdminDashboard from './pages/admin/AdminDashboard';
// import AdminUsers from './pages/admin/Users';
// import AdminServices from './pages/admin/Services';
// import AdminBookings from './pages/admin/Bookings';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
// import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const dispatch = useDispatch();
  const { token, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getProfile());
    }
  }, [token, dispatch]);

  if (isLoading && token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* <LoadingSpinner size="lg" /> */}
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} /> */}

        {/* Protected Routes */}
        {/* <Route path="/bookings" element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } /> */}

        {/* Admin Routes */}
        {/* <Route path="/admin" element={
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
        } /> */}

        {/* Provider Routes */}
        {/* <Route path="/provider" element={
          <ProtectedRoute requiredRole="provider">
            <AdminDashboard />
          </ProtectedRoute>
        } /> */}
      </Routes>
    </Router>
  );
}

export default App;