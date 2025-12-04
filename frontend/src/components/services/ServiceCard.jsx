import { Link } from 'react-router-dom';
import { 
  StarIcon, 
  MapPinIcon, 
  CalendarDaysIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const ServiceCard = ({ service, viewMode = 'grid' }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-yellow-400" />);
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return stars;
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-200">
        <div className="p-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/4 mb-4 md:mb-0">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                {service.images && service.images.length > 0 ? (
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-r from-primary-100 to-primary-200 flex items-center justify-center">
                    <CalendarDaysIcon className="h-12 w-12 text-primary-400" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:w-3/4 md:pl-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link to={`/services/${service._id}`} className="hover:text-primary-600">
                      {service.title}
                    </Link>
                  </h3>
                  <div className="flex items-center mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {service.category}
                    </span>
                    <div className="flex items-center ml-3">
                      {renderStars(service.rating)}
                      <span className="ml-1 text-sm text-gray-600">
                        ({service.totalBookings || 0} bookings)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{service.pricePerDay}
                    <span className="text-sm font-normal text-gray-500"> /day</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Total: ₹{service.pricePerDay * 3} for 3 days
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {service.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {service.features?.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    <CheckBadgeIcon className="h-3 w-3 mr-1" />
                    {feature}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap justify-between items-center">
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{service.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    By Admin
                  </span>
                  <Link
                    to={`/services/${service._id}`}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
      <div className="relative">
        {service.images && service.images.length > 0 ? (
          <img
            src={service.images[0]}
            alt={service.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-primary-100 to-primary-200 flex items-center justify-center">
            <CalendarDaysIcon className="h-12 w-12 text-primary-400" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/90 backdrop-blur-sm text-gray-800">
            {service.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-black/70 backdrop-blur-sm text-white">
            ₹{service.pricePerDay}/day
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            <Link to={`/services/${service._id}`} className="hover:text-primary-600">
              {service.title}
            </Link>
          </h3>
        </div>

        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {renderStars(service.rating)}
            <span className="ml-2 text-sm text-gray-600">{service.rating}</span>
          </div>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-sm text-gray-600">
            {service.totalBookings || 0} bookings
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>

        <div className="flex items-center text-gray-600 mb-4">
          <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm truncate">{service.location}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {service.features?.slice(0, 2).map((feature, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
            >
              <CheckBadgeIcon className="h-3 w-3 mr-1" />
              {feature}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            By Admin
          </div>
          <Link
            to={`/services/${service._id}`}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;