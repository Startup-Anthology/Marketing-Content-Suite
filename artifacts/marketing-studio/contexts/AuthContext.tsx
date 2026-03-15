import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: string;
  preferences: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const getBaseUrl = () => {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}/api`;
  return "/api";
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);

      if (storedToken && storedUser) {
        const res = await fetch(`${getBaseUrl()}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (res.ok) {
          const userData = await res.json();
          setToken(storedToken);
          setUser(userData);
          await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        } else {
          await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
        }
      }
    } catch {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${getBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Login failed");
    }

    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName: string) => {
    const res = await fetch(`${getBaseUrl()}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Signup failed");
    }

    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  }, []);

  const logout = useCallback(async () => {
    const currentToken = token;
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
    try {
      if (currentToken) {
        fetch(`${getBaseUrl()}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${currentToken}` },
        }).catch(() => {});
      }
    } catch {}
  }, [token]);

  const updateUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser);
    AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
