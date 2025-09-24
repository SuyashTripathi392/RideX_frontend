import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios"; // tumhara axios instance
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // 🔹 Fetch profile (on page load / refresh)
  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 🔹 Signup
  const signup = async (formData) => {
    try {
      const res = await api.post("/auth/signup", formData);
      if (res.data.success) {
        toast.success("Account create  successfull! please login with your email and password");
        return true;
      } else {
        toast.error(res.data.message);
        return false;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
      return false;
    }
  };

  // 🔹 Login
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      if (res.data.user) {
        // 🔹 Auth se basic user mila (id, email)
        setUser(res.data.user);

        // 🔹 Ab backend se full profile fetch karo
        try {
          const profileRes = await api.get("/auth/me");
          if (profileRes.data.success) {
            setUser(profileRes.data.user); // ✅ yahi wala user use hoga (with role, is_active, etc.)
            toast.success("Login successful");
            return profileRes.data.user; // 👈 ye return karo
          }
        } catch {
          toast.error("Failed to fetch profile");
          return null;
        }
      } else {
        toast.error(res.data.message);
        return null;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      return null;
    }
  };

  // 🔹 Logout
  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      toast.success("Logged out");
      navigate("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  const sendResetPassword = async (email) => {
    try {
      const res = await api.post("/auth/reset-password", { email });
      toast.success(res.data.message);
    } catch {
      toast.error("Failed to send reset link");
    }
  };

  

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        signup,
        login,
        logout,
        sendResetPassword,
        
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
