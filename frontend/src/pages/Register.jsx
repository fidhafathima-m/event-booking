import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerStep1 } from '../store/slices/authSlice';
import Layout from '../components/common/Layout';
import { toast } from 'react-hot-toast';
import { checkPasswordStrength, validateEmail, validateName, validatePassword, validatePhone } from '../utils/validators';

const RegisterStep1 = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    color: 'text-gray-500',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    // Validate each field
    newErrors.name = validateName(name);
    newErrors.email = validateEmail(email);
    newErrors.password = validatePassword(password);
    newErrors.phone = validatePhone(phone);
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Filter out empty error messages
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([, value]) => value !== '')
    );
    
    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Check password strength in real-time
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  // Format phone number as user types
  const onPhoneChange = (e) => {
    let value = e.target.value;
    
    // Remove all non-digit characters except leading +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // If it starts with +, preserve it
    if (cleaned.startsWith('+')) {
      // Format: +X (XXX) XXX-XXXX
      const match = cleaned.match(/^\+(\d{1,3})(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        const [, country, area, prefix, line] = match;
        value = `+${country}`;
        if (area) value += ` (${area}`;
        if (prefix) value += `) ${prefix}`;
        if (line) value += `-${line}`;
      }
    } else {
      // Format: (XXX) XXX-XXXX
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        const [, area, prefix, line] = match;
        value = '';
        if (area) value = `(${area}`;
        if (prefix) value += `) ${prefix}`;
        if (line) value += `-${line}`;
      }
    }
    
    onChange({ target: { name: 'phone', value } });
  };

  // Format name with proper capitalization
  const onNameChange = (e) => {
    let value = e.target.value;
    
    // Only format if not typing in the middle
    if (e.target.selectionStart === value.length) {
      // Capitalize first letter of each word
      value = value
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    onChange({ target: { name: 'name', value } });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    const userData = {
      name: name.trim().replace(/\s+/g, ' '),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.replace(/\D/g, ''), // Store only digits
    };

    try {
      const result = await dispatch(registerStep1(userData)).unwrap();
      toast.success('OTP sent to your email!');
      navigate('/verify-email', { 
        state: { 
          email: result.data.email
        } 
      });
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const { name, email, password, confirmPassword, phone } = formData;

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                sign in to existing account
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={onNameChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="John Doe"
                  maxLength="50"
                />
                {errors.name ? (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    2-50 characters, letters and spaces only
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={onChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="you@example.com"
                  maxLength="254"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={onPhoneChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="+1 (555) 123-4567"
                  maxLength="20"
                />
                {errors.phone ? (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Optional. Format: +1 (555) 123-4567
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={onChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="••••••••"
                  maxLength="128"
                />
                {errors.password ? (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                ) : (
                  <>
                    {password && (
                      <p className={`mt-1 text-sm ${passwordStrength.color}`}>
                        {passwordStrength.message}
                      </p>
                    )}
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Password Requirements:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li className={`flex items-center ${password.length >= 8 ? 'text-green-600' : ''}`}>
                          <span className="mr-1">{password.length >= 8 ? '✓' : '○'}</span>
                          At least 8 characters
                        </li>
                        <li className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
                          <span className="mr-1">{/[a-z]/.test(password) ? '✓' : '○'}</span>
                          1 lowercase letter
                        </li>
                        <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
                          <span className="mr-1">{/[A-Z]/.test(password) ? '✓' : '○'}</span>
                          1 uppercase letter
                        </li>
                        <li className={`flex items-center {/[0-9]/.test(password) ? 'text-green-600' : ''}`}>
                          <span className="mr-1">{/[0-9]/.test(password) ? '✓' : '○'}</span>
                          1 number
                        </li>
                        <li className={`flex items-center ${/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? 'text-green-600' : ''}`}>
                          <span className="mr-1">{/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? '✓' : '○'}</span>
                          1 special character
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={onChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                  placeholder="••••••••"
                  maxLength="128"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending OTP...' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterStep1;