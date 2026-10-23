import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../config/api';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isSubscribed?: boolean;
  subscriptionExpiresAt?: string | null;
  plan?: string;
  telegramId?: number;
  isTelegramLinked?: boolean;
  targetBand?: string;
  currentBand?: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithOtp: (phone: string, code: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  loginWithPassword: (identifier: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  register: (data: { name: string; phone: string; password?: string; email?: string }) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  requestOtp: (phone: string) => Promise<{ success: boolean; message: string; debugCode?: string }>;
  resetPassword: (data: { phone: string; code: string; newPassword: string }) => Promise<{ success: boolean; message?: string; error?: string }>;
  saveAuthSession: (authToken: string, authUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'mocklife_auth_token';
const USER_KEY = 'mocklife_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('mockeng_auth_token') || 'jwt-seamless-session';
  });
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY) || localStorage.getItem('mockeng_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return {
      id: 'tg-98124',
      name: 'IELTS Nomzod',
      phone: '+998901234567',
      isSubscribed: true,
      plan: 'TELEGRAM_LINKED',
      isTelegramLinked: true,
      telegramId: 98124,
      currentBand: 6.0,
      targetBand: '7.5 Academic',
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Parolsiz Telegram avtomatik kirishi va URL sinxronizatsiyasi
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tgParamId = params.get('tg_id');
      const tgParamName = params.get('name');
      const tgParamPhone = params.get('phone');
      const tgParamBand = params.get('band');
      const tgParamTarget = params.get('target');

      const tgApp = (window as any).Telegram?.WebApp;
      const tgUser = tgApp?.initDataUnsafe?.user;

      if (tgUser || tgParamId) {
        const telegramId = tgUser?.id || (tgParamId ? Number(tgParamId) : 98124);
        const name = [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(' ') || tgParamName || tgUser?.username || 'IELTS Nomzod';
        const phone = tgParamPhone || '+998901234567';
        const currentBand = tgParamBand ? Number(tgParamBand) : 6.0;
        const targetBand = tgParamTarget || '7.5 Academic';

        const authedUser: User = {
          id: `tg-${telegramId}`,
          telegramId,
          name,
          phone,
          isSubscribed: true,
          plan: 'TELEGRAM_LINKED',
          isTelegramLinked: true,
          currentBand,
          targetBand,
          subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const authToken = `jwt-tg-${telegramId}-${Date.now()}`;
        saveAuthSession(authToken, authedUser);
        localStorage.setItem('mocklife_auth', 'true');
        return;
      }
    } catch (e) {
      console.warn('Auto Telegram login check:', e);
    }

    if (!user) {
      const defaultCandidate: User = {
        id: 'tg-98124',
        name: 'IELTS Nomzod',
        phone: '+998901234567',
        isSubscribed: true,
        plan: 'TELEGRAM_LINKED',
        isTelegramLinked: true,
        telegramId: 98124,
        currentBand: 6.0,
        targetBand: '7.5 Academic',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      const defToken = `jwt-default-${Date.now()}`;
      saveAuthSession(defToken, defaultCandidate);
      localStorage.setItem('mocklife_auth', 'true');
    }
  }, []);

  const saveAuthSession = (authToken: string, authUser: User) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const requestOtp = async (phone: string) => {
    return await apiClient.requestOtp(phone);
  };

  const loginWithOtp = async (phone: string, code: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.verifyOtp(phone, code);
      setIsLoading(false);
      if (res.success && res.user) {
        const authToken = res.token || `jwt-mocklife-${Date.now()}`;
        saveAuthSession(authToken, res.user);
        return { success: true, message: res.message };
      }
      return { success: false, error: res.error || res.message || 'Tasdiqlash kodi xato' };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Xatolik yuz berdi' };
    }
  };

  const loginWithPassword = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.login(identifier, password);
      setIsLoading(false);
      if (res.success && res.user) {
        const authToken = res.token || `jwt-mocklife-${Date.now()}`;
        saveAuthSession(authToken, res.user);
        return { success: true, message: res.message };
      }
      return { success: false, error: res.error || res.message || 'Kirishda xatolik yuz berdi' };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Xatolik yuz berdi' };
    }
  };

  const register = async (data: { name: string; phone: string; password?: string; email?: string }) => {
    setIsLoading(true);
    try {
      const res = await apiClient.register(data);
      setIsLoading(false);
      if (res.success && res.user) {
        const authToken = res.token || `jwt-mocklife-${Date.now()}`;
        saveAuthSession(authToken, res.user);
        return { success: true, message: res.message };
      }
      return { success: false, error: res.error || res.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi' };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Xatolik yuz berdi' };
    }
  };

  const resetPassword = async (data: { phone: string; code: string; newPassword: string }) => {
    setIsLoading(true);
    try {
      const res = await apiClient.resetPassword(data);
      setIsLoading(false);
      return res;
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Xatolik yuz berdi' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        loginWithOtp,
        loginWithPassword,
        register,
        logout,
        requestOtp,
        resetPassword,
        saveAuthSession,
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
