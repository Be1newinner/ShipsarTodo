"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";

interface User {
  userId: string;
  email: string;
  name: string;
  timezone: string;
  onboardingComplete: boolean;
  activeProjectId?: string;
  projects?: string[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAuth() {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<User>("/api/auth/me", fetcher, { revalidateOnFocus: false });

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }

    const userData = await res.json();
    mutate(userData);
    return userData;
  };

  const signup = async (email: string, name: string, password: string) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Signup failed");
    }

    return await res.json();
  };

  const verifyOtp = async (email: string, otp: string) => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "OTP Verification failed");
    }

    const userData = await res.json();
    mutate(userData);
    return userData;
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    mutate(undefined);
  };

  return {
    user,
    error,
    isLoading,
    login,
    signup,
    verifyOtp,
    logout,
    isAuthenticated: !!user,
  };
}
