import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../api/axios";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaLocationArrow, FaMapMarkerAlt, FaRoute, FaMoneyBillWave, FaClock, FaRulerCombined, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

// 🔹 Auto-fit map component
function FitBounds({ pickup, dropoff }) {
  const map = useMap();
  useEffect(() => {
    if (pickup && dropoff) {
      map.fitBounds(
        [
          [pickup.lat, pickup.lng],
          [dropoff.lat, dropoff.lng],
        ],
        { padding: [50, 50] }
      );
    }
  }, [pickup, dropoff, map]);
  return null;
}

export default function UserDashboard() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [suggestions, setSuggestions] = useState({ pickup: [], dropoff: [] });
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [fare, setFare] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const navigate = useNavigate();

  // 🔹 Autocomplete suggestions
  const fetchSuggestions = async (text, type) => {
    if (text.length < 3) {
      setSuggestions((prev) => ({ ...prev, [type]: [] }));
      return;
    }
    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        text
      )}&limit=5&apiKey=${GEOAPIFY_KEY}`;
      const { data } = await axios.get(url);
      setSuggestions((prev) => ({ ...prev, [type]: data.features || [] }));
    } catch (err) {
      console.error("Autocomplete error:", err.message);
    }
  };

  // 🔹 Select suggestion
  const handleSelect = (place, type) => {
    const coords = {
      lat: place.geometry.coordinates[1],
      lng: place.geometry.coordinates[0],
    };
    if (type === "pickup") {
      setPickup(place.properties.formatted);
      setPickupCoords(coords);
      setSuggestions((prev) => ({ ...prev, pickup: [] }));
    } else {
      setDropoff(place.properties.formatted);
      setDropoffCoords(coords);
      setSuggestions((prev) => ({ ...prev, dropoff: [] }));
    }
    setActiveInput(null);
  };

  // 🔹 Fetch route, distance, duration, fare
  const fetchRoute = async () => {
    if (!pickupCoords || !dropoffCoords) return;
    setIsLoading(true);
    try {
      const url = `https://api.geoapify.com/v1/routing?waypoints=${pickupCoords.lat},${pickupCoords.lng}|${dropoffCoords.lat},${dropoffCoords.lng}&mode=drive&apiKey=${GEOAPIFY_KEY}`;
      const { data } = await axios.get(url);
      if (data.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates[0].map((c) => [c[1], c[0]]);
        setRouteCoords(coords);

        const route = data.features[0].properties;
        const distKm = (route.distance / 1000).toFixed(2);
        const durMin = Math.round(route.time / 60);
        setDistance(distKm);
        setDuration(durMin);

        // Fare
        const baseFare = 50;
        const perKmRate = 10;
        const calcFare = Math.round(baseFare + distKm * perKmRate);
        setFare(calcFare);
      }
    } catch (err) {
      console.error("Route error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pickupCoords && dropoffCoords) fetchRoute();
  }, [pickupCoords, dropoffCoords]);

  // 🔹 Request ride + open Razorpay
  const handleRequestRide = async () => {
    setIsLoading(true);
    try {
      const res = await api.post("/ride/request", { pickup, dropoff });
      if (!res.data.success) return alert(res.data.message);

      const ride_id = res.data.ride.id;

      // ✅ Create Razorpay order
      const orderRes = await api.post("/payment/create-order", { ride_id, currency: "INR" });
      const { order } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "RideX",
        description: "Ride Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            await api.post("/payment/verify", {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            toast.success("Ride book successfully")
            navigate('/my-rides')
          } catch (err) {
            console.error("Payment verification error:", err.message);
            alert("Payment verification failed!");
          }
        },
        theme: { color: "#007bff" },
      };

      // 🔹 Load Razorpay script dynamically
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      console.error("Ride/payment error:", err.message);
      alert("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* Left: Form Panel */}
      <div className="w-full lg:w-1/3 p-6 bg-white shadow-lg overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Book Your Ride</h1>
          <p className="text-gray-600">Enter your pickup and destination locations</p>
        </div>

        {/* Pickup input */}
        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Where are you?"
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full transition"
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value);
                fetchSuggestions(e.target.value, "pickup");
              }}
              onFocus={() => setActiveInput("pickup")}
            />
          </div>
          {suggestions.pickup.length > 0 && activeInput === "pickup" && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {suggestions.pickup.map((s) => (
                <li
                  key={s.properties.place_id}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelect(s, "pickup")}
                >
                  <div className="font-medium">{s.properties.formatted}</div>
                  <div className="text-sm text-gray-500">{s.properties.address_line2}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dropoff input */}
        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLocationArrow className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Where to?"
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full transition"
              value={dropoff}
              onChange={(e) => {
                setDropoff(e.target.value);
                fetchSuggestions(e.target.value, "dropoff");
              }}
              onFocus={() => setActiveInput("dropoff")}
            />
          </div>
          {suggestions.dropoff.length > 0 && activeInput === "dropoff" && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {suggestions.dropoff.map((s) => (
                <li
                  key={s.properties.place_id}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelect(s, "dropoff")}
                >
                  <div className="font-medium">{s.properties.formatted}</div>
                  <div className="text-sm text-gray-500">{s.properties.address_line2}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Route Details */}
        {distance && duration && fare && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
            <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center">
              <FaRoute className="mr-2 text-blue-600" />
              Route Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <FaRulerCombined className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="font-semibold">{distance} km</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <FaClock className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold">{duration} min</p>
                </div>
              </div>
              <div className="flex items-center col-span-2">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <FaMoneyBillWave className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Fare</p>
                  <p className="font-semibold text-lg">₹{fare}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRequestRide}
            disabled={!pickupCoords || !dropoffCoords || isLoading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <FaCheckCircle className="mr-2" />
                Request Ride
              </>
            )}
          </button>
          <button
            onClick={() => navigate("/my-rides")}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            My Rides
          </button>
        </div>
      </div>

      {/* Right: Map */}
      <div className="w-full lg:w-2/3 relative">
        <MapContainer
          center={[28.6139, 77.209]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {pickupCoords && (
            <Marker position={[pickupCoords.lat, pickupCoords.lng]}>
              <Popup>
                <div className="font-semibold">Pickup</div>
                <div className="text-sm">{pickup}</div>
              </Popup>
            </Marker>
          )}
          {dropoffCoords && (
            <Marker position={[dropoffCoords.lat, dropoffCoords.lng]}>
              <Popup>
                <div className="font-semibold">Destination</div>
                <div className="text-sm">{dropoff}</div>
              </Popup>
            </Marker>
          )}
          {routeCoords.length > 0 && (
            <Polyline 
              positions={routeCoords} 
              color="#3B82F6" 
              weight={5}
              opacity={0.7}
            />
          )}
          <FitBounds pickup={pickupCoords} dropoff={dropoffCoords} />
        </MapContainer>
        
        {/* Map Overlay */}
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm">Pickup</span>
          </div>
          <div className="flex items-center mt-2">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm">Destination</span>
          </div>
        </div>
      </div>
    </div>
  );
}