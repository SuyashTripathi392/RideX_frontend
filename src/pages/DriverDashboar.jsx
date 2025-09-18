import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import {
  FaCar,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaPlay,
  FaCheck,
  FaClock,
  FaMoneyBillWave,
  FaStar,
} from "react-icons/fa";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const [availableRides, setAvailableRides] = useState([]);
  const [currentRide, setCurrentRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    completedRides: 0,
    rating: 4.8,
  });

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchAvailableRides, 30000);
    return () => clearInterval(interval);
  }, []);

  // Add this function inside your component
  const cancelRide = async () => {
    try {
      const rideId = currentRide.id || currentRide.ride_id;
      const res = await api.post(`/ride/cancel/${rideId}`);
      if (res.data.success) {
        toast.success("Ride canceled successfully! ❌");
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel ride");
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAvailableRides(),
        fetchCurrentRide(),
        fetchDriverStats(),
      ]);
    } catch (err) {
      console.error("Dashboard data fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRides = async () => {
    try {
      const res = await api.get("/ride/available");
      if (res.data.success) setAvailableRides(res.data.rides || []);
    } catch (err) {
      console.error("Available rides error:", err.message);
    }
  };

  const fetchCurrentRide = async () => {
    try {
      const res = await api.get("/ride/current");
      if (res.data.success) setCurrentRide(res.data.ride || null);
    } catch (err) {
      console.error("Current ride error:", err.message);
    }
  };

  const fetchDriverStats = async () => {
    try {
      const res = await api.get("/ride/stats");
      if (res.data.success) {
        setStats({
          todayEarnings: res.data.today_earnings || 0,
          completedRides: res.data.completed_rides || 0,
          rating: res.data.rating || 4.8,
        });
      }
    } catch (err) {
      console.error("Stats fetch error:", err.message);
    }
  };

  const acceptRide = async (ride) => {
    try {
      const rideId = ride.id || ride.ride_id;
      const res = await api.post(`/ride/accept/${rideId}`);
      if (res.data.success) {
        toast.success("Ride accepted successfully! 🚗");
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept ride");
    }
  };

  const startRide = async () => {
    try {
      const rideId = currentRide.id || currentRide.ride_id;
      const res = await api.post(`/ride/start/${rideId}`);
      if (res.data.success) {
        toast.success("Ride started! 🚀");
        fetchCurrentRide();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start ride");
    }
  };

  const completeRide = async () => {
    try {
      const rideId = currentRide.id || currentRide.ride_id;
      const res = await api.post(`/ride/complete/${rideId}`);
      if (res.data.success) {
        toast.success("Ride completed successfully! 🎉");
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete ride");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Welcome, {user.name || "Driver"}!
          </h1>
          <p className="text-gray-600 text-lg">
            Here's your ride summary and earnings for today
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaMoneyBillWave className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Earnings</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  ₹{stats.todayEarnings}
                </h3>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate("/driver/completed-rides")}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaCheck className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed Rides</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.completedRides}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <FaStar className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.rating}/5
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Ride Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <FaCar className="text-blue-600 mr-2" />
              Current Ride
            </h2>

            {currentRide ? (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {currentRide.status.replace("_", " ").toUpperCase()}
                    </span>
                    <span className="text-lg font-bold text-blue-800">
                      ₹{currentRide.fare || "TBD"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="w-0.5 h-8 bg-gray-300 ml-1"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">From</p>
                        <p className="font-medium text-gray-800">
                          {currentRide.pickup}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">To</p>
                        <p className="font-medium text-gray-800">
                          {currentRide.dropoff}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(currentRide.rider_name || currentRide.rider_phone) && (
                    <div className="mt-4 pt-4 border-t border-blue-100">
                      <p className="text-sm text-gray-600 mb-2">
                        Rider Information
                      </p>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <FaUser className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {currentRide.rider_name || "Customer"}
                          </p>
                          {currentRide.rider_phone && (
                            <p className="text-sm text-gray-600 flex items-center">
                              <FaPhone className="mr-1 text-xs" />
                              {currentRide.rider_phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col gap-3">
                    {currentRide.status === "accepted" && (
                      <button
                        onClick={startRide}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <FaPlay className="mr-2" />
                        Start Ride
                      </button>
                    )}

                    {currentRide.status === "in_progress" && (
                      <button
                        onClick={completeRide}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <FaCheck className="mr-2" />
                        Complete Ride
                      </button>
                    )}

                    {/* Cancel button available if ride is accepted or in progress */}
                    {(currentRide.status === "accepted" ||
                      currentRide.status === "in_progress") &&
                      !currentRide.user_canceled && (
                        <button
                          onClick={cancelRide}
                          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
                        >
                          <FaCheck className="mr-2" />
                          Cancel Ride
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
                  <FaClock className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-600 mb-2">No active ride</p>
                <p className="text-sm text-gray-500">
                  You'll see ride details here when you accept a request
                </p>
              </div>
            )}
          </div>

          {/* Available Rides Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaMapMarkerAlt className="text-green-600 mr-2" />
                Available Rides
              </h2>
              <button
                onClick={fetchAvailableRides}
                className="text-blue-600 text-sm hover:underline flex items-center"
              >
                Refresh
              </button>
            </div>

            {/* New logic for inactive/active/no rides */}
            {!user.is_active ? (
              <div className="text-center py-8">
                <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
                  <FaClock className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-600 font-medium">You are inactive</p>
                <p className="text-sm text-gray-500 mt-1">
                  No rides available for you
                </p>
              </div>
            ) : availableRides.length > 0 ? (
              <div className="space-y-4">
                {availableRides.map((ride) => (
                  <div
                    key={ride.id || ride.ride_id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        Ride #{ride.id ? ride.id.slice(-6) : "N/A"}
                      </span>
                      <span className="text-lg font-bold text-green-800">
                        ₹{ride.fare || "TBD"}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-gray-600">From:</span>
                        <span className="font-medium ml-1">{ride.pickup}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-gray-600">To:</span>
                        <span className="font-medium ml-1">{ride.dropoff}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => acceptRide(ride)}
                      className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <FaCheck className="mr-2" />
                      Accept Ride
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
                  <FaMapMarkerAlt className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-600">No rides available</p>
                <p className="text-sm text-gray-500 mt-1">
                  New ride requests will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
