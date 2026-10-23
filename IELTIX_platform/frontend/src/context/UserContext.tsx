import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/index.js';
import { api } from '../services/api.js';
import { supabase } from '../services/supabaseClient.js';
import { useAuth } from './AuthContext.js';

interface UserContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  isAuthenticated: boolean;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  loading: boolean;
}

const defaultUser: UserProfile = {
  id: 'usr-98124',
  name: 'Mansur Toshmatov',
  role: 'IELTS Academic Candidate',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  targetBand: '7.5 Academic',
  examDate: 'Oct 26, 2025',
  daysLeft: 7,
  vipTier: 'MAX_VIP',
  activeExamMode: 'IELTS',
  stats: {
    testsCompleted: 14,
    overallBand: 7.0,
    listeningBand: 7.5,
    readingBand: 7.0,
    writingBand: 6.5,
    speakingBand: 7.0,
    studyStreakDays: 9,
  },
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('mocklife_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return defaultUser;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return auth.isAuthenticated || localStorage.getItem('mocklife_auth') === 'true';
  });

  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  // Sync with AuthContext user & Telegram session
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      setIsAuthenticated(true);
      setUser(prev => {
        const updated: UserProfile = {
          ...prev,
          id: auth.user!.id,
          name: auth.user!.name || prev.name,
          phone: auth.user!.phone || prev.phone,
          telegramId: auth.user!.telegramId || prev.telegramId,
          isTelegramLinked: auth.user!.isTelegramLinked ?? true,
          targetBand: auth.user!.targetBand || prev.targetBand,
          currentBand: auth.user!.currentBand || prev.currentBand || 6.0,
          role: auth.user!.isTelegramLinked ? 'Telegram Tasdiqlangan Nomzod' : prev.role,
          vipTier: 'MAX_VIP',
          daysLeft: 14,
          stats: {
            ...prev.stats,
            overallBand: auth.user!.currentBand || prev.stats.overallBand,
          },
        };
        localStorage.setItem('mocklife_user_profile', JSON.stringify(updated));
        return updated;
      });
    }
  }, [auth.isAuthenticated, auth.user]);

  useEffect(() => {
    // Auto-detect Telegram Mini App user session directly
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user) {
        const tgUser = tg.initDataUnsafe.user;
        const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || tgUser.username || 'IELTS Nomzod';
        setIsAuthenticated(true);
        localStorage.setItem('mocklife_auth', 'true');
        setUser(prev => ({
          ...prev,
          id: `tg-${tgUser.id}`,
          telegramId: tgUser.id,
          name: fullName,
          role: 'Telegram Tasdiqlangan Nomzod',
          vipTier: 'MAX_VIP',
          isTelegramLinked: true,
          daysLeft: 30,
        }));
      }
    } catch (e) {
      console.warn('Telegram WebApp init check:', e);
    }

    // Check Supabase session on startup
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        localStorage.setItem('mocklife_auth', 'true');
        const meta = session.user.user_metadata || {};
        setUser(prev => {
          const updated = {
            ...prev,
            id: session.user.id,
            name: meta.name || prev.name,
            targetBand: meta.targetBand || prev.targetBand,
            examDate: meta.examDate || prev.examDate,
            activeExamMode: meta.activeExamMode || prev.activeExamMode,
          };
          localStorage.setItem('mocklife_user_profile', JSON.stringify(updated));
          return updated;
        });
      }
    }).catch(() => {});

    api.getUserProfile()
      .then(res => {
        if (res?.data) {
          setUser(prev => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {});
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setLoading(true);
    try {
      if (password) {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authData?.user && !error) {
          const meta = authData.user.user_metadata || {};
          const updated: UserProfile = {
            ...user,
            id: authData.user.id,
            name: meta.name || (email.includes('@') ? email.split('@')[0] : user.name),
            targetBand: meta.targetBand || user.targetBand,
            examDate: meta.examDate || user.examDate,
            activeExamMode: meta.activeExamMode || user.activeExamMode,
          };
          setUser(updated);
          setIsAuthenticated(true);
          localStorage.setItem('mocklife_auth', 'true');
          localStorage.setItem('mocklife_user_profile', JSON.stringify(updated));
          setLoading(false);
          return true;
        }
      }

      // Backend API login fallback
      const res = await api.login(email, password).catch(() => null);
      if (res?.data) {
        setUser(res.data);
        setIsAuthenticated(true);
        localStorage.setItem('mocklife_auth', 'true');
        localStorage.setItem('mocklife_user_profile', JSON.stringify(res.data));
        setLoading(false);
        return true;
      }
    } catch (e) {
      console.warn('Supabase login notice:', e);
    }

    // Local fallback
    const name = email.includes('@') ? email.split('@')[0] : 'Nomzod';
    const updated = {
      ...user,
      name: name.charAt(0).toUpperCase() + name.slice(1),
    };
    setUser(updated);
    setIsAuthenticated(true);
    localStorage.setItem('mocklife_auth', 'true');
    localStorage.setItem('mocklife_user_profile', JSON.stringify(updated));
    setLoading(false);
    return true;
  };

  const register = async (data: any): Promise<boolean> => {
    setLoading(true);
    try {
      // 1. Supabase Auth registration
      if (data.email && data.password) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
              targetBand: data.targetBand,
              examDate: data.examDate,
              activeExamMode: data.activeExamMode,
            }
          }
        });

        // 2. Insert into Supabase candidates table if table is ready
        if (authData?.user) {
          try {
            await supabase.from('candidates').upsert({
              id: authData.user.id,
              email: data.email,
              name: data.name,
              target_band: data.targetBand,
              exam_date: data.examDate,
              active_mode: data.activeExamMode,
              created_at: new Date().toISOString(),
            });
          } catch (tblErr) {
            console.warn('Supabase table sync notice:', tblErr);
          }
        }
      }

      // 3. Backend sync
      await api.register(data).catch(() => {});

      const updated: UserProfile = {
        ...user,
        name: data.name || user.name,
        targetBand: data.targetBand || user.targetBand,
        examDate: data.examDate || user.examDate,
        activeExamMode: data.activeExamMode || user.activeExamMode,
      };
      setUser(updated);
      setIsAuthenticated(true);
      localStorage.setItem('mocklife_auth', 'true');
      localStorage.setItem('mocklife_user_profile', JSON.stringify(updated));
      setLoading(false);
      return true;
    } catch (err) {
      console.warn('Registration error notice:', err);
      // Fallback
      const updated = {
        ...user,
        name: data.name || user.name,
        targetBand: data.targetBand || user.targetBand,
        examDate: data.examDate || user.examDate,
        activeExamMode: data.activeExamMode || user.activeExamMode,
      };
      setUser(updated);
      setIsAuthenticated(true);
      localStorage.setItem('mocklife_auth', 'true');
      localStorage.setItem('mocklife_user_profile', JSON.stringify(updated));
      setLoading(false);
      return true;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    auth.logout();
    setIsAuthenticated(false);
    localStorage.removeItem('mocklife_auth');
    localStorage.removeItem('mocklife_user_profile');
    setProfileModalOpen(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      const res = await api.updateUserProfile(updates);
      if (res?.data) {
        setUser(res.data);
        localStorage.setItem('mocklife_user_profile', JSON.stringify(res.data));
      } else {
        setUser(prev => {
          const updated = { ...prev, ...updates };
          localStorage.setItem('mocklife_user_profile', JSON.stringify(updated));
          return updated;
        });
      }
      return true;
    } catch {
      setUser(prev => {
        const updated = { ...prev, ...updates };
        localStorage.setItem('mocklife_user_profile', JSON.stringify(updated));
        return updated;
      });
      return true;
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      isAuthenticated,
      profileModalOpen,
      setProfileModalOpen,
      login,
      register,
      logout,
      updateProfile,
      loading,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};

