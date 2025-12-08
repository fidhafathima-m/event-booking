import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchUserBookings, 
  cancelBooking,
  fetchUpcomingBookings
} from '../store/slices/bookingSlice';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import { 
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  EyeIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  TagIcon,
  InformationCircleIcon,
  UserCircleIcon
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
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (activeTab === 'upcoming') {
      dispatch(fetchUpcomingBookings());
    } else {
      const statusFilter = activeTab === 'all' ? '' : activeTab;
      dispatch(fetchUserBookings({ ...filters, status: statusFilter }));
    }
  }, [dispatch, activeTab, filters]);

  const handleCancelBooking = async (id, reason) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setIsCancelling(true);
      try {
        await dispatch(cancelBooking({ id, reason })).unwrap();
        // Refresh bookings after cancellation
        if (activeTab === 'upcoming') {
          dispatch(fetchUpcomingBookings());
        } else {
          const statusFilter = activeTab === 'all' ? '' : activeTab;
          dispatch(fetchUserBookings({ ...filters, status: statusFilter }));
        }
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const openViewModal = (booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  const closeModal = () => {
    setShowViewModal(false);
    setSelectedBooking(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date', error;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date', error;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', icon: CalendarIcon },
    { id: 'all', label: 'All Bookings', icon: ClockIcon },
    { id: 'confirmed', label: 'Confirmed', icon: CheckCircleIcon },
    { id: 'cancelled', label: 'Cancelled', icon: XCircleIcon },
    { id: 'pending', label: 'Pending', icon: ClockIcon }
  ];

  const calculateStats = () => {
    const totalBookings = bookings?.length || 0;
    const upcoming = upcomingBookings?.length || 0;
    const pending = bookings?.filter(b => b.status === 'pending')?.length || 0;
    const cancelled = bookings?.filter(b => b.status === 'cancelled')?.length || 0;
    const confirmed = bookings?.filter(b => b.status === 'confirmed')?.length || 0;
    const completed = bookings?.filter(b => b.status === 'completed')?.length || 0;

    return [
      { 
        label: 'Total Bookings', 
        value: totalBookings, 
        color: 'bg-blue-500',
        description: `${confirmed} confirmed, ${completed} completed`
      },
      { 
        label: 'Upcoming', 
        value: upcoming, 
        color: 'bg-green-500',
        description: 'Scheduled events'
      },
      { 
        label: 'Pending', 
        value: pending, 
        color: 'bg-yellow-500',
        description: 'Awaiting confirmation'
      },
      { 
        label: 'Cancelled', 
        value: cancelled, 
        color: 'bg-red-500',
        description: 'Cancelled bookings'
      }
    ];
  };

  const stats = calculateStats();

  // User can only cancel pending bookings
  const canCancelBooking = (booking) => {
    return booking.status === 'pending';
  };

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
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
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
                  {/* Upcoming Bookings Table */}
                  {activeTab === 'upcoming' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Upcoming Bookings ({upcomingBookings?.length || 0})
                      </h3>
                      {(!upcomingBookings || upcomingBookings.length === 0) ? (
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
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
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
                              {upcomingBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      {booking.service?.images?.[0] ? (
                                        <img 
                                          src={booking.service.images[0]} 
                                          alt={booking.service.title}
                                          className="h-10 w-10 rounded-lg object-cover mr-3"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<div class="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3"><BuildingStorefrontIcon class="h-5 w-5 text-gray-600" /></div>';
                                          }}
                                        />
                                      ) : (
                                        <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                                          <BuildingStorefrontIcon className="h-5 w-5 text-gray-600" />
                                        </div>
                                      )}
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">
                                          {booking.service?.title || 'Service Unavailable'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {booking.service?.category || 'N/A'}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {formatDate(booking.bookingDates?.startDate || booking.startDate)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {booking.bookingDates?.totalDays || booking.numberOfDays || 0} day(s)
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">
                                      ₹{booking.totalPrice || booking.totalAmount || 0}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      {getStatusIcon(booking.status)}
                                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                        {booking.status}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                      <button 
                                        onClick={() => openViewModal(booking)}
                                        className="text-primary-600 hover:text-primary-900 p-1"
                                        title="View Details"
                                      >
                                        <EyeIcon className="h-4 w-4" />
                                      </button>
                                      {canCancelBooking(booking) && (
                                        <button 
                                          onClick={() => handleCancelBooking(booking._id, 'Cancelled by user')}
                                          className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                                          title="Cancel Booking"
                                          disabled={isCancelling}
                                        >
                                          <XCircleIcon className="h-4 w-4" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* All Bookings Table */}
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

                      {(!bookings || bookings.length === 0) ? (
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
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        {booking.service?.images?.[0] ? (
                                          <img 
                                            src={booking.service.images[0]} 
                                            alt={booking.service.title}
                                            className="h-10 w-10 rounded-lg object-cover mr-3"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                              e.target.parentElement.innerHTML = '<div class="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3"><BuildingStorefrontIcon class="h-5 w-5 text-gray-600" /></div>';
                                            }}
                                          />
                                        ) : (
                                          <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                                            <BuildingStorefrontIcon className="h-5 w-5 text-gray-600" />
                                          </div>
                                        )}
                                        <div>
                                          <div className="text-sm font-medium text-gray-900">
                                            {booking.service?.title || 'Service Unavailable'}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            {booking.service?.category || 'N/A'}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">
                                        {formatDate(booking.bookingDates?.startDate || booking.startDate)}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {booking.bookingDates?.totalDays || booking.numberOfDays || 0} day(s)
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-semibold text-gray-900">
                                        ₹{booking.totalPrice || booking.totalAmount || 0}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        {getStatusIcon(booking.status)}
                                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                          {booking.status}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                      <div className="flex space-x-2">
                                        <button 
                                          onClick={() => openViewModal(booking)}
                                          className="text-primary-600 hover:text-primary-900 p-1"
                                          title="View Details"
                                        >
                                          <EyeIcon className="h-4 w-4" />
                                        </button>
                                        {canCancelBooking(booking) && (
                                          <button 
                                            onClick={() => handleCancelBooking(booking._id, 'Cancelled by user')}
                                            className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                                            title="Cancel Booking"
                                            disabled={isCancelling}
                                          >
                                            <XCircleIcon className="h-4 w-4" />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination */}
                          {pagination?.pages > 1 && (
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

      {/* View Booking Modal - USER VERSION */}
      {showViewModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Booking Details
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-8">
                {/* Booking Header */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Booking #{selectedBooking._id?.slice(-8).toUpperCase()}
                      </h3>
                      <div className="flex items-center mt-2">
                        <div className="flex items-center">
                          {getStatusIcon(selectedBooking.status)}
                          <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.status)}`}>
                            {selectedBooking.status.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 ml-4">
                          Created: {formatDateTime(selectedBooking.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        ₹{selectedBooking.totalPrice || selectedBooking.totalAmount || 0}
                      </div>
                      <div className="text-sm text-gray-500">Total Amount</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Service Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
                      Service Details
                    </h4>
                    <div className="space-y-4">
                      {selectedBooking.service?.images?.[0] && (
                        <img 
                          src={selectedBooking.service.images[0]} 
                          alt={selectedBooking.service.title}
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div>
                        <h5 className="font-medium text-gray-900">{selectedBooking.service?.title || 'Service Unavailable'}</h5>
                        <div className="flex items-center mt-1 text-gray-600">
                          <TagIcon className="h-4 w-4 mr-2" />
                          {selectedBooking.service?.category || 'N/A'}
                        </div>
                        <div className="flex items-center mt-1 text-gray-600">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          {selectedBooking.service?.location || 'N/A'}
                        </div>
                        {selectedBooking.service?.pricePerDay && (
                          <div className="flex items-center mt-1 text-gray-600">
                            <CurrencyRupeeIcon className="h-4 w-4 mr-2" />
                            ₹{selectedBooking.service.pricePerDay}/day
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Booking Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CalendarDaysIcon className="h-5 w-5 mr-2" />
                      Booking Information
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Start Date</div>
                          <div className="font-medium">
                            {formatDate(selectedBooking.bookingDates?.startDate || selectedBooking.startDate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">End Date</div>
                          <div className="font-medium">
                            {formatDate(selectedBooking.bookingDates?.endDate || selectedBooking.endDate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Number of Days</div>
                          <div className="font-medium">
                            {selectedBooking.bookingDates?.totalDays || selectedBooking.numberOfDays || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Guests</div>
                          <div className="font-medium">
                            {selectedBooking.guestsCount || selectedBooking.guestCount || 'N/A'}
                          </div>
                        </div>
                      </div>
                      
                      {(selectedBooking.specialRequirements || selectedBooking.specialRequests) && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Special Requirements</div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            {selectedBooking.specialRequirements || selectedBooking.specialRequests}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <UserCircleIcon className="h-5 w-5 mr-2" />
                      Your Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-600">Email</div>
                          <div className="font-medium">
                            {selectedBooking.contactPerson?.email || selectedBooking.contactEmail || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-600">Phone</div>
                          <div className="font-medium">
                            {selectedBooking.contactPerson?.phone || selectedBooking.contactPhone || 'N/A'}
                          </div>
                        </div>
                      </div>
                      {selectedBooking.contactPerson?.name && (
                        <div>
                          <div className="text-sm text-gray-600">Contact Person</div>
                          <div className="font-medium">{selectedBooking.contactPerson.name}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                      Payment Summary
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="text-gray-600">Service Fee per Day</div>
                        <div className="font-medium">₹{selectedBooking.service?.pricePerDay || 0}</div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-gray-600">Number of Days</div>
                        <div className="font-medium">{selectedBooking.bookingDates?.totalDays || selectedBooking.numberOfDays || 0}</div>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <div>Total Amount</div>
                          <div>₹{selectedBooking.totalPrice || selectedBooking.totalAmount || 0}</div>
                        </div>
                      </div>
                      {selectedBooking.paymentStatus && (
                        <div className="pt-2">
                          <div className="text-sm text-gray-600">Payment Status</div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedBooking.paymentStatus === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedBooking.paymentStatus?.toUpperCase() || 'PENDING'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <InformationCircleIcon className="h-5 w-5 mr-2" />
                    Additional Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Booking ID</div>
                        <div className="font-medium text-xs">{selectedBooking._id}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Created At</div>
                        <div className="font-medium">{formatDateTime(selectedBooking.createdAt)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Last Updated</div>
                        <div className="font-medium">{formatDateTime(selectedBooking.updatedAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Only show for pending bookings */}
                {selectedBooking.status === 'pending' && (
                  <div className="border-t pt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        handleCancelBooking(selectedBooking._id, 'Cancelled by user');
                        closeModal();
                      }}
                      className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 flex items-center disabled:opacity-50"
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-4 w-4 mr-2" />
                          Cancel Booking
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Bookings;