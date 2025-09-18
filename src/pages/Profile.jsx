import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaUserTag,
  FaCheckCircle,
  FaTimesCircle,
  FaSignOutAlt,
  FaEdit,
  FaArrowLeft,
  FaWallet,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";

const Profile = () => {
  const { user, setUser, loading, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    is_active: false,
    vehicle_no: "",
    vehicle_model: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        is_active: user.is_active || false,
        vehicle_no: user.vehicle_no || "",
        vehicle_model: user.vehicle_model || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/profile", formData);
      if (res.data.success) {
        // 🔹 Update context user state
        setUser((prev) => ({
          ...prev,
          name: res.data.user.name,
          phone: res.data.user.phone,
          is_active: res.data.user.is_active,
          vehicle_no: res.data.user.vehicle_no,
          vehicle_model: res.data.user.vehicle_model,
        }));

        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Error: " + res.data.message);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Something went wrong while updating profile!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaUser className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your profile
          </p>
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="bg-white/20 p-4 rounded-full mb-4 sm:mb-0 sm:mr-6">
                <FaUser className="text-3xl" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {user.name || "User"}
                </h1>
                <p className="text-blue-100">{user.email}</p>
                <div className="flex items-center justify-center sm:justify-start mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.is_active ? (
                      <span className="flex items-center">
                        <FaCheckCircle className="mr-1" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FaTimesCircle className="mr-1" /> Inactive
                      </span>
                    )}
                  </span>
                  <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <FaUserTag className="mr-1 inline" />
                    {user.role
                      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      : "User"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isEditing ? (
              <form
                onSubmit={handleSave}
                className="space-y-6 bg-gray-50 p-6 rounded-lg shadow-inner"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                        placeholder="Your email"
                        disabled
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>

                  {user.role === "driver" && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Status
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            is_active: !prev.is_active,
                          }))
                        }
                        className={`px-6 py-3 rounded-lg font-medium flex items-center ${
                          formData.is_active
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        {formData.is_active ? (
                          <>
                            <FaCheckCircle className="mr-2" /> Active
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="mr-2" /> Inactive
                          </>
                        )}
                      </button>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="vehicle_no"
                            value={formData.vehicle_no}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Enter vehicle number"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle Model
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="vehicle_model"
                            value={formData.vehicle_model}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Enter vehicle model"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center space-x-4 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                  >
                    <FaCheckCircle className="mr-2" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Display Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-5">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <FaUser className="text-blue-600 mr-2" />
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-medium">
                          {user.name || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="font-medium">
                          {user.email || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="font-medium">
                          {user.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-5">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <FaWallet className="text-green-600 mr-2" />
                      Account Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">User Role</p>
                        <p className="font-medium">
                          {user.role
                            ? user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)
                            : "User"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Account Status</p>
                        <p className="font-medium">
                          {user.is_active ? (
                            <span className="text-green-600 flex items-center">
                              <FaCheckCircle className="mr-1" /> Active
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center">
                              <FaTimesCircle className="mr-1" /> Inactive
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="font-medium">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      </div>

                      {/* 🔹 Vehicle Info Only for Driver */}
                      {user.role === "driver" && (
                        <>
                          <div>
                            <p className="text-sm text-gray-600">
                              Vehicle Number
                            </p>
                            <p className="font-medium">
                              {user.vehicle_no || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Vehicle Model
                            </p>
                            <p className="font-medium">
                              {user.vehicle_model || "Not provided"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {user.address && (
                  <div className="bg-purple-50 rounded-lg p-5 mb-8">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <FaMapMarkerAlt className="text-purple-600 mr-2" />
                      Address
                    </h3>
                    <p className="text-gray-700">{user.address}</p>
                  </div>
                )}

                <div className="flex space-x-4 border-t border-gray-200 pt-6">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                  >
                    <FaEdit className="mr-2" />
                    Edit Profile
                  </button>
                  <button
                    onClick={logout}
                    className="border border-red-300 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
