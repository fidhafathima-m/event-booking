import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchServiceById,
  checkAvailability,
} from "../store/slices/serviceSlice";
import { createBooking } from "../store/slices/bookingSlice";
import Layout from "../components/common/Layout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import BookingForm from "../components/bookings/BookingForm";
import {
  StarIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  UserIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { service, isLoading } = useSelector((state) => state.services);
  const { user } = useSelector((state) => state.auth);
  const { isLoading: isBookingLoading } = useSelector(
    (state) => state.bookings
  );

  const [selectedDates, setSelectedDates] = useState({
    startDate: null,
    endDate: null,
  });
  const [guestsCount, setGuestsCount] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    dispatch(fetchServiceById(id));
  }, [dispatch, id]);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setSelectedDates({ startDate: start, endDate: end });

    if (start && end) {
      dispatch(
        checkAvailability({
          id,
          dates: { startDate: start, endDate: end },
        })
      );
    }
  };

  const handleBookNow = () => {
    if (!user) {
      toast.error("Please login to book services");
      navigate("/login", { state: { from: `/services/${id}` } });
      return;
    }
    setShowBookingForm(true);
  };

  const handleBookingSubmit = (bookingData) => {
    const data = {
      serviceId: id,
      ...bookingData,
    };

    dispatch(createBooking(data))
      .unwrap()
      .then(() => {
        toast.success("Booking request submitted successfully!");
        navigate("/bookings");
      })
      .catch((error) => {
        toast.error(error.message || "Failed to create booking");
      });
  };

  const calculateTotalPrice = () => {
    if (!selectedDates.startDate || !selectedDates.endDate || !service)
      return 0;

    const start = new Date(selectedDates.startDate);
    const end = new Date(selectedDates.endDate);
    const timeDiff = Math.abs(end - start);
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    return service.pricePerDay * totalDays;
  };

  if (isLoading || !service) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-yellow-400" />);
      } else {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-gray-300" />);
      }
    }
    return stars;
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "features", label: "Features" },
    { id: "pricing", label: "Pricing" },
    { id: "reviews", label: "Reviews" },
    { id: "provider", label: "Provider Info" },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <button
                    onClick={() => navigate("/services")}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="text-gray-400 mx-2">/</span>
                    <button
                      onClick={() => navigate("/services")}
                      className="text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      Services
                    </button>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {service.title}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Left Column - Service Info */}
            <div className="lg:col-span-2">
              {/* Gallery */}
              <div className="mb-8">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-2xl overflow-hidden">
                  {service.images && service.images.length > 0 ? (
                    <img
                      src={service.images[0]}
                      alt={service.title}
                      className="w-full h-96 object-cover"
                    />
                  ) : (
                    <div className="w-full h-96 bg-gradient-to-r from-primary-100 to-primary-200 flex items-center justify-center">
                      <CalendarDaysIcon className="h-24 w-24 text-primary-400" />
                    </div>
                  )}
                </div>
                {service.images && service.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {service.images.slice(1, 5).map((image, index) => (
                      <div key={index} className="aspect-w-1 aspect-h-1">
                        <img
                          src={image}
                          alt={`${service.title} ${index + 2}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Service Header */}
              <div className="mb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </h1>
                    <div className="flex items-center mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mr-3">
                        {service.category}
                      </span>
                      <div className="flex items-center">
                        {renderStars(service.rating)}
                        <span className="ml-2 text-gray-600">
                          {service.rating} • {service.totalBookings || 0}{" "}
                          bookings
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      ₹{service.pricePerDay}
                      <span className="text-lg font-normal text-gray-500">
                        {" "}
                        /day
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">Starting price</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600 mb-6">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  <span>{service.location}</span>
                </div>

                <p className="text-gray-700 text-lg mb-8">
                  {service.description}
                </p>
              </div>

              {/* Tabs */}
              <div className="mb-8">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? "border-primary-500 text-primary-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="mt-6">
                  {activeTab === "overview" && (
                    <div className="prose max-w-none">
                      <p className="text-gray-700">{service.description}</p>
                      {service.capacity && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-gray-900">
                            Capacity
                          </h4>
                          <p className="text-gray-600">
                            Up to {service.capacity} guests
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === "features" && (
                    <div className="grid grid-cols-2 gap-4">
                      {service.features?.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <CheckBadgeIcon className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === "pricing" && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Pricing Details
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Base price per day
                            </span>
                            <span className="font-medium">
                              ₹{service.pricePerDay}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Minimum booking period
                            </span>
                            <span className="font-medium">1 day</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Security deposit
                            </span>
                            <span className="font-medium">
                              ₹{Math.round(service.pricePerDay * 0.3)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === "provider" && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                            {/* Use admin icon or shield icon */}
                            <svg
                              className="h-6 w-6 text-primary-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="font-semibold text-gray-900">
                            Admin Verified Service
                          </h4>
                          <p className="text-gray-600 mt-1">
                            This service is verified and managed by platform
                            administrators
                          </p>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center text-gray-600">
                              <EnvelopeIcon className="h-4 w-4 mr-2" />
                              <span>admin@eventbook.com</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <PhoneIcon className="h-4 w-4 mr-2" />
                              <span>+1 234 567 8900</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                              <span>EventBook Platform</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Booking Widget */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg sticky top-8">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Book This Service
                  </h3>

                  {/* Date Picker */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Dates
                    </label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <DatePicker
                        selected={selectedDates.startDate}
                        onChange={handleDateChange}
                        startDate={selectedDates.startDate}
                        endDate={selectedDates.endDate}
                        selectsRange
                        inline
                        minDate={new Date()}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Guests
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          setGuestsCount(Math.max(1, guestsCount - 1))
                        }
                        className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-50"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={service.capacity || 100}
                        value={guestsCount}
                        onChange={(e) =>
                          setGuestsCount(parseInt(e.target.value) || 1)
                        }
                        className="w-full px-4 py-2 border-t border-b border-gray-300 text-center"
                      />
                      <button
                        type="button"
                        onClick={() => setGuestsCount(guestsCount + 1)}
                        className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    {service.capacity && (
                      <p className="mt-1 text-sm text-gray-500">
                        Maximum capacity: {service.capacity} guests
                      </p>
                    )}
                  </div>

                  {/* Price Summary */}
                  {selectedDates.startDate && selectedDates.endDate && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Price Summary
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            ₹{service.pricePerDay} ×{" "}
                            {Math.ceil(
                              (selectedDates.endDate -
                                selectedDates.startDate) /
                                (1000 * 3600 * 24)
                            ) + 1}{" "}
                            days
                          </span>
                          <span className="font-medium">
                            ₹{calculateTotalPrice()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service fee</span>
                          <span className="font-medium">
                            ₹{Math.round(calculateTotalPrice() * 0.1)}
                          </span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span className="text-lg">
                              ₹
                              {calculateTotalPrice() +
                                Math.round(calculateTotalPrice() * 0.1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Book Now Button */}
                  <button
                    onClick={handleBookNow}
                    disabled={
                      !selectedDates.startDate ||
                      !selectedDates.endDate ||
                      isBookingLoading
                    }
                    className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg transition"
                  >
                    {isBookingLoading ? "Processing..." : "Book Now"}
                  </button>

                  {/* Additional Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <CheckBadgeIcon className="h-4 w-4 mr-2 text-green-500" />
                      <span>Instant confirmation</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckBadgeIcon className="h-4 w-4 mr-2 text-green-500" />
                      <span>Free cancellation within 48 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm
          service={service}
          selectedDates={selectedDates}
          guestsCount={guestsCount}
          totalPrice={calculateTotalPrice()}
          onClose={() => setShowBookingForm(false)}
          onSubmit={handleBookingSubmit}
        />
      )}
    </Layout>
  );
};

export default ServiceDetail;
