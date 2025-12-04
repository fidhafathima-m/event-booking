import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchUserBookings, 
  cancelBooking,
  fetchUpcomingBookings 
} from '../store/slices/bookingSlice';
import Layout from '../components/common/Layout';
import BookingCard from '../components/bookings/BookingCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import { 
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Bookings = () => {
  const dispatch = useDispatch();
  const { 
    bookings, 
    upcomingBookings, 
    pagination, 
    isLoading 
  } = useSelector((state) => state.bookings);

  const [activeTab, setActiveTab] = useState('upcoming');
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
  if (activeTab === 'upcoming') {
    dispatch(fetchUpcomingBookings());
  } else {
    // Pass status filter to API
    const statusFilter = activeTab === 'all' ? '' : activeTab;
    dispatch(fetchUserBookings({ ...filters, status: statusFilter }));
  }
}, [dispatch, activeTab, filters]);

  const handleCancelBooking = (id, reason) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      dispatch(cancelBooking({ id, reason }));
    }
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const tabs = [
  { id: 'upcoming', label: 'Upcoming', icon: CalendarIcon },
  { id: 'all', label: 'All Bookings', icon: ClockIcon },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircleIcon },
  { id: 'cancelled', label: 'Cancelled', icon: XCircleIcon },
  { id: 'pending', label: 'Pending', icon: ClockIcon } 
];

  const stats = [
    { label: 'Total Bookings', value: bookings.length, color: 'bg-blue-500' },
    { label: 'Upcoming', value: upcomingBookings.length, color: 'bg-green-500' },
    { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'bg-yellow-500' },
    { label: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: 'bg-red-500' }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="mt-2 text-gray-600">
              Manage and track all your event bookings in one place
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id !== 'upcoming') {
                        setFilters(prev => ({ ...prev, status: tab.id === 'all' ? '' : tab.id, page: 1 }));
                      }
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <>
                  {/* Upcoming Bookings */}
                  {activeTab === 'upcoming' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Upcoming Bookings ({upcomingBookings.length})
                      </h3>
                      {upcomingBookings.length === 0 ? (
                        <div className="text-center py-12">
                          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No upcoming bookings
                          </h3>
                          <p className="text-gray-600">
                            You don't have any upcoming bookings. Start by exploring our services.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {upcomingBookings.map((booking) => (
                            <BookingCard
                              key={booking._id}
                              booking={booking}
                              onCancel={handleCancelBooking}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* All Bookings */}
                  {activeTab !== 'upcoming' && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {activeTab === 'all' ? 'All Bookings' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Bookings`}
                        </h3>
                        <div className="flex items-center space-x-4">
                          <select
                            value={filters.limit}
                            onChange={(e) => setFilters(prev => ({ ...prev, limit: e.target.value, page: 1 }))}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          >
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                          </select>
                        </div>
                      </div>

                      {bookings.length === 0 ? (
                        <div className="text-center py-12">
                          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No bookings found
                          </h3>
                          <p className="text-gray-600">
                            {activeTab === 'all' 
                              ? "You haven't made any bookings yet." 
                              : `You don't have any ${activeTab} bookings.`}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-4">
                            {bookings.map((booking) => (
                              <BookingCard
                                key={booking._id}
                                booking={booking}
                                onCancel={handleCancelBooking}
                              />
                            ))}
                          </div>

                          {/* Pagination */}
                          {pagination.pages > 1 && (
                            <div className="mt-8">
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
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Bookings;