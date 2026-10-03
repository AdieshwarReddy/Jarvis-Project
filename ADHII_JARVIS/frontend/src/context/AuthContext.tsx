import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, settingsApi } from '../api/client';

interface User {
  id: string;
  email: string;
  display_name: string;
  preferred_name: string;
}

interface Profile {
  id: string;
  email: string;
  display_name: string;
  preferred_name: string;
  avatar_url?: string;
  timezone: string;
  preferred_language: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jarvis_token') || 'demo-token');
  const [user, setUser] = useState<User | null>({
    id: '00000000-0000-0000-0000-000000000001',
    email: 'demo@adhiijarvis.ai',
    display_name: 'Adhi User',
    preferred_name: 'Adhi',
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const data = await settingsApi.getProfile();
      setProfile(data);
      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          display_name: data.display_name || 'Adhi',
          preferred_name: data.preferred_name || 'Adhi',
        });
      }
    } catch (e) {
      console.warn('Could not load user profile, using fallback', e);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await refreshProfile();
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.access_token) {
      localStorage.setItem('jarvis_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      await refreshProfile();
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    const res = await authApi.signup({ email, password, display_name: displayName });
    if (res.access_token) {
      localStorage.setItem('jarvis_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      await refreshProfile();
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (_) {}
    localStorage.removeItem('jarvis_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        login,
        signup,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
