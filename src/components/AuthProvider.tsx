"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  refreshProfile: async () => {},
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  // 프로필 가져오기
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("프로필 조회 에러:", error);
        return null;
      }
      return data as Profile;
    } catch (error) {
      console.error("프로필 조회 실패:", error);
      return null;
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const next = await fetchProfile(user.id);
    if (next) setProfile(next);
  }, [user, fetchProfile]);

  useEffect(() => {
    let isMounted = true;
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (isMounted) setProfile(profile);
        }
      } catch (error) {
        console.error("인증 초기화 에러:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const nextProfile = await fetchProfile(newSession.user.id);
          if (isMounted) setProfile(nextProfile);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signInWithGoogle = useCallback(async () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.length > 0
        ? process.env.NEXT_PUBLIC_SITE_URL
        : typeof window !== "undefined"
          ? window.location.origin
          : "";
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${baseUrl}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("구글 로그인 에러:", error);
        throw error;
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      throw error;
    }
  }, [supabase]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("이메일 로그인 에러:", error);
        throw error;
      }
    } catch (error) {
      console.error("이메일 로그인 실패:", error);
      throw error;
    }
  }, [supabase]);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.length > 0
        ? process.env.NEXT_PUBLIC_SITE_URL
        : typeof window !== "undefined"
          ? window.location.origin
          : "";
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${baseUrl}/auth/callback`,
        },
      });

      if (error) {
        console.error("이메일 회원가입 에러:", error);
        throw error;
      }
    } catch (error) {
      console.error("이메일 회원가입 실패:", error);
      throw error;
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.length > 0
        ? process.env.NEXT_PUBLIC_SITE_URL
        : typeof window !== "undefined"
          ? window.location.origin
          : "/";
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("로그아웃 에러:", error);
        throw error;
      }
      setUser(null);
      setProfile(null);
      setSession(null);
      if (typeof window !== "undefined") {
        window.location.href = baseUrl;
      }
    } catch (error) {
      console.error("로그아웃 실패:", error);
      throw error;
    }
  }, [supabase]);

  const value = useMemo(
    () => ({
      user,
      profile,
      session,
      isLoading,
      refreshProfile,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
    }),
    [
      user,
      profile,
      session,
      isLoading,
      refreshProfile,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
