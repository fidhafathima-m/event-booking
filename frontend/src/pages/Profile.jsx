import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, getProfile } from "../store/slices/authSlice";
import Layout from "../components/common/Layout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  KeyIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { checkPasswordStrength, validateName, validatePassword, validatePhone } from "../utils/validators";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: "text-gray-500",
  });

  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  

  const validateForm = () => {
    const newErrors = {};
    
    // Validate each field
    newErrors.name = validateName(formData.name);
    newErrors.phone = validatePhone(formData.phone);
    
    // Password validation
    if (formData.newPassword) {
      newErrors.currentPassword = validatePassword(formData.currentPassword, "currentPassword");
      newErrors.newPassword = validatePassword(formData.newPassword, "newPassword");
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "New passwords do not match";
      }
      
      // Additional check: new password must be different from current
      if (formData.newPassword === formData.currentPassword) {
        newErrors.newPassword = "New password must be different from current password";
      }
    }
    
    // Filter out empty error messages
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([, value]) => value !== "")
    );
    
    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    
    // Check password strength in real-time
    if (name === "newPassword") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  // Format phone number as user types
  const onPhoneChange = (e) => {
    let value = e.target.value;
    
    // Remove all non-digit characters except leading +
    const cleaned = value.replace(/[^\d+]/g, "");
    
    // If it starts with +, preserve it
    if (cleaned.startsWith("+")) {
      const match = cleaned.match(/^\+(\d{1,3})(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        const [, country, area, prefix, line] = match;
        value = `+${country}`;
        if (area) value += ` (${area}`;
        if (prefix) value += `) ${prefix}`;
        if (line) value += `-${line}`;
      }
    } else {
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        const [, area, prefix, line] = match;
        value = "";
        if (area) value = `(${area}`;
        if (prefix) value += `) ${prefix}`;
        if (line) value += `-${line}`;
      }
    }
    
    handleChange({ target: { name: "phone", value } });
  };

  // Format name with proper capitalization
  const onNameChange = (e) => {
    let value = e.target.value;
    
    if (e.target.selectionStart === value.length) {
      value = value
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    
    handleChange({ target: { name: "name", value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show first error
      const firstError = Object.values(errors)[0];
      toast.error(firstError || "Please fix the errors in the form");
      return;
    }

    // Prepare update data
    const updateData = {
      name: formData.name.trim().replace(/\s+/g, " "),
      phone: formData.phone.replace(/\D/g, ""), // Store only digits
    };

    // Add password only if provided
    if (formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.password = formData.newPassword;
    }

    try {
      await dispatch(updateProfile(updateData)).unwrap();
      
      // Refresh user data
      await dispatch(getProfile()).unwrap();
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      
      // Clear password fields and errors
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      setPasswordStrength({ score: 0, message: "", color: "text-gray-500" });
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setPasswordStrength({ score: 0, message: "", color: "text-gray-500" });
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      label: "Member Since",
      value: new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      icon: CalendarIcon,
    },
    {
      label: "Account Type",
      value: user.role === "admin" ? "Administrator" : "Standard User",
      icon: UserIcon,
    },
    {
      label: "Email Verified",
      value: user.isEmailVerified ? "Verified" : "Not Verified",
      icon: EnvelopeIcon,
      status: user.isEmailVerified ? "success" : "warning",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="mt-2 text-gray-600">
                  Manage your personal information and account security
                </p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Personal Information
                    </h2>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex items-center px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      {/* Profile Picture */}
                      <div className="flex items-center">
                        <div className="h-24 w-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                          {user.name ? (
                            <span className="text-3xl font-bold text-primary-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <UserIcon className="h-12 w-12 text-primary-600" />
                          )}
                        </div>
                        <div className="ml-6">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {user.name}
                          </h3>
                          <p className="text-gray-600">{user.email}</p>
                          {isEditing && (
                            <button
                              type="button"
                              className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                            >
                              <PencilIcon className="h-4 w-4 inline mr-1" />
                              Update Profile Picture
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Name Field */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Full Name
                          </label>
                          {errors.name && (
                            <span className="text-xs text-red-600 flex items-center">
                              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                              Invalid
                            </span>
                          )}
                        </div>
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={onNameChange}
                              required
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                                errors.name
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-300"
                              }`}
                              placeholder="Enter your full name"
                              maxLength="50"
                            />
                            {errors.name && (
                              <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                            )}
                            {!errors.name && (
                              <p className="mt-2 text-xs text-gray-500">
                                2-50 characters, letters and spaces only
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                            <UserIcon className="h-5 w-5 mr-3 text-gray-400" />
                            {user.name}
                          </div>
                        )}
                      </div>

                      {/* Email Field (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                          <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-400" />
                          {user.email}
                          {user.isEmailVerified && (
                            <span className="ml-auto inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <ShieldCheckIcon className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          Email address cannot be changed
                        </p>
                      </div>

                      {/* Phone Field */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Phone Number
                          </label>
                          {errors.phone && (
                            <span className="text-xs text-red-600 flex items-center">
                              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                              Invalid
                            </span>
                          )}
                        </div>
                        {isEditing ? (
                          <>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={onPhoneChange}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                                errors.phone
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-300"
                              }`}
                              placeholder="+1 (555) 123-4567"
                              maxLength="20"
                            />
                            {errors.phone ? (
                              <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                            ) : (
                              <p className="mt-2 text-xs text-gray-500">
                                Optional. Format: +1 (555) 123-4567
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                            <PhoneIcon className="h-5 w-5 mr-3 text-gray-400" />
                            {user.phone || "Not provided"}
                          </div>
                        )}
                      </div>

                      {/* Password Change Section */}
                      {isEditing && (
                        <div className="border-t pt-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <KeyIcon className="h-5 w-5 mr-2" />
                            Change Password
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              (Leave blank to keep current password)
                            </span>
                          </h3>
                          
                          <div className="space-y-5">
                            {/* Current Password */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Current Password
                                </label>
                                {errors.currentPassword && (
                                  <span className="text-xs text-red-600 flex items-center">
                                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                    Required
                                  </span>
                                )}
                              </div>
                              <div className="relative">
                                <input
                                  type={showCurrentPassword ? "text" : "password"}
                                  name="currentPassword"
                                  value={formData.currentPassword}
                                  onChange={handleChange}
                                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12 transition-colors ${
                                    errors.currentPassword
                                      ? "border-red-300 bg-red-50"
                                      : "border-gray-300"
                                  }`}
                                  placeholder="Enter current password"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                  {showCurrentPassword ? (
                                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                  ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                  )}
                                </button>
                              </div>
                              {errors.currentPassword && (
                                <p className="mt-2 text-sm text-red-600">{errors.currentPassword}</p>
                              )}
                            </div>

                            {/* New Password */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  New Password
                                </label>
                                {errors.newPassword && (
                                  <span className="text-xs text-red-600 flex items-center">
                                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                    Invalid
                                  </span>
                                )}
                              </div>
                              <div className="relative">
                                <input
                                  type={showNewPassword ? "text" : "password"}
                                  name="newPassword"
                                  value={formData.newPassword}
                                  onChange={handleChange}
                                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12 transition-colors ${
                                    errors.newPassword
                                      ? "border-red-300 bg-red-50"
                                      : "border-gray-300"
                                  }`}
                                  placeholder="Enter new password"
                                  maxLength="128"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? (
                                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                  ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                  )}
                                </button>
                              </div>
                              {errors.newPassword ? (
                                <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
                              ) : (
                                <>
                                  {formData.newPassword && (
                                    <div className="mt-3">
                                      <p className={`text-sm font-medium ${passwordStrength.color} mb-2`}>
                                        {passwordStrength.message}
                                      </p>
                                      <div className="grid grid-cols-2 gap-2">
                                        {[
                                          "At least 8 characters",
                                          "1 lowercase letter",
                                          "1 uppercase letter",
                                          "1 number",
                                          "1 special character",
                                          "No sequential chars",
                                          "No repeating chars",
                                          "Not too common",
                                        ].map((req, idx) => (
                                          <div key={idx} className="flex items-center text-xs">
                                            <div className={`h-2 w-2 rounded-full mr-2 ${
                                              checkPasswordStrength(formData.newPassword).score > idx
                                                ? "bg-green-500"
                                                : "bg-gray-300"
                                            }`} />
                                            {req}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Confirm New Password
                                </label>
                                {errors.confirmPassword && (
                                  <span className="text-xs text-red-600 flex items-center">
                                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                    Don't match
                                  </span>
                                )}
                              </div>
                              <div className="relative">
                                <input
                                  type={showConfirmPassword ? "text" : "password"}
                                  name="confirmPassword"
                                  value={formData.confirmPassword}
                                  onChange={handleChange}
                                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12 transition-colors ${
                                    errors.confirmPassword
                                      ? "border-red-300 bg-red-50"
                                      : "border-gray-300"
                                  }`}
                                  placeholder="Confirm new password"
                                  maxLength="128"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? (
                                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                  ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                  )}
                                </button>
                              </div>
                              {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Save Button */}
                      {isEditing && (
                        <div className="flex justify-end space-x-3 pt-6 border-t">
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                          >
                            <CheckIcon className="h-5 w-5 mr-2" />
                            {isLoading ? "Saving Changes..." : "Save Changes"}
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Account Stats */}
              <div className="bg-white rounded-xl shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Account Overview
                  </h3>
                  <div className="space-y-4">
                    {stats.map((stat, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-3 border-b last:border-b-0"
                      >
                        <div className="flex items-center">
                          <stat.icon className={`h-5 w-5 mr-3 ${
                            stat.status === "success" 
                              ? "text-green-500" 
                              : stat.status === "warning"
                              ? "text-yellow-500"
                              : "text-gray-400"
                          }`} />
                          <span className="text-sm text-gray-600">
                            {stat.label}
                          </span>
                        </div>
                        <span className={`text-sm font-medium ${
                          stat.status === "success" 
                            ? "text-green-600" 
                            : stat.status === "warning"
                            ? "text-yellow-600"
                            : "text-gray-900"
                        }`}>
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Security Actions */}
              <div className="bg-white rounded-xl shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 mr-2" />
                    Security
                  </h3>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="w-full flex items-center justify-between px-4 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors group"
                    >
                      <span className="flex items-center">
                        <KeyIcon className="h-5 w-5 mr-2" />
                        Change Password
                      </span>
                      <PencilIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button
                      type="button"
                      className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg transition-colors ${
                        user.isEmailVerified
                          ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                          : "border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                      }`}
                    >
                      <span className="flex items-center">
                        <EnvelopeIcon className="h-5 w-5 mr-2" />
                        {user.isEmailVerified ? "Email Verified" : "Verify Email"}
                      </span>
                      {user.isEmailVerified ? (
                        <ShieldCheckIcon className="h-5 w-5" />
                      ) : (
                        <ExclamationTriangleIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  Security Tips
                </h4>
                <ul className="space-y-2">
                  <li className="text-xs text-blue-800 flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1 mr-2"></div>
                    Use a unique password for each account
                  </li>
                  <li className="text-xs text-blue-800 flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1 mr-2"></div>
                    Update your password every 90 days
                  </li>
                  <li className="text-xs text-blue-800 flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1 mr-2"></div>
                    Never share your password with anyone
                  </li>
                  <li className="text-xs text-blue-800 flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1 mr-2"></div>
                    Enable two-factor authentication if available
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;