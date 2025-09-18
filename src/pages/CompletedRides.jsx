import { useEffect, useState } from "react";
import { FaArrowLeft, FaCheck, FaMoneyBillWave, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUser, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function CompletedRides() {
    
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalRides: 0,
    averageRating: 0
  });

  const fetchCompletedRides = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ride/completed");
      if (res.data.success) {
        setRides(res.data.rides || []);
        
        // Calculate stats
        const totalEarnings = res.data.rides.reduce((sum, ride) => sum + (ride.fare || 0), 0);
        const totalRides = res.data.rides.length;
        const averageRating = res.data.rides.reduce((sum, ride) => sum + (ride.rating || 0), 0) / totalRides || 0;
        
        setStats({
          totalEarnings,
          totalRides,
          averageRating: averageRating.toFixed(1)
        });
      }
    } catch (err) {
      console.error("Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedRides();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">Loading your completed rides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Completed Rides</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaMoneyBillWave className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <h3 className="text-xl font-bold text-gray-800">₹{stats.totalEarnings}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaCheck className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed Rides</p>
                <h3 className="text-xl font-bold text-gray-800">{stats.totalRides}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <FaStar className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <h3 className="text-xl font-bold text-gray-800">4.8/5</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Rides List */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <FaCheck className="text-green-600 mr-2" />
            Ride History
          </h2>

          {rides.length > 0 ? (
            <div className="space-y-4">
              {rides.map((ride) => (
                <div key={ride.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium mb-2 inline-block">
                        Ride #{ride.id.slice(-6)}
                      </span>
                      <div className="text-lg font-bold text-green-800">₹{ride.fare}</div>
                    </div>
                    {ride.rating && (
                      <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                        <FaStar className="text-yellow-500 text-sm mr-1" />
                        <span className="text-sm font-medium text-yellow-800">{ride.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="w-0.5 h-8 bg-gray-300 ml-1"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">From</p>
                        <p className="font-medium text-gray-800">{ride.pickup}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">To</p>
                        <p className="font-medium text-gray-800">{ride.dropoff}</p>
                      </div>
                    </div>
                  </div>

                  {ride.rider_name && (
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <FaUser className="text-blue-600 text-sm" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rider</p>
                        <p className="font-medium text-gray-800">{ride.rider_name}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="mr-2 text-gray-400" />
                      {formatDate(ride.updated_at)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="mr-2 text-gray-400" />
                      {formatTime(ride.updated_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No completed rides yet</h3>
              <p className="text-gray-600 mb-6">Your completed rides will appear here</p>
              <Link 
                to="/driver/dashboard" 
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          )}
        </div>

        {/* Summary */}
        {rides.length > 0 && (
          <div className="mt-6 bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-blue-700 text-center">
              Showing {rides.length} completed ride{rides.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}