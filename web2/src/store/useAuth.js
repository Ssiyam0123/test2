import { create } from "zustand";
import { API } from "../api/axios";
import toast from "react-hot-toast";

const useAuth = create((set, get) => ({ 
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  onlineUsers: [],

  hasPermission: (permission) => {
    const { authUser } = get(); 
    
    if (!authUser || !authUser.role) return false;

    const roleName = authUser.role.name;
    const permissions = authUser.role.permissions || [];

    if (roleName === "superadmin" || permissions.includes("all_access")) {
      return true;
    }

    return permissions.includes(permission);
  },

  isMaster: () => {
    const { authUser } = get();
    return authUser?.role?.name === "superadmin";
  },


  checkAuth: async () => {
    try {
      const res = await API.get("/auth/check");
      set({ authUser: res.data.data });
    } catch (error) {
      set({ authUser: null }); 
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await API.post("/auth/register", data);
      set({ authUser: res.data.user }); 
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await API.post("/auth/login", data);
      set({ authUser: res.data.user });
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await API.post("/auth/logout");
      set({ authUser: null }); 
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error logging out");
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await API.put("/auth/update-profile", data);
      const updatedUser = res.data.user || res.data;
      set({ authUser: updatedUser }); 
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  },
}));

export default useAuth;