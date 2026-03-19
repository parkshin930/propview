import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { ClientIntlProvider } from "@/contexts/LocaleSwitchContext";
import { SyncLocaleFromStorage } from "@/components/SyncLocaleFromStorage";
import { COOKIE_LOCALE_KEY } from "@/i18n/config";
import { getValidLocale, getMessages } from "@/lib/get-messages";

export const metadata: Metadata = {
  title: "프랍 트레이딩의 새로운 기준, PropView",
  description: "비트코인, 블록체인 등 암호화폐 투자 뉴스를 가장 빠르고 정확하게 제공하는 커뮤니티 플랫폼",
  icons: { icon: "/favicon.png" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = getValidLocale(cookieStore.get(COOKIE_LOCALE_KEY)?.value);
  const messages = getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning className="dark">
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.remove('dark');else document.documentElement.classList.add('dark');})();`,
          }}
        />
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <ClientIntlProvider initialLocale={locale} initialMessages={messages}>
                <SyncLocaleFromStorage />
                {children}
              </ClientIntlProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
