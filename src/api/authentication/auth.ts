import axios from "axios";
import api from "../baseApi";
// Base URL of your NestJS backend API
const rawUrl = import.meta.env.VITE_BE_URL ?? "http://localhost:3000";
const API_BASE_URL = `${rawUrl.replace(/\/+$/, "")}/auth`;
// Function to get user profile by userId
export const getUserProfile = async (userId: string) => {
  try {
    const response = await api.get(`/users/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};
// Function to handle user sign up
export const signup = async (
  userId: string,
  email: string | "",
  password: string,
  username: string,
) => {
  console.log("🔐 API: Starting signup for user:", { userId, email, username });
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      userId,
      email,
      password,
      username,
    });
    console.log("🔐 API: Signup successful");
    return response.data;
  } catch (error) {
    console.error("🔐 API: Signup error:", error);
    throw error; // Handle error accordingly
  }
};

// Function to handle user login (send Firebase token to backend)
export const login = async (token: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      token,
    });
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error; // Handle error accordingly
  }
};

// Function to handle user sign out
export const signout = async (uid: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signout`, {
      uid,
    });
    return response.data;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error; // Handle error accordingly
  }
};

// Function to verify token (if you want to check token validity)
export const verifyToken = async (token: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/verify-token`, {
      token,
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying token:", error);
    throw error; // Handle error accordingly
  }
};

// Function to handle password reset
export const forgotPassword = async (email: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/forgot-password`, {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error; // Handle error accordingly
  }
};
