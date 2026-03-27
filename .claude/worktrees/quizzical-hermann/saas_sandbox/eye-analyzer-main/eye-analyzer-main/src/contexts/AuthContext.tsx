import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface OptometristProfile {
  id: string;
  user_id: string;
  optometrist_name: string;
  professional_type?: string;
  optometrist_license_number?: string;
  years_of_experience?: string;
  clinic_name: string;
  clinic_address: string;
  clinic_phone: string;
  clinic_line_id?: string;
  clinic_wechat_id?: string;
  clinic_email?: string;
  clinic_region: string;
  registration_language?: string;
  country?: string;
  professional_role?: string;
  created_at: string;
  updated_at: string;
}

export type AppRole = 'owner' | 'admin' | 'accountant' | 'support' | 'user';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: OptometristProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  userRole: AppRole;
  isOwner: boolean;
  hasPaymentAccess: boolean;
  hasSubscriptionAccess: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; data: { user: User | null } | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<OptometristProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole>('user');

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('optometrist_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as OptometristProfile | null;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  };

  const fetchUserRole = async (userId: string): Promise<AppRole> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'user';
      }
      if (data?.role) {
        return data.role as AppRole;
      }
      return 'user';
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      return 'user';
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      const role = await fetchUserRole(user.id);
      setUserRole(role);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            const role = await fetchUserRole(session.user.id);
            setUserRole(role);
            setIsLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setUserRole('user');
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const [profileData, role] = await Promise.all([
          fetchProfile(session.user.id),
          fetchUserRole(session.user.id)
        ]);
        setProfile(profileData);
        setUserRole(role);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { 
      error: error as Error | null, 
      data: data ? { user: data.user } : null 
    };
  };

  const signOut = async () => {
    // Clear local state first to prevent race conditions
    setUser(null);
    setSession(null);
    setProfile(null);
    setUserRole('user');
    
    // Then sign out from Supabase
    await supabase.auth.signOut();
  };

  // Computed values based on userRole
  const isAdmin = ['owner', 'admin', 'accountant', 'support'].includes(userRole);
  const isOwner = userRole === 'owner';
  const hasPaymentAccess = ['owner', 'accountant'].includes(userRole);
  const hasSubscriptionAccess = ['owner', 'admin', 'accountant'].includes(userRole);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isLoading,
      isAdmin,
      userRole,
      isOwner,
      hasPaymentAccess,
      hasSubscriptionAccess,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
