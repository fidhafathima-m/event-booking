import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllServices, 
  toggleServiceStatus,
  createService,
  updateService,
  deleteService
} from '../../store/slices/adminSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { 
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  PhotoIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { toast } from 'react-hot-toast';
import { SERVICE_CATEGORIES } from '../../utils/constants';

const AdminServices = () => {
  const dispatch = useDispatch();
  const { services, pagination, isLoading } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isActive: '',
    page: 1,
    limit: 10
  });

  // Add Service Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'venue',
    pricePerDay: '',
    location: '',
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    },
    features: [''],
    capacity: '',
    tags: [''],
    images: [''],
    provider: user?._id
  });

  useEffect(() => {
    dispatch(fetchAllServices(filters));
  }, [dispatch, filters]);

  const handleToggleStatus = async (serviceId) => {
    if (window.confirm('Are you sure you want to change the service status?')) {
      try {
        await dispatch(toggleServiceStatus(serviceId)).unwrap();
        toast.success('Service status updated');
        // Refresh services list
        dispatch(fetchAllServices(filters));
      } catch (error) {
        toast.error('Failed to update service status', error);
      }
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      try {
        await dispatch(deleteService(serviceId)).unwrap();
        toast.success('Service deleted successfully');
        // Refresh services list
        dispatch(fetchAllServices(filters));
      } catch (error) {
        toast.error('Failed to delete service', error);
      }
    }
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Add Service Modal Handlers
  const openAddModal = () => {
    setFormData({
      title: '',
      description: '',
      category: 'venue',
      pricePerDay: '',
      location: '',
      contactInfo: {
        email: user?.email || '',
        phone: user?.phone || '',
        address: ''
      },
      features: [''],
      capacity: '',
      tags: [''],
      images: ['']
    });
    setShowAddModal(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      pricePerDay: service.pricePerDay,
      location: service.location,
      contactInfo: service.contactInfo,
      features: service.features?.length > 0 ? service.features : [''],
      capacity: service.capacity || '',
      tags: service.tags?.length > 0 ? service.tags : [''],
      images: service.images?.length > 0 ? service.images : ['']
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingService(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
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

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || !formData.pricePerDay || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Filter out empty array items
      const submitData = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== ''),
        tags: formData.tags.filter(t => t.trim() !== ''),
        images: formData.images.filter(i => i.trim() !== ''),
        pricePerDay: parseFloat(formData.pricePerDay),
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        provider: 'admin'
      };

      if (showEditModal && editingService) {
        // Update existing service
        await dispatch(updateService({ 
          serviceId: editingService._id, 
          serviceData: submitData 
        })).unwrap();
        toast.success('Service updated successfully');
        closeModals();
        // Refresh services list
        dispatch(fetchAllServices(filters));
      } else {
        // Create new service
        await dispatch(createService(submitData)).unwrap();
        toast.success('Service created successfully');
        closeModals();
        // Refresh services list
        dispatch(fetchAllServices(filters));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save service');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
            <p className="mt-2 text-gray-600">
              Manage all services listed on the platform
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Service
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Services
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, description, or location..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {SERVICE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.isActive}
                onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value, page: 1 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Table */}
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
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
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
                    {services.map((service) => (
                      <tr key={service._id} className="hover:bg-gray-50">
                        {/* Service Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BuildingStorefrontIcon className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {service.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  {service.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Details */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <CurrencyRupeeIcon className="h-4 w-4 mr-2 text-gray-400" />
                              ₹{service.pricePerDay}/day
                            </div>
                            <div className="flex items-center mt-1">
                              <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="truncate max-w-xs">{service.location}</span>
                            </div>
                          </div>
                        </td>

                        {/* Stats */}
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center">
                              <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="font-medium">{service.rating || '0.0'}</span>
                            </div>
                            <div className="text-gray-500 mt-1">
                              {service.totalBookings || 0} bookings
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(service._id)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              service.isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {service.isActive ? (
                              <>
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/services/${service._id}`}
                              className="text-primary-600 hover:text-primary-900 p-1"
                              target="_blank"
                              title="View"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            <button 
                              onClick={() => openEditModal(service)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteService(service._id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {services.length === 0 && (
                <div className="text-center py-12">
                  <BuildingStorefrontIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No services found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search filters or add your first service
                  </p>
                  <button
                    onClick={openAddModal}
                    className="mt-4 flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition mx-auto"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Service
                  </button>
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

      {/* Add/Edit Service Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {showEditModal ? 'Edit Service' : 'Add New Service'}
                </h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., Grand Wedding Hall"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        {SERVICE_CATEGORIES.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per Day (₹) *
                      </label>
                      <input
                        type="number"
                        name="pricePerDay"
                        value={formData.pricePerDay}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="5000"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., New York, NY"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g., 500"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Describe your service in detail..."
                      required
                    />
                  </div>

                  {/* Contact Information */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <EnvelopeIcon className="h-4 w-4 inline mr-2" />
                          Email *
                        </label>
                        <input
                          type="email"
                          name="contactInfo.email"
                          value={formData.contactInfo.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="contact@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <PhoneIcon className="h-4 w-4 inline mr-2" />
                          Phone *
                        </label>
                        <input
                          type="tel"
                          name="contactInfo.phone"
                          value={formData.contactInfo.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="+1 234 567 8900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <HomeIcon className="h-4 w-4 inline mr-2" />
                          Address *
                        </label>
                        <input
                          type="text"
                          name="contactInfo.address"
                          value={formData.contactInfo.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="123 Street, City, Country"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Features</h3>
                      <button
                        type="button"
                        onClick={() => addArrayItem('features')}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        + Add Feature
                      </button>
                    </div>
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleArrayChange('features', index, e.target.value)}
                          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Air Conditioning, Parking, etc."
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('features', index)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                      <button
                        type="button"
                        onClick={() => addArrayItem('tags')}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        + Add Tag
                      </button>
                    </div>
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., luxury, budget, indoor, outdoor"
                        />
                        {formData.tags.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('tags', index)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Image URLs */}
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        <PhotoIcon className="h-5 w-5 inline mr-2" />
                        Image URLs
                      </h3>
                      <button
                        type="button"
                        onClick={() => addArrayItem('images')}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        + Add Image URL
                      </button>
                    </div>
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => handleArrayChange('images', index, e.target.value)}
                          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="https://example.com/image.jpg"
                        />
                        {formData.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('images', index)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Form Actions */}
                  <div className="border-t pt-6 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      {showEditModal ? 'Update Service' : 'Create Service'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminServices;