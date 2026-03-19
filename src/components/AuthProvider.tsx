"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getURL } from "@/lib/url";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";

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
  const [profileError, setProfileError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const profileFetchInFlight = useRef(false);
  const profileFetchPromise = useRef<Promise<Profile | null> | null>(null);
  const profileFailCount = useRef(0);
  const profileCooldownUntil = useRef<number>(0);
  const lastProfileLogAt = useRef<number>(0);
  const ensuredProfileForUser = useRef<Set<string>>(new Set());

  const getErrorMessage = useCallback((err: unknown): string => {
    if (!err) return "Unknown error";
    if (typeof err === "string") return err;
    if (typeof err === "object" && "message" in err) {
      const m = (err as { message?: unknown }).message;
      if (typeof m === "string") return m;
    }
    try {
      return JSON.stringify(err);
    } catch {
      return "Unknown error";
    }
  }, []);

  const normalizeProfile = useCallback((p: Record<string, unknown>): Profile => {
    // DB 스키마 변화(point vs points) 등에 대비해 최소한의 정규화만 수행
    const next: Record<string, unknown> = { ...p };
    if (typeof next.points === "undefined" && typeof next.point === "number") {
      next.points = next.point;
    }
    if (typeof next.point === "undefined" && typeof next.points === "number") {
      next.point = next.points;
    }
    if (typeof next.credits === "undefined" && typeof next.credit === "number") {
      next.credits = next.credit;
    }
    if (typeof next.credit === "undefined" && typeof next.credits === "number") {
      next.credit = next.credits;
    }
    return next as Profile;
  }, []);

  // 프로필 가져오기
  const fetchProfile = useCallback(
    async (userId: string, opts?: { force?: boolean }) => {
      if (profileFetchInFlight.current && profileFetchPromise.current) {
        return await profileFetchPromise.current;
      }
      const now = Date.now();
      if (!opts?.force && profileCooldownUntil.current > now) return null;

      profileFetchInFlight.current = true;
      const run = (async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          // 프로필이 "없는" 케이스: 유령 회원 방어 (trigger 이전 가입자 등)
          // PostgREST: .single()에서 row 없음은 error로 들어오는 경우가 있음(PGRST116 등)
          const maybeNoRow =
            !data &&
            !!error &&
            (String((error as { code?: string })?.code ?? "").toUpperCase() === "PGRST116" ||
              String((error as { message?: string })?.message ?? "")
                .toLowerCase()
                .includes("0 rows"));

          if (maybeNoRow && !ensuredProfileForUser.current.has(userId)) {
            ensuredProfileForUser.current.add(userId);
            try {
              const bootstrapProfile: Record<string, unknown> = {
                id: userId,
                role: "user",
                // 스키마가 point/points 중 무엇이든 안전하게 채우기
                points: 0,
                point: 0,
                credits: 0,
                credit: 0,
              };

              const { error: upsertError } = await supabase
                .from("profiles")
                .upsert(bootstrapProfile, { onConflict: "id" });

              if (upsertError) {
                const nowLog = Date.now();
                if (nowLog - lastProfileLogAt.current > 5000) {
                  console.warn("프로필 부트스트랩 upsert 실패(경고):", upsertError);
                  lastProfileLogAt.current = nowLog;
                }
              } else {
                // upsert 성공 → 다시 조회
                const { data: refetched, error: refetchError } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", userId)
                  .single();
                if (!refetchError && refetched) {
                  profileFailCount.current = 0;
                  profileCooldownUntil.current = 0;
                  setProfileError(null);
                  return normalizeProfile(refetched as Record<string, unknown>);
                }
              }
            } catch (e) {
              const nowLog = Date.now();
              if (nowLog - lastProfileLogAt.current > 5000) {
                console.warn("프로필 부트스트랩 예외(경고):", e);
                lastProfileLogAt.current = nowLog;
              }
            }
          }

          if (error) {
            // 프로필 조회 실패는 앱 크래시 사유가 아니므로 error 레벨로 스팸을 남기지 않음
            const nowLog = Date.now();
            if (nowLog - lastProfileLogAt.current > 5000) {
              console.warn("프로필 조회 실패(경고):", error);
              lastProfileLogAt.current = nowLog;
            }
            profileFailCount.current += 1;
            setProfileError(getErrorMessage(error));
            // 간단 백오프: 연속 실패 시 잠깐 쿨다운 (무한 재시도/렉 방지)
            if (profileFailCount.current >= 3) {
              profileCooldownUntil.current = Date.now() + 15_000;
            }
            return null;
          }
          profileFailCount.current = 0;
          profileCooldownUntil.current = 0;
          setProfileError(null);
          return normalizeProfile((data ?? {}) as Record<string, unknown>);
        } catch (error) {
          const nowLog = Date.now();
          if (nowLog - lastProfileLogAt.current > 5000) {
            console.warn("프로필 조회 예외(경고):", error);
            lastProfileLogAt.current = nowLog;
          }
          profileFailCount.current += 1;
          setProfileError(getErrorMessage(error));
          if (profileFailCount.current >= 3) {
            profileCooldownUntil.current = Date.now() + 15_000;
          }
          return null;
        } finally {
          profileFetchInFlight.current = false;
          profileFetchPromise.current = null;
        }
      })();

      profileFetchPromise.current = run;
      return await run;
    },
    [supabase, normalizeProfile, getErrorMessage]
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    // 보상/적립 직후에는 항상 강제 재조회 (cooldown 무시)
    const next = await fetchProfile(user.id, { force: true });
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
          setProfileError(null);
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
    const baseUrl = getURL();
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
    const baseUrl = getURL();
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
    const baseUrl = getURL() || "/";
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

  return (
    <AuthContext.Provider value={value}>
      <AppErrorBoundary
        fallback={
          <div className="min-h-[40vh] flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 text-center shadow-sm">
              <p className="text-sm font-semibold text-foreground">일시적인 오류가 발생했습니다.</p>
              {profileError && (
                <p className="mt-2 text-xs text-muted-foreground break-words">
                  프로필 로딩 오류: {profileError}
                </p>
              )}
              <button
                type="button"
                className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-[#52c68f] px-4 text-sm font-semibold text-white hover:bg-[#45b07d]"
                onClick={() => window.location.reload()}
              >
                새로고침
              </button>
            </div>
          </div>
        }
      >
        {children}
      </AppErrorBoundary>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
