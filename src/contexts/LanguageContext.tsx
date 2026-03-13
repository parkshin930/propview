"use client";

import { createContext, useContext, useState, useCallback } from "react";

export const textDict = {
  ko: {
    title: "프랍뷰 랭킹",
    challenge: "챌린지 시작",
    login: "로그인",
    logIn: "로그인",
    liveFeed: "라이브 피드",
    trade: "거래",
    news: "뉴스",
    markets: "마켓",
    community: "커뮤니티",
    rewardsZone: "리워드 존",
    more: "더보기",
    signIn: "로그인",
    today: "오늘",
    home: "홈",
    withdrawalVerify: "출금 인증",
    todayStrategy: "오늘의 전략",
    propCompare: "프랍비교",
    tradingDiary: "매매일지",
    notice: "공지사항",
    airdrop: "에어드롭",
    beginnerGuide: "초보이용가이드",
    propGlossary: "프랍용어사전",
  },
  en: {
    title: "PropView Ranking",
    challenge: "Start Challenge",
    login: "Login",
    logIn: "Log In",
    liveFeed: "Live Feed",
    trade: "Trade",
    news: "News",
    markets: "Markets",
    community: "Community",
    rewardsZone: "Rewards Zone",
    more: "More",
    signIn: "Sign in",
    today: "Today",
    home: "Home",
    withdrawalVerify: "Withdrawal Verification",
    todayStrategy: "Today's Strategy",
    propCompare: "Prop Compare",
    tradingDiary: "Trading Diary",
    notice: "Notice",
    airdrop: "Airdrop",
    beginnerGuide: "Beginner Guide",
    propGlossary: "Prop Glossary",
  },
} as const;

export type Language = keyof typeof textDict;

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (typeof textDict)[Language];
};

const LanguageContext = createContext<LanguageContextType>({
  language: "ko",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: textDict.ko,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ko");

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === "ko" ? "en" : "ko"));
  }, []);

  const t = textDict[language];

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
