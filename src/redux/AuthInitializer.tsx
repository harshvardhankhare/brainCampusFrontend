import { useEffect } from "react";
import { useDispatch } from "react-redux";
import api from "../api/axios";

import {
  setUser,
  setLoading,
  setInitialized,
  clearUser,
} from "./authSlice";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch(setInitialized(true));
        return;
      }

      try {
        dispatch(setLoading(true));
        const response = await api.get("/auth/me");
        dispatch(setUser(response.data.data));
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        localStorage.removeItem("token");

        dispatch(clearUser());
      } finally {
        dispatch(setLoading(false));
        dispatch(setInitialized(true));
      }
    };

    initializeAuth();
  }, [dispatch]);

  return children;
};

export default AuthInitializer;