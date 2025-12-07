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
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  TagIcon,
  InformationCircleIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-hot-toast';

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

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    dispatch(fetchAllBookings(filters));
  }, [dispatch, filters]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    if (window.confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) {
      setIsUpdating(true);
      try {
        await dispatch(updateBookingStatus({ 
          bookingId, 
          status: newStatus,
          reason: newStatus === 'cancelled' ? 'Cancelled by admin' : ''
        })).unwrap();
        
        toast.success(`Booking ${newStatus} successfully`);
        
        // Update the selected booking in modal if it's the same booking
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking(prev => ({
            ...prev,
            status: newStatus,
            updatedAt: new Date().toISOString()
          }));
        }
        
        // Immediately update the bookings list
        dispatch(fetchAllBookings(filters));
        
        // Close modal if action was successful
        if (newStatus === 'confirmed' || newStatus === 'cancelled') {
          closeModal();
        }
        
      } catch (error) {
        toast.error(`Failed to update booking: ${error.message || 'Unknown error'}`);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const openViewModal = (booking) => {
    console.log('Booking data for modal:', booking);
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  const closeModal = () => {
    setShowViewModal(false);
    setSelectedBooking(null);
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
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
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

  const getPricePerDay = (booking) => {
    if (booking.service?.pricePerDay) return booking.service.pricePerDay;
    if (booking.totalPrice && booking.bookingDates?.totalDays) {
      return Math.round(booking.totalPrice / booking.bookingDates.totalDays);
    }
    return 0;
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Bookings
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID, customer, service..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

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
                        Booking ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
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
                    {bookings.map((booking) => {
                      const pricePerDay = getPricePerDay(booking);
                      return (
                        <tr key={booking._id} className="hover:bg-gray-50">
                          {/* Booking ID */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              #{booking._id.slice(-8)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(booking.createdAt)}
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-gray-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {booking.contactPerson?.name || booking.user?.name || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {booking.contactPerson?.email || booking.user?.email || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Service */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {booking.service?.title || 'Service Unavailable'}
                              </div>
                              <div className="text-gray-500">
                                {booking.service?.category || 'N/A'}
                              </div>
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              ₹{booking.totalPrice || 0}
                            </div>
                            <div className="text-xs text-gray-500">
                              {pricePerDay > 0 ? `₹${pricePerDay}/day` : 'Price/day not available'}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(booking.status)}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => openViewModal(booking)}
                                className="text-primary-600 hover:text-primary-900 p-1"
                                title="View Details"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              {booking.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                    className="text-green-600 hover:text-green-900 p-1 disabled:opacity-50"
                                    title="Confirm Booking"
                                    disabled={isUpdating}
                                  >
                                    <CheckCircleIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                    className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                                    title="Cancel Booking"
                                    disabled={isUpdating}
                                  >
                                    <XCircleIcon className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
              {pagination?.pages > 1 && (
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

      {/* View Booking Modal */}
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
                  className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                  disabled={isUpdating}
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
                        Booking #{selectedBooking._id?.slice(-8)}
                      </h3>
                      <div className="flex items-center mt-2">
                        {getStatusBadge(selectedBooking.status)}
                        <span className="text-sm text-gray-600 ml-4">
                          Created: {formatDateTime(selectedBooking.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        ₹{selectedBooking.totalPrice || 0}
                      </div>
                      <div className="text-sm text-gray-500">Total Amount</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Customer Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <UserIcon className="h-5 w-5 mr-2" />
                      Customer Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {selectedBooking.contactPerson?.name || selectedBooking.user?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedBooking.contactPerson?.email || selectedBooking.user?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-600">Contact Email</div>
                            <div className="font-medium">{selectedBooking.contactPerson?.email || selectedBooking.user?.email || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-600">Contact Phone</div>
                            <div className="font-medium">{selectedBooking.contactPerson?.phone || selectedBooking.user?.phone || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
                      Service Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        {selectedBooking.service?.images?.[0] ? (
                          <img 
                            src={selectedBooking.service.images[0]} 
                            alt={selectedBooking.service.title}
                            className="h-16 w-16 rounded-lg object-cover mr-4"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4"><BuildingStorefrontIcon class="h-8 w-8 text-gray-600" /></div>';
                            }}
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                            <BuildingStorefrontIcon className="h-8 w-8 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {selectedBooking.service?.title || 'Service Unavailable'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedBooking.service?.category || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-600">Location</div>
                            <div className="font-medium">{selectedBooking.service?.location || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-600">Category</div>
                            <div className="font-medium">{selectedBooking.service?.category || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Dates */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CalendarDaysIcon className="h-5 w-5 mr-2" />
                      Booking Dates
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Start Date</div>
                          <div className="font-medium">
                            {formatDate(selectedBooking.bookingDates?.startDate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">End Date</div>
                          <div className="font-medium">
                            {formatDate(selectedBooking.bookingDates?.endDate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Number of Days</div>
                          <div className="font-medium">
                            {selectedBooking.bookingDates?.totalDays || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Guests</div>
                          <div className="font-medium flex items-center">
                            <UsersIcon className="h-4 w-4 mr-2 text-gray-500" />
                            {selectedBooking.guestsCount || 0}
                          </div>
                        </div>
                      </div>
                      
                      {selectedBooking.specialRequirements && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Special Requirements</div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            {selectedBooking.specialRequirements}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CreditCardIcon className="h-5 w-5 mr-2" />
                      Payment Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="text-gray-600">Total Days</div>
                        <div className="font-medium">{selectedBooking.bookingDates?.totalDays || 0}</div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-gray-600">Price per Day (Calculated)</div>
                        <div className="font-medium">
                          ₹{getPricePerDay(selectedBooking)}
                        </div>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <div>Total Amount</div>
                          <div>₹{selectedBooking.totalPrice || 0}</div>
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
                      {selectedBooking.cancellationReason && (
                        <div className="pt-2">
                          <div className="text-sm text-gray-600">Cancellation Reason</div>
                          <div className="text-sm font-medium text-red-600">
                            {selectedBooking.cancellationReason}
                          </div>
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
                      onClick={() => handleStatusUpdate(selectedBooking._id, 'cancelled')}
                      className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-4 w-4 mr-2" />
                          Cancel Booking
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedBooking._id, 'confirmed')}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Confirm Booking
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
    </AdminLayout>
  );
};

export default AdminBookings;