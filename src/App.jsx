import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import UserDashboard from "./pages/UserDashboard";
import DriverDashboard from "./pages/DriverDashboar";
import UserRides from "./pages/UserRides";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import DriverDetails from "./pages/DriverDetails";
import CompletedRides from "./pages/CompletedRides";
const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/ride-book" element={<UserDashboard />} />
        <Route
          path="/driver-dashboard"
          element={
            <ProtectedRoute>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/my-rides" element={<UserRides />} />
        <Route path="/ride/:ride_id/driver" element={<DriverDetails />} />
        <Route path="/driver/completed-rides" element={<CompletedRides />} />
      </Routes>
      <ToastContainer />
    </>
  );
};

export default App;
