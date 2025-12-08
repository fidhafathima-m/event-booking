/* eslint-disable no-unused-vars */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBookings } from '../../store/slices/adminSlice';
import { fetchAllServices } from '../../store/slices/adminSlice';
import { fetchAllUsers } from '../../store/slices/adminSlice';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  UsersIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { bookings, services, users, isLoading } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch all necessary data for dashboard
    dispatch(fetchAllBookings({}));
    dispatch(fetchAllServices({}));
    dispatch(fetchAllUsers({}));
  }, [dispatch]);

  // Calculate stats from real data
  const calculateStats = () => {
    const totalUsers = users?.length || 0;
    const totalServices = services?.length || 0;
    const totalBookings = bookings?.length || 0;
    const totalRevenue = bookings?.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0) || 0;
    
    // Calculate active services
    const activeServices = services?.filter(service => service.isActive !== false)?.length || 0;
    
    // Calculate active bookings (pending + confirmed)
    const activeBookings = bookings?.filter(booking => 
      ['pending', 'confirmed'].includes(booking.status)
    )?.length || 0;
    
    // Calculate completed bookings
    const completedBookings = bookings?.filter(booking => 
      booking.status === 'completed'
    )?.length || 0;
    
    // Calculate cancelled bookings
    const cancelledBookings = bookings?.filter(booking => 
      booking.status === 'cancelled'
    )?.length || 0;
    
    // Calculate pending bookings
    const pendingBookings = bookings?.filter(booking => 
      booking.status === 'pending'
    )?.length || 0;
    
    // Calculate percentage changes 
    const userGrowth = totalUsers > 0 ? Math.round((users.filter(u => {
      const createdAt = new Date(u.createdAt);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return createdAt > oneWeekAgo;
    }).length / totalUsers) * 100) : 0;
    
    const bookingGrowth = totalBookings > 0 ? Math.round((bookings.filter(b => {
      const createdAt = new Date(b.createdAt);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return createdAt > oneWeekAgo;
    }).length / totalBookings) * 100) : 0;
    
    const revenueGrowth = totalRevenue > 0 ? Math.round((bookings.filter(b => {
      const createdAt = new Date(b.createdAt);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return createdAt > oneWeekAgo;
    }).reduce((sum, b) => sum + (b.totalPrice || 0), 0) / totalRevenue) * 100) : 0;

    return [
      { 
        title: 'Total Users', 
        value: totalUsers.toLocaleString(), 
        change: userGrowth > 0 ? `+${userGrowth}%` : '0%', 
        icon: UsersIcon,
        color: 'bg-blue-500',
        description: `${users?.filter(u => u.isEmailVerified)?.length || 0} verified`
      },
      { 
        title: 'Total Services', 
        value: totalServices.toLocaleString(), 
        change: activeServices > 0 ? `${Math.round((activeServices/totalServices)*100)}% active` : '0 active',
        icon: BuildingStorefrontIcon,
        color: 'bg-green-500',
        description: `${activeServices} active services`
      },
      { 
        title: 'Total Bookings', 
        value: totalBookings.toLocaleString(), 
        change: bookingGrowth > 0 ? `+${bookingGrowth}%` : '0%',
        icon: CalendarIcon,
        color: 'bg-purple-500',
        description: `${pendingBookings} pending, ${completedBookings} completed`
      },
      { 
        title: 'Total Revenue', 
        value: `₹${totalRevenue.toLocaleString()}`, 
        change: revenueGrowth > 0 ? `+${revenueGrowth}%` : '0%',
        icon: CurrencyRupeeIcon,
        color: 'bg-yellow-500',
        description: `Avg: ₹${totalBookings > 0 ? Math.round(totalRevenue/totalBookings) : 0}/booking`
      },
    ];
  };

  const stats = calculateStats();
  const recentBookings = bookings?.slice(0, 5) || [];
  
  // Calculate booking status distribution
  const calculateBookingStats = () => {
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };
    
    bookings?.forEach(booking => {
      if (booking.status && statusCounts[booking.status] !== undefined) {
        statusCounts[booking.status]++;
      }
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: bookings?.length > 0 ? Math.round((count / bookings.length) * 100) : 0
    }));
  };

  const bookingStats = calculateBookingStats();
  
  // Calculate top services from real data - improved
  const calculateTopServices = () => {
    if (!services) return [];
    
    // First, count bookings per service
    const serviceBookingCount = {};
    bookings?.forEach(booking => {
      if (booking.service && booking.service._id) {
        const serviceId = booking.service._id;
        serviceBookingCount[serviceId] = (serviceBookingCount[serviceId] || 0) + 1;
      }
    });
    
    // Get service details and calculate revenue
    return services
      .map(service => {
        const bookingCount = serviceBookingCount[service._id] || 0;
        const revenue = bookingCount * (service.pricePerDay || 0);
        
        return {
          id: service._id,
          name: service.title,
          category: service.category,
          bookings: bookingCount,
          revenue: revenue,
          rating: service.rating || 0,
          isActive: service.isActive !== false
        };
      })
      .sort((a, b) => b.revenue - a.revenue) // Sort by revenue
      .slice(0, 5); // Top 5
  };

  const topServices = calculateTopServices();

  // Calculate category distribution from real data
  const calculateCategoryDistribution = () => {
    if (!services) return [];
    
    const categoryStats = {};
    
    services.forEach(service => {
      const category = service.category || 'other';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          count: 0,
          totalRevenue: 0,
          activeCount: 0
        };
      }
      
      categoryStats[category].count++;
      if (service.isActive !== false) {
        categoryStats[category].activeCount++;
      }
      
      // Calculate revenue for this category (based on booking count)
      const bookingCount = bookings?.filter(b => 
        b.service && b.service._id === service._id
      ).length || 0;
      categoryStats[category].totalRevenue += bookingCount * (service.pricePerDay || 0);
    });
    
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'];
    
    return Object.entries(categoryStats)
      .map(([category, stats], index) => ({
        name: category,
        count: stats.count,
        activeCount: stats.activeCount,
        revenue: stats.totalRevenue,
        percentage: Math.round((stats.count / services.length) * 100),
        color: colors[index] || colors[colors.length - 1]
      }))
      .sort((a, b) => b.revenue - a.revenue) // Sort by revenue
      .slice(0, 6); // Top 6 categories
  };

  const categoryDistribution = calculateCategoryDistribution();

  // Calculate recent activities
  const getRecentActivities = () => {
    const activities = [];
    
    // Recent bookings
    recentBookings.forEach(booking => {
      activities.push({
        id: booking._id,
        type: 'booking',
        title: 'New Booking',
        description: `${booking.user?.name || 'Customer'} booked ${booking.service?.title || 'a service'}`,
        time: new Date(booking.createdAt).toLocaleString(),
        status: booking.status,
        amount: booking.totalPrice
      });
    });
    
    // Recent user registrations
    const recentUsers = users?.slice(0, 3) || [];
    recentUsers.forEach(user => {
      activities.push({
        id: user._id,
        type: 'user',
        title: 'New User',
        description: `${user.name} registered`,
        time: new Date(user.createdAt).toLocaleString(),
        status: user.isEmailVerified ? 'verified' : 'pending'
      });
    });
    
    // Sort by time and return latest 5
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);
  };

  const recentActivities = getRecentActivities();

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed':
      case 'completed':
      case 'verified':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed':
      case 'completed':
      case 'verified':
        return 'text-green-700 bg-green-100';
      case 'cancelled':
        return 'text-red-700 bg-red-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Admin'}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your platform today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              <button 
                onClick={() => window.location.href = '/admin/bookings'}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all →
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(activity.status)}
                    <div>
                      <div className="font-medium text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-600">{activity.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activity.status && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    )}
                    {activity.amount && (
                      <span className="font-semibold text-gray-900">
                        ₹{activity.amount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Status Distribution */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Status</h3>
            <div className="space-y-4">
              {bookingStats.map((stat) => (
                <div key={stat.status} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">{stat.status}</span>
                      <span className="text-xs text-gray-500">({stat.count})</span>
                    </div>
                    <span className="text-sm text-gray-500">{stat.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        stat.status === 'confirmed' ? 'bg-green-500' :
                        stat.status === 'completed' ? 'bg-blue-500' :
                        stat.status === 'pending' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoryDistribution.map((category) => (
                <div key={category.name} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 capitalize">{category.name}</span>
                    <span className="text-sm text-gray-500">{category.count} services</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Active: {category.activeCount}</span>
                      <span className="text-gray-600">Revenue: ₹{category.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${category.color} h-2 rounded-full`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      {category.percentage}% of all services
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Services */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Services</h3>
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      service.isActive ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <BuildingStorefrontIcon className={`h-5 w-5 ${
                        service.isActive ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 truncate max-w-[150px]">{service.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{service.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">₹{service.revenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{service.bookings} bookings</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {users?.filter(u => u.isEmailVerified)?.length || 0}
              </div>
              <div className="text-sm text-blue-700">Verified Users</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {services?.filter(s => s.isActive !== false)?.length || 0}
              </div>
              <div className="text-sm text-green-700">Active Services</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {bookings?.filter(b => b.status === 'completed')?.length || 0}
              </div>
              <div className="text-sm text-purple-700">Completed Bookings</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {bookings?.filter(b => b.status === 'pending')?.length || 0}
              </div>
              <div className="text-sm text-yellow-700">Pending Bookings</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => window.location.href = '/admin/services'}
              className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition text-center"
            >
              <div className="text-primary-600 font-medium">Manage Services</div>
              <div className="text-xs text-primary-500 mt-1">{services?.length || 0} services</div>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-center"
            >
              <div className="text-green-600 font-medium">Manage Users</div>
              <div className="text-xs text-green-500 mt-1">{users?.length || 0} users</div>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/bookings'}
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-center"
            >
              <div className="text-purple-600 font-medium">View Bookings</div>
              <div className="text-xs text-purple-500 mt-1">{bookings?.length || 0} bookings</div>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/services?action=create'}
              className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition text-center"
            >
              <div className="text-yellow-600 font-medium">Add Service</div>
              <div className="text-xs text-yellow-500 mt-1">Create new</div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;