import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Dialog } from '@headlessui/react';
import { 
  XMarkIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const BookingForm = ({ service, selectedDates, guestsCount, totalPrice, onClose, onSubmit }) => {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    contactPerson: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    },
    specialRequirements: '',
    paymentMethod: 'credit_card'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('contactPerson.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactPerson: {
          ...prev.contactPerson,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  
  // Use local date formatting (not UTC)
  const formatLocalDate = (date) => {
    const d = new Date(date);
    // Get local year, month, day
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const bookingData = {
    serviceId: service._id,
    startDate: formatLocalDate(selectedDates.startDate),
    endDate: formatLocalDate(selectedDates.endDate),
    guestsCount: parseInt(guestsCount),
    specialRequirements: formData.specialRequirements || '',
    contactPerson: {
      name: formData.contactPerson.name,
      email: formData.contactPerson.email,
      phone: formData.contactPerson.phone
    }
  };
  
  console.log("Booking with LOCAL dates:", bookingData);
  
  onSubmit(bookingData);
};

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const daysDiff = Math.ceil(
    (selectedDates.endDate - selectedDates.startDate) / (1000 * 3600 * 24)
  ) + 1;

  const serviceFee = Math.round(totalPrice * 0.1);
  const grandTotal = totalPrice + serviceFee;

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 mr-3" />
              <div>
                <Dialog.Title className="text-xl font-bold">
                  Complete Your Booking
                </Dialog.Title>
                <p className="text-sm text-primary-100 mt-1">
                  Final step to secure your booking
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-8">
                {/* Booking Summary Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    Booking Summary
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Service Details */}
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                          <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{service.title}</h4>
                          <p className="text-sm text-gray-500">{service.category}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center text-gray-700">
                          <CalendarDaysIcon className="h-4 w-4 mr-3 text-gray-400" />
                          <div>
                            <div className="font-medium">{formatDate(selectedDates.startDate)}</div>
                            <div className="text-sm text-gray-500">Check-in</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-700">
                          <CalendarDaysIcon className="h-4 w-4 mr-3 text-gray-400" />
                          <div>
                            <div className="font-medium">{formatDate(selectedDates.endDate)}</div>
                            <div className="text-sm text-gray-500">Check-out</div>
                          </div>
                        </div>

                        <div className="flex items-center text-gray-700">
                          <UserGroupIcon className="h-4 w-4 mr-3 text-gray-400" />
                          <div>
                            <div className="font-medium">{guestsCount} {guestsCount === 1 ? 'Guest' : 'Guests'}</div>
                            <div className="text-sm text-gray-500">Capacity: {service.capacity || 'Unlimited'} max</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h4 className="font-medium text-gray-900 mb-4">Price Breakdown</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">₹{service.pricePerDay} × {daysDiff} days</span>
                          <span className="font-medium">₹{totalPrice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service fee</span>
                          <span className="font-medium">₹{serviceFee}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total Amount</span>
                            <span className="text-lg text-primary-600">₹{grandTotal}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">All taxes included</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="contactPerson.name"
                        value={formData.contactPerson.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="contactPerson.email"
                        value={formData.contactPerson.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="contactPerson.phone"
                        value={formData.contactPerson.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requirements</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Let us know if you have any special requests or requirements for your booking.
                  </p>
                  <textarea
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition resize-none"
                    placeholder="E.g., Dietary restrictions, accessibility needs, celebration arrangements..."
                  />
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
                    Payment Method
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <label className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${formData.paymentMethod === 'credit_card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={formData.paymentMethod === 'credit_card'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg mb-3"></div>
                        <span className="font-medium text-gray-900">Credit/Debit Card</span>
                        <span className="text-sm text-gray-500 mt-1">Visa, Mastercard</span>
                      </div>
                      {formData.paymentMethod === 'credit_card' && (
                        <div className="absolute top-2 right-2">
                          <div className="h-4 w-4 bg-primary-500 rounded-full flex items-center justify-center">
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </label>

                    <label className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${formData.paymentMethod === 'upi' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={formData.paymentMethod === 'upi'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-16 bg-gradient-to-r from-green-400 to-green-600 rounded-lg mb-3"></div>
                        <span className="font-medium text-gray-900">UPI</span>
                        <span className="text-sm text-gray-500 mt-1">GPay, PhonePe</span>
                      </div>
                      {formData.paymentMethod === 'upi' && (
                        <div className="absolute top-2 right-2">
                          <div className="h-4 w-4 bg-primary-500 rounded-full flex items-center justify-center">
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </label>

                    <label className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${formData.paymentMethod === 'net_banking' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="net_banking"
                        checked={formData.paymentMethod === 'net_banking'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center">
                        <div className="h-10 w-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg mb-3"></div>
                        <span className="font-medium text-gray-900">Net Banking</span>
                        <span className="text-sm text-gray-500 mt-1">All major banks</span>
                      </div>
                      {formData.paymentMethod === 'net_banking' && (
                        <div className="absolute top-2 right-2">
                          <div className="h-4 w-4 bg-primary-500 rounded-full flex items-center justify-center">
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Note:</span> Payment will be processed only after booking confirmation. You can cancel for free within 48 hours of booking.
                    </p>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <label className="flex items-start cursor-pointer group">
                    <input
                      type="checkbox"
                      required
                      className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300 mt-0.5"
                    />
                    <span className="ml-3 text-gray-700">
                      I agree to the{' '}
                      <a href="/terms" className="text-primary-600 hover:text-primary-700 font-medium underline">
                        Terms of Service
                      </a>
                      {' '}and{' '}
                      <a href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium underline">
                        Privacy Policy
                      </a>
                      . I understand that this booking is subject to availability confirmation and I acknowledge the cancellation policy.
                    </span>
                  </label>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <p>By confirming, you agree to our booking policies</p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 font-medium shadow-lg hover:shadow-xl transition-all flex items-center"
                    >
                      <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                      Confirm Booking - ₹{grandTotal}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default BookingForm;