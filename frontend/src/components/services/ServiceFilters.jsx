import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const ServiceFilters = ({ filters, filterOptions, onChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    category: true,
    location: true,
    features: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const categories = [
    'venue', 'caterer', 'photographer', 'videographer', 
    'dj', 'decorator', 'makeup', 'transport'
  ];

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const handleMultiSelect = (key, value) => {
    const currentValues = filters[key] ? filters[key].split(',') : [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onChange({ 
      ...filters, 
      [key]: newValues.length > 0 ? newValues.join(',') : undefined 
    });
  };

  const priceRange = filterOptions?.priceRange?.[0] || { minPrice: 0, maxPrice: 100000, avgPrice: 5000 };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Search services..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Price Range */}
      <div>
        <div 
          className="flex justify-between items-center cursor-pointer mb-2"
          onClick={() => toggleSection('price')}
        >
          <label className="block text-sm font-medium text-gray-700">
            Price Range
          </label>
          <ChevronDownIcon 
            className={`h-4 w-4 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}
          />
        </div>
        
        {expandedSections.price && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">₹{filters.minPrice || priceRange.minPrice}</span>
              <span className="text-gray-600">₹{filters.maxPrice || priceRange.maxPrice}</span>
            </div>
            <div className="flex space-x-4">
              <input
                type="range"
                min={priceRange.minPrice}
                max={priceRange.maxPrice}
                value={filters.minPrice || priceRange.minPrice}
                onChange={(e) => handleChange('minPrice', e.target.value)}
                className="w-full"
              />
              <input
                type="range"
                min={priceRange.minPrice}
                max={priceRange.maxPrice}
                value={filters.maxPrice || priceRange.maxPrice}
                onChange={(e) => handleChange('maxPrice', e.target.value)}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={priceRange.minPrice}
                max={priceRange.maxPrice}
                value={filters.minPrice || ''}
                onChange={(e) => handleChange('minPrice', e.target.value)}
                placeholder="Min"
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <input
                type="number"
                min={priceRange.minPrice}
                max={priceRange.maxPrice}
                value={filters.maxPrice || ''}
                onChange={(e) => handleChange('maxPrice', e.target.value)}
                placeholder="Max"
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Categories */}
      <div>
        <div 
          className="flex justify-between items-center cursor-pointer mb-2"
          onClick={() => toggleSection('category')}
        >
          <label className="block text-sm font-medium text-gray-700">
            Categories
          </label>
          <ChevronDownIcon 
            className={`h-4 w-4 transition-transform ${expandedSections.category ? 'rotate-180' : ''}`}
          />
        </div>
        
        {expandedSections.category && (
          <div className="space-y-2">
            {categories.map((category) => {
              const isSelected = filters.category?.includes(category);
              return (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleMultiSelect('category', category)}
                    className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {category}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Locations */}
      {filterOptions?.locations && expandedSections.location && (
        <div>
          <div 
            className="flex justify-between items-center cursor-pointer mb-2"
            onClick={() => toggleSection('location')}
          >
            <label className="block text-sm font-medium text-gray-700">
              Locations
            </label>
            <ChevronDownIcon 
              className={`h-4 w-4 transition-transform ${expandedSections.location ? 'rotate-180' : ''}`}
            />
          </div>
          
          {expandedSections.location && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.locations.map((loc) => (
                <label key={loc._id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.location === loc._id}
                    onChange={() => handleChange('location', loc._id)}
                    className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {loc._id} ({loc.count})
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Rating
        </label>
        <div className="flex items-center space-x-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleChange('minRating', rating)}
              className={`px-3 py-1 rounded-full text-sm ${
                filters.minRating === rating
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {rating}+ Stars
            </button>
          ))}
          {filters.minRating && (
            <button
              type="button"
              onClick={() => handleChange('minRating', '')}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Features */}
      <div>
        <div 
          className="flex justify-between items-center cursor-pointer mb-2"
          onClick={() => toggleSection('features')}
        >
          <label className="block text-sm font-medium text-gray-700">
            Features
          </label>
          <ChevronDownIcon 
            className={`h-4 w-4 transition-transform ${expandedSections.features ? 'rotate-180' : ''}`}
          />
        </div>
        
        {expandedSections.features && (
          <div className="space-y-2">
            {[
              'Parking', 'Air Conditioning', 'WiFi', 'Sound System',
              'Projector', 'Catering', 'Decoration', 'Photography'
            ].map((feature) => (
              <label key={feature} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {feature}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceFilters;