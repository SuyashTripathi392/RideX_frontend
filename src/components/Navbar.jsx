import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaHome,
  FaCar,
} from "react-icons/fa";
import { useState } from "react";

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="text-xl font-bold text-white animate-pulse">
              Loading...
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link
              to={
                user
                  ? user.role === "driver"
                    ? "/driver-dashboard"
                    : "/dashboard"
                  : "/"
              }
              className="flex items-center text-xl font-bold text-white"
            >
              <FaCar className="mr-2" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-400">
                RideX
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4 items-center">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      location.pathname === "/login"
                        ? "bg-white text-blue-600 font-medium"
                        : "text-white hover:bg-blue-500"
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      location.pathname === "/signup"
                        ? "bg-white text-blue-600 font-medium"
                        : "bg-indigo-500 text-white hover:bg-indigo-600"
                    }`}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={
                      user
                        ? user.role === "driver"
                          ? "/driver-dashboard"
                          : "/dashboard"
                        : "/"
                    }
                    className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                      location.pathname === "/dashboard"
                        ? "bg-blue-500 text-white"
                        : "text-white hover:bg-blue-500"
                    }`}
                  >
                    <FaHome className="mr-1" />
                    <span>Dashboard</span>
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center text-white bg-blue-500 px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      <FaUserCircle className="text-xl mr-1" />
                      <span>{user.name || user.email}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center"
                      >
                        <FaSignOutAlt className="mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <FaTimes size={24} />
                ) : (
                  <FaBars size={24} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-blue-700 px-4 py-4">
            {!user ? (
              <div className="flex flex-col space-y-3">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg text-center ${
                    location.pathname === "/login"
                      ? "bg-white text-blue-600 font-medium"
                      : "text-white hover:bg-blue-500"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`px-4 py-2 rounded-lg text-center ${
                    location.pathname === "/signup"
                      ? "bg-white text-blue-600 font-medium"
                      : "bg-indigo-500 text-white hover:bg-indigo-600"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link
                  to={
                    user
                      ? user.role === "driver"
                        ? "/driver-dashboard"
                        : "/dashboard"
                      : "/"
                  }
                  className={`flex items-center justify-center px-4 py-2 rounded-lg ${
                    location.pathname === "/dashboard"
                      ? "bg-blue-500 text-white"
                      : "text-white hover:bg-blue-500"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaHome className="mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center justify-center px-4 py-2 rounded-lg ${
                    location.pathname === "/profile"
                      ? "bg-blue-500 text-white"
                      : "text-white hover:bg-blue-500"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaUserCircle className="mr-2" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
