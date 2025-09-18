import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, Navigate } from "react-router-dom";
import {
  FaCar,
  FaHistory,
  FaUser,
  FaMapMarkerAlt,
  FaWallet,
  FaQuestionCircle,
} from "react-icons/fa";
import api from "../api/axios";

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to='/' replace/>
  }
  
  const [recentRides, setRecentRides] = useState([]);
  const [stats, setStats] = useState({
    totalRides: 0,
    completedRides: 0,
    totalSpent: 0,
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/ride/dashboard");
        if (res.data.success) {
          setRecentRides(res.data.recentRides || []);
          setStats(
            res.data.stats || {
              totalRides: 0,
              completedRides: 0,
              totalSpent: 0,
            }
          );
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err.message);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {user?.name || user?.email}!
              </h1>
              <p className="text-blue-100 mt-1">Ready for your next ride?</p>
            </div>
           
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/ride-book"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow flex items-center"
          >
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <FaCar className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Book a Ride</h3>
              <p className="text-sm text-gray-600">Get where you need to go</p>
            </div>
          </Link>

          <Link
            to="/my-rides"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow flex items-center"
          >
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FaHistory className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Ride History</h3>
              <p className="text-sm text-gray-600">View your past trips</p>
            </div>
          </Link>

          <Link
            to="/profile"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow flex items-center"
          >
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <FaUser className="text-purple-600 text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Profile</h3>
              <p className="text-sm text-gray-600">Manage your account</p>
            </div>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaCar className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Rides</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.totalRides}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaHistory className="text-green-600" />
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
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FaWallet className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  ₹{stats.totalSpent}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Rides */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Rides</h2>
              <Link to="/my-rides" className="text-blue-500 text-sm">
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {recentRides.length > 0 ? (
                recentRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div className="flex items-center space-x-2">
                      <FaMapMarkerAlt className="text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{ride.pickup}</p>
                        <p className="text-xs text-gray-500">{ride.dropoff}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">₹{ride.fare}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          ride.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : ride.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {ride.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent rides</p>
              )}
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Need Help?
            </h2>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <FaQuestionCircle className="text-blue-600 text-xl mt-1 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-800">24/7 Support</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Our team is here to help you with any issues
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-800">
                  How to book a ride
                </span>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-800">
                  Payment issues
                </span>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-800">
                  Safety guidelines
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
