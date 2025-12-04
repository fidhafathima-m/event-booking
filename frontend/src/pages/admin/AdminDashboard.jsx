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
  UserGroupIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { bookings, services, users, isLoading } = useSelector((state) => state.admin);
  let { stats } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch all necessary data for dashboard
    dispatch(fetchAllBookings({}));
    dispatch(fetchAllServices({}));
    dispatch(fetchAllUsers({}));
    // You might need to add a new action to fetch platform stats
    // dispatch(fetchPlatformStats());
  }, [dispatch]);

  // Calculate stats from real data
  const calculateStats = () => {
    const totalUsers = users?.length || 0;
    const totalServices = services?.length || 0;
    const totalBookings = bookings?.length || 0;
    const totalRevenue = bookings?.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0) || 0;
    

    return [
      { 
        title: 'Total Users', 
        value: totalUsers.toLocaleString(), 
        change: '+12%', // Replace with real calculation
        icon: UsersIcon,
        color: 'bg-blue-500'
      },
      { 
        title: 'Total Services', 
        value: totalServices.toLocaleString(), 
        change: '+8%', // Replace with real calculation
        icon: BuildingStorefrontIcon,
        color: 'bg-green-500'
      },
      { 
        title: 'Total Bookings', 
        value: totalBookings.toLocaleString(), 
        change: '+23%', // Replace with real calculation
        icon: CalendarIcon,
        color: 'bg-purple-500'
      },
      { 
        title: 'Total Revenue', 
        value: `₹${totalRevenue.toLocaleString()}`, 
        change: '+15%', // Replace with real calculation
        icon: CurrencyRupeeIcon,
        color: 'bg-yellow-500'
      },
    ];
  };

  stats = calculateStats();
  const recentBookings = bookings?.slice(0, 5) || [];
  
  // Calculate top services from real data
  const calculateTopServices = () => {
    if (!services) return [];
    
    return services
      .slice(0, 4)
      .map(service => ({
        name: service.title,
        bookings: service.totalBookings || 0,
        revenue: `₹${(service.pricePerDay * (service.totalBookings || 0)).toLocaleString()}`
      }));
  };

  const topServices = calculateTopServices();

  // Calculate category distribution from real data
  const calculateCategoryDistribution = () => {
    if (!services) return [];
    
    const categoryCount = {};
    services.forEach(service => {
      categoryCount[service.category] = (categoryCount[service.category] || 0) + 1;
    });
    
    const total = services.length;
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-gray-500'];
    
    return Object.entries(categoryCount)
      .slice(0, 5)
      .map(([name, count], index) => ({
        name,
        value: Math.round((count / total) * 100),
        color: colors[index] || colors[colors.length - 1]
      }));
  };

  const categoryDistribution = calculateCategoryDistribution();

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
            Welcome back, {user?.name}!
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings - Update to use real data */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              <button 
                onClick={() => window.location.href = '/admin/bookings'}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.service?.title || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <UserGroupIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.user?.name || 'Customer'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.user?.email || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{booking.totalPrice || 0}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Categories</h3>
            <div className="space-y-4">
              {categoryDistribution.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm text-gray-500">{category.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${category.color} h-2 rounded-full`}
                      style={{ width: `${category.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Services */}
          <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Services</h3>
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Bookings
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topServices.map((service, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{service.bookings}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-semibold text-gray-900">{service.revenue}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => window.location.href = '/admin/services/new'}
              className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition text-center"
            >
              <div className="text-primary-600 font-medium">Add New Service</div>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/reports'}
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-center"
            >
              <div className="text-green-600 font-medium">View Reports</div>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-center"
            >
              <div className="text-purple-600 font-medium">Manage Users</div>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/settings'}
              className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition text-center"
            >
              <div className="text-yellow-600 font-medium">System Settings</div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;