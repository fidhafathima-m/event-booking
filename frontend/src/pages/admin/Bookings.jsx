import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllBookings,
  updateBookingStatus 
} from '../../store/slices/adminSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { 
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  BuildingStorefrontIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminBookings = () => {
  const dispatch = useDispatch();
  const { bookings, pagination, isLoading } = useSelector((state) => state.admin);
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    dispatch(fetchAllBookings(filters));
  }, [dispatch, filters]);

  const handleStatusUpdate = (bookingId, newStatus) => {
    if (window.confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) {
      dispatch(updateBookingStatus({ 
        bookingId, 
        status: newStatus,
        reason: newStatus === 'cancelled' ? 'Cancelled by admin' : ''
      }));
    }
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="mt-2 text-gray-600">
            View and manage all bookings on the platform
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Bookings
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Date Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        {/* Booking Details */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            Booking #{booking._id.slice(-8)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.user?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.user?.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Service */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <BuildingStorefrontIcon className="h-4 w-4 mr-2 text-gray-400" />
                              {booking.service?.title}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {booking.service?.category}
                            </div>
                          </div>
                        </td>

                        {/* Dates */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                              {new Date(booking.bookingDates.startDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              to {new Date(booking.bookingDates.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            <div className="flex items-center">
                              <CurrencyRupeeIcon className="h-4 w-4 mr-2 text-gray-400" />
                              ₹{booking.totalPrice}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.bookingDates.totalDays} days
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {getStatusBadge(booking.status)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                              disabled={booking.status === 'confirmed' || booking.status === 'cancelled'}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                              disabled={booking.status === 'cancelled'}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {bookings.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No bookings found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search filters
                  </p>
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBookings;