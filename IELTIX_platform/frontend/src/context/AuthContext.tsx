import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../config/api';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  username?: string;
  photoUrl?: string;
  isSubscribed?: boolean;
  subscriptionExpiresAt?: string | null;
  plan?: string;
  telegramId?: number;
  isTelegramLinked?: boolean;
  targetBand?: string;
  currentBand?: number;
  joinedAt?: string;
  lastLoginAt?: string;
  trialExpiresAt?: string;
  trialDaysRemaining?: number;
  trialHoursRemaining?: number;
  isTrialActive?: boolean;
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
  loginWithTelegram: (tgData: any) => Promise<{ success: boolean; message?: string; error?: string }>;
  saveAuthSession: (authToken: string, authUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'mocklife_auth_token';
const USER_KEY = 'mocklife_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || null;
  });
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.id) {
          const expMs = u.trialExpiresAt ? new Date(u.trialExpiresAt).getTime() : (u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000);
          const diffMs = expMs - Date.now();
          u.trialDaysRemaining = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
          u.trialHoursRemaining = Math.max(0, Math.ceil(diffMs / (60 * 60 * 1000)));
          u.isTrialActive = diffMs > 0;
          return u;
        }
      } catch {
        return null;
      }
    }
    return null;
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
        sessionStorage.setItem('mocklife_admin_unlocked', 'true');
        return;
      }
    } catch (e) {
      console.warn('Auto Telegram login check:', e);
    }
  }, []);

  const saveAuthSession = (authToken: string, authUser: User) => {
    // 7 kunlik bepul sinov hisoblash
    const now = Date.now();
    const joinedAt = authUser.joinedAt || new Date().toISOString();
    const lastLoginAt = new Date().toISOString();
    const trialExpiresAt = authUser.trialExpiresAt || authUser.subscriptionExpiresAt || new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
    const expMs = new Date(trialExpiresAt).getTime();
    const diffMs = expMs - now;
    const trialDaysRemaining = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
    const trialHoursRemaining = Math.max(0, Math.ceil(diffMs / (60 * 60 * 1000)));
    const isTrialActive = diffMs > 0;

    const enrichedUser: User = {
      ...authUser,
      joinedAt,
      lastLoginAt,
      trialExpiresAt,
      trialDaysRemaining,
      trialHoursRemaining,
      isTrialActive,
    };

    setToken(authToken);
    setUser(enrichedUser);
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(enrichedUser));
    sessionStorage.setItem('mocklife_admin_unlocked', 'true');
  };

  const loginWithTelegram = async (tgData: any): Promise<{ success: boolean; message?: string; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await apiClient.loginWithTelegram(tgData);
      setIsLoading(false);
      if (res.success && res.user) {
        const authToken = res.token || `jwt-tg-${res.user.telegramId || Date.now()}`;
        saveAuthSession(authToken, res.user);
        localStorage.setItem('mocklife_auth', 'true');
        sessionStorage.setItem('mocklife_admin_unlocked', 'true');
        return { success: true };
      }
      return { success: false, error: res.error || 'Telegram orqali kirishda xatolik yuz berdi' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Xatolik yuz berdi' };
    }
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
        loginWithTelegram,
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
