import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { FaUser, FaPhone, FaCar, FaIdCard, FaStar, FaArrowLeft, FaMapMarkerAlt, FaShieldAlt, FaClock } from "react-icons/fa";

const DriverDetails = () => {
  const { ride_id } = useParams();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rideDetails, setRideDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch driver details
        const driverRes = await api.get(`/ride/driver/${ride_id}`);
        if (driverRes.data.success) {
          setDriver(driverRes.data.driver);
          
        } else {
          setError(driverRes.data.message || "Failed to load driver details");
        }
        
        // Fetch ride details for additional context
        try {
          const rideRes = await api.get(`/ride/details/${ride_id}`);
          if (rideRes.data.success) {
            setRideDetails(rideRes.data.ride);
          }
        } catch (rideErr) {
          console.log("Ride details not available");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ride_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">Loading driver details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-sm max-w-md w-full text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Details</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            to="/my-rides" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to My Rides
          </Link>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-sm max-w-md w-full text-center">
          <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-yellow-600 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Driver Not Found</h2>
          <p className="text-gray-600 mb-4">The driver details are not available for this ride.</p>
          <Link 
            to="/my-rides" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to My Rides
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          to="/my-rides" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to My Rides
        </Link>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="bg-white/20 p-5 rounded-full mb-4 sm:mb-0 sm:mr-6">
                <FaUser className="text-3xl" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl md:text-3xl font-bold">{driver.name}</h1>
                <p className="text-blue-100 mt-1">Your Driver</p>
                <div className="flex items-center justify-center sm:justify-start mt-3">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar 
                        key={star} 
                        className={`text-sm ${
                          star <= Math.floor(driver.rating || 4.5) 
                            ? "text-yellow-400" 
                            : "text-gray-300"
                        }`} 
                      />
                    ))}
                    <span className="ml-2 text-blue-100">({driver.rating || 4.5})</span>
                  </div>
                  <span className="mx-3 text-blue-200">•</span>
                  <span className="text-blue-100">{driver.completed_rides || 0} rides</span>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Details */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <FaIdCard className="text-blue-600 mr-2" />
              Driver Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FaUser className="text-blue-600 mr-2" />
                  Personal Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium text-gray-800">{driver.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium text-gray-800 flex items-center">
                      <FaPhone className="text-gray-400 mr-2 text-sm" />
                      {driver.phone}
                    </p>
                  </div>
                  {driver.email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-800">{driver.email}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FaCar className="text-green-600 mr-2" />
                  Vehicle Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Model</p>
                    <p className="font-medium text-gray-800">{driver.vehicle_model || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Number</p>
                    <p className="font-medium text-gray-800">{driver.vehicle_no || "Not specified"}</p>
                  </div>
                  {driver.vehicle_color && (
                    <div>
                      <p className="text-sm text-gray-600">Vehicle Color</p>
                      <p className="font-medium text-gray-800">{driver.vehicle_color}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ride Information (if available) */}
            {rideDetails && (
              <div className="bg-purple-50 rounded-lg p-5 mb-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FaMapMarkerAlt className="text-purple-600 mr-2" />
                  Ride Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="w-0.5 h-8 bg-gray-300 ml-1"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pickup Location</p>
                      <p className="font-medium text-gray-800">{rideDetails.pickup}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Destination</p>
                      <p className="font-medium text-gray-800">{rideDetails.dropoff}</p>
                    </div>
                  </div>

                  {rideDetails.status && (
                    <div className="flex items-center pt-3 border-t border-purple-100">
                      <FaClock className="text-purple-400 mr-2" />
                      <span className="text-sm text-gray-600">Status: </span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        rideDetails.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : rideDetails.status === 'cancelled' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rideDetails.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Safety Information */}
            <div className="bg-yellow-50 rounded-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <FaShieldAlt className="text-yellow-600 mr-2" />
                Safety First
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Verify the driver's name and vehicle details before boarding</li>
                <li>• Share your ride details with friends or family</li>
                <li>• Always wear your seatbelt</li>
                <li>• Contact support if you feel unsafe during your ride</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDetails;