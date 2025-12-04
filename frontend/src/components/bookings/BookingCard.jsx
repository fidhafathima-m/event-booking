import { useState } from 'react';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const BookingCard = ({ booking, onCancel }) => {
  const [showDetails, setShowDetails] = useState(false);

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
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const daysDiff = Math.ceil(
    (new Date(booking.bookingDates.endDate) - new Date(booking.bookingDates.startDate)) / (1000 * 3600 * 24)
  ) + 1;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          {/* Left side */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {booking.service?.title || 'Service'}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span className="ml-1 capitalize">{booking.status}</span>
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {booking.service?.category || 'Service'}
                  </span>
                  <span className="text-sm text-gray-600">
                    Booking ID: {booking._id.slice(-8)}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ₹{booking.totalPrice}
                </div>
                <div className="text-sm text-gray-500">
                  {daysDiff} days
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center text-gray-600">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <div>
                  <div className="text-sm">
                    {formatDate(booking.bookingDates.startDate)} - {formatDate(booking.bookingDates.endDate)}
                  </div>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">{booking.service?.location || 'Location'}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <UserIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">{booking.guestsCount} guests</span>
              </div>
            </div>

            {/* Contact Person */}
            {showDetails && booking.contactPerson && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Contact Person</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center text-gray-600">
                    <UserIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">{booking.contactPerson.name}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">{booking.contactPerson.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">{booking.contactPerson.phone}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {showDetails ? 'Hide Details' : 'View Details'}
            </button>

            {booking.status === 'pending' && (
              <button
                onClick={() => {
                  const reason = prompt('Please provide a reason for cancellation:');
                  if (reason) onCancel(booking._id, reason);
                }}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
              >
                Cancel Booking
              </button>
            )}

            {booking.status === 'confirmed' && (
              <button
                onClick={() => {
                  // Contact provider action
                  window.location.href = `mailto:${booking.service?.contactInfo?.email}`;
                }}
                className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-100 rounded-lg hover:bg-primary-200"
              >
                Contact Provider
              </button>
            )}
          </div>
        </div>

        {/* Special Requirements */}
        {showDetails && booking.specialRequirements && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Special Requirements</h4>
            <p className="text-sm text-yellow-700">{booking.specialRequirements}</p>
          </div>
        )}

        {/* Cancellation Reason */}
        {showDetails && booking.status === 'cancelled' && booking.cancellationReason && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Cancellation Reason</h4>
            <p className="text-sm text-red-700">{booking.cancellationReason}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;