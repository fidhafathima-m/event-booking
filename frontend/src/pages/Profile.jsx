import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../store/slices/authSlice";
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
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      toast.error("New passwords do not match");
      return;
    }

    const updateData = {
      name: formData.name,
      phone: formData.phone,
    };

    if (formData.newPassword) {
      updateData.password = formData.newPassword;
    }

    dispatch(updateProfile(updateData))
      .unwrap()
      .then(() => {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        // Clear password fields
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      })
      .catch((error) => {
        toast.error(error.message || "Failed to update profile");
      });
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
      value: new Date(user.createdAt).toLocaleDateString(),
      icon: CalendarIcon,
    },
    {
      label: "Account Type",
      value: user.role === "admin" ? "Administrator" : "User",
      icon: UserIcon,
    },
    {
      label: "Email Verified",
      value: user.isEmailVerified ? "Verified" : "Not Verified",
      icon: EnvelopeIcon,
    },
  ];
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-2 text-gray-600">
              Manage your personal information and account settings
            </p>
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
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`flex items-center px-3 py-2 rounded-lg ${
                        isEditing
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-primary-50 text-primary-700 hover:bg-primary-100"
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </button>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      {/* Profile Picture */}
                      <div className="flex items-center">
                        <div className="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-12 w-12 text-primary-600" />
                        </div>
                        <div className="ml-6">
                          <h3 className="text-lg font-medium text-gray-900">
                            {user.name}
                          </h3>
                          <p className="text-gray-600">{user.email}</p>
                          {isEditing && (
                            <button
                              type="button"
                              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                            >
                              Change Photo
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center text-gray-900">
                            <UserIcon className="h-5 w-5 mr-2 text-gray-400" />
                            {user.name}
                          </div>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="flex items-center text-gray-900">
                          <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center text-gray-900">
                            <PhoneIcon className="h-5 w-5 mr-2 text-gray-400" />
                            {user.phone || "Not provided"}
                          </div>
                        )}
                      </div>

                      {/* Password Change (only when editing) */}
                      {isEditing && (
                        <div className="border-t pt-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Change Password
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                              </label>
                              <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Enter current password"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                              </label>
                              <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Enter new password"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                              </label>
                              <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Confirm new password"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Save Button */}
                      {isEditing && (
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                          >
                            <CheckIcon className="h-5 w-5 mr-2" />
                            {isLoading ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Actions */}
            <div className="lg:col-span-1">
              {/* Account Stats */}
              <div className="bg-white rounded-xl shadow mb-6">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Account Overview
                  </h3>
                  <div className="space-y-4">
                    {stats.map((stat, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center">
                          <stat.icon className="h-5 w-5 mr-3 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {stat.label}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            stat.label === "Email Verified" &&
                            stat.value === "Not Verified"
                              ? "text-yellow-600"
                              : "text-gray-900"
                          }`}
                        >
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
