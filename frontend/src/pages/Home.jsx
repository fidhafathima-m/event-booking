// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { 
  HomeIcon, 
  CakeIcon, 
  CameraIcon, 
  MusicalNoteIcon,
  SparklesIcon,
  TruckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const categories = [
  { name: 'Venues', icon: HomeIcon, count: 150, color: 'bg-blue-100 text-blue-600' },
  { name: 'Caterers', icon: CakeIcon, count: 85, color: 'bg-green-100 text-green-600' },
  { name: 'Photographers', icon: CameraIcon, count: 120, color: 'bg-purple-100 text-purple-600' },
  { name: 'DJs', icon: MusicalNoteIcon, count: 65, color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Decorators', icon: SparklesIcon, count: 90, color: 'bg-pink-100 text-pink-600' },
  { name: 'Transport', icon: TruckIcon, count: 45, color: 'bg-indigo-100 text-indigo-600' },
];

const features = [
  'Easy booking process',
  'Verified service providers',
  'Secure payments',
  '24/7 customer support',
  'Flexible cancellation policy',
  'Real-time availability'
];

const Home = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-30"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Book Perfect Event Services
          </h1>
          <p className="mt-6 text-xl text-gray-100 max-w-3xl">
            Find and book the best venues, caterers, photographers, and more for your special events.
            Everything you need in one place.
          </p>
          <div className="mt-10">
            <Link
              to="/services"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-8"
            >
              Explore Services
            </Link>
            <Link
              to="/register"
              className="ml-4 inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary-700 md:py-4 md:text-lg md:px-8"
            >
              Become a Provider
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Browse by Category
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Find the perfect service for every aspect of your event
            </p>
          </div>
          <div className="mt-10">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={`/services?category=${category.name.toLowerCase()}`}
                  className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-primary-300 transition"
                >
                  <div>
                    <span className={`rounded-lg inline-flex p-3 ${category.color}`}>
                      <category.icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {category.count}+ providers
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Us
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto">
              We make event planning simple, reliable, and stress-free
            </p>
          </div>
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-lg font-medium text-gray-900">{feature}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-700 rounded-2xl px-6 py-16 sm:p-16">
            <div className="max-w-xl mx-auto lg:max-w-none">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-white">
                  Ready to plan your event?
                </h2>
                <p className="mt-4 text-lg text-primary-100">
                  Join thousands of satisfied customers who have booked their perfect events with us.
                </p>
                <div className="mt-8">
                  <Link
                    to="/register"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-8"
                  >
                    Get Started Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;