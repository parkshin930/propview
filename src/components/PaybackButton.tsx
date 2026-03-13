"use client";

import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function PaybackButton() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={toggleLanguage}
        className="h-12 px-5 rounded-full bg-white shadow-lg border border-border hover:bg-gray-50 text-foreground gap-2"
        variant="outline"
      >
        <div className="w-8 h-8 rounded-full bg-[#2d9d78] flex items-center justify-center">
          <Globe className="w-4 h-4 text-white" />
        </div>
        <span className="font-medium">{language === "ko" ? "한국어" : "English"}</span>
      </Button>
    </div>
  );
}
