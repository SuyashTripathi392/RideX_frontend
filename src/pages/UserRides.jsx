import React, { useEffect, useState } from "react";
import api from "../api/axios"; 
import { useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, FaMotorcycle, FaCheckCircle, FaClock, 
  FaMoneyBillWave 
} from "react-icons/fa";
import { toast } from "react-toastify";

export default function UserRides() {
  const [rides, setRides] = useState({ ongoing: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ongoing");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const res = await api.get("/ride/my-rides");
        if (res.data.success) {
          setRides(res.data);
        }
      } catch (err) {
        console.error("Error fetching rides", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  // 🔹 Ride Cancel Handler
  const handleCancelRide = async (rideId) => {
    if (!window.confirm("Are you sure you want to cancel this ride?")) return;

    try {
      const res = await api.post("/payment/cancel", { ride_id: rideId });
      if (res.data.success) {
        toast.success("Ride cancelled successfully. Refund initiated!");
        // UI update
        setRides((prev) => ({
          ...prev,
          ongoing: prev.ongoing.filter((ride) => ride.id !== rideId),
        }));
      }
    } catch (err) {
      console.error("Cancel ride error:", err);
      toast.error("Failed to cancel the ride. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">
            Loading your rides...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200 border border-gray-200 mr-4"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            My Rides
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-1 mb-6 flex border border-gray-200">
          <button
            className={`flex items-center justify-center px-4 py-2 rounded-lg flex-1 transition-all duration-200 ${
              activeTab === "ongoing"
                ? "bg-blue-100 text-blue-700 font-medium"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("ongoing")}
          >
            <FaClock className="mr-2" />
            Ongoing
            {rides.ongoing.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {rides.ongoing.length}
              </span>
            )}
          </button>
          <button
            className={`flex items-center justify-center px-4 py-2 rounded-lg flex-1 transition-all duration-200 ${
              activeTab === "completed"
                ? "bg-green-100 text-green-700 font-medium"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            <FaCheckCircle className="mr-2" />
            Completed
            {rides.completed.length > 0 && (
              <span className="ml-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {rides.completed.length}
              </span>
            )}
          </button>
        </div>

        {/* Ongoing Rides */}
        {activeTab === "ongoing" && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
              <FaClock className="mr-2 text-blue-500" />
              Ongoing Rides
            </h2>
            {rides.ongoing.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaMotorcycle className="text-blue-500 text-2xl" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No ongoing rides
                </h3>
                <p className="text-gray-500">
                  Your active rides will appear here
                </p>
                <button
                  onClick={() => navigate("/ride-book")}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book a Ride
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {rides.ongoing.map((ride) => (
                  <div
                    key={ride.id}
                    className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                            Ride ID: {ride.id.slice(-6)}
                          </span>
                        </div>
                        <div className="flex items-center text-lg font-semibold text-gray-800">
                          <span className="text-blue-600">
                            ₹{ride.fare || "TBD"}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          ride.status === "accepted"
                            ? "bg-blue-100 text-blue-800"
                            : ride.status === "picked_up"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {ride.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    {/* Pickup & Drop */}
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <div className="w-0.5 h-8 bg-gray-300 ml-1"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">From</p>
                          <p className="font-medium text-gray-800">
                            {ride.pickup}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">To</p>
                          <p className="font-medium text-gray-800">
                            {ride.dropoff}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cancel Button (only requested/accepted) */}
                    {["requested", "accepted"].includes(ride.status) && (
                      <button
                        onClick={() => handleCancelRide(ride.id)}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Cancel Ride
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Completed Rides */}
        {activeTab === "completed" && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
              <FaCheckCircle className="mr-2 text-green-500" />
              Completed Rides
            </h2>
            {rides.completed.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaCheckCircle className="text-green-500 text-2xl" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No completed rides yet
                </h3>
                <p className="text-gray-500">
                  Your completed rides will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {rides.completed.map((ride) => (
                  <div
                    key={ride.id}
                    className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                            {new Date(ride.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center text-lg font-semibold text-gray-800">
                          <FaMoneyBillWave className="text-green-500 mr-2" />
                          <span className="text-green-600">₹{ride.fare}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                        COMPLETED
                      </span>
                    </div>

                    {/* Pickup & Drop */}
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <div className="w-0.5 h-8 bg-gray-300 ml-1"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">From</p>
                          <p className="font-medium text-gray-800">
                            {ride.pickup}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">To</p>
                          <p className="font-medium text-gray-800">
                            {ride.dropoff}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
