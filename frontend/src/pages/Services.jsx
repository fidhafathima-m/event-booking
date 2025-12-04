import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchServices, setFilters } from '../store/slices/serviceSlice';
import Layout from '../components/common/Layout';
import ServiceCard from '../components/services/ServiceCard';
import ServiceFilters from '../components/services/ServiceFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import { 
  AdjustmentsHorizontalIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  FunnelIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Services = () => {
  const dispatch = useDispatch();
  const { 
    services, 
    pagination, 
    filterOptions, 
    filters, 
    isLoading 
  } = useSelector((state) => state.services);

  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    dispatch(fetchServices(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (newFilters) => {
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    dispatch(setFilters(localFilters));
    setShowFilters(false);
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    dispatch(setFilters(clearedFilters));
  };

  const handlePageChange = (page) => {
    dispatch(setFilters({ ...filters, page }));
  };

  const sortOptions = [
    { value: 'createdAt', label: 'Newest' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'rating', label: 'Rating' },
    { value: 'popularity', label: 'Most Popular' }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-primary-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white sm:text-5xl">
                Find Perfect Event Services
              </h1>
              <p className="mt-4 text-xl text-primary-100">
                Browse and book from our curated collection of event professionals
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center w-full py-2 px-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {Object.keys(filters).length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    Clear all
                  </button>
                </div>
                
                <ServiceFilters
                  filters={localFilters}
                  filterOptions={filterOptions}
                  onChange={handleFilterChange}
                />
                
                <button
                  onClick={applyFilters}
                  className="w-full mt-6 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Apply Filters
                </button>
                
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden w-full mt-4 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <XMarkIcon className="h-5 w-5 inline mr-2" />
                  Close
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Toolbar */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center">
                    <span className="text-gray-700 mr-4">
                      {pagination.total} services found
                    </span>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                      >
                        <Squares2X2Icon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                      >
                        <ListBulletIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="text-gray-700">Sort by:</label>
                    <select
                      value={filters.sort || 'createdAt'}
                      onChange={(e) => dispatch(setFilters({ ...filters, sort: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <label className="text-gray-700">Show:</label>
                    <select
                      value={filters.limit || 12}
                      onChange={(e) => dispatch(setFilters({ ...filters, limit: e.target.value, page: 1 }))}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={48}>48</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Services Grid/List */}
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <AdjustmentsHorizontalIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No services found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters to find what you're looking for.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                    : 'space-y-6'
                  }>
                    {services.map((service) => (
                      <ServiceCard 
                        key={service._id} 
                        service={service} 
                        viewMode={viewMode} 
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Services;