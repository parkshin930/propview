"use client";

import { useTranslations } from "next-intl";

const EMAIL = "freefeel0701@gmail.com";

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("lastUpdated")}</p>

        <p className="mb-4">{t("intro")}</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s1Title")}</h2>
        <p className="mb-4">{t("s1Intro")}</p>
        <p className="font-semibold mb-2">{t("s1Provide")}</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>{t("s1Reg")}</li>
          <li>{t("s1Inq")}</li>
        </ul>
        <p className="font-semibold mb-2">{t("s1Auto")}</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>{t("s1Tech")}</li>
          <li>{t("s1Local")}</li>
        </ul>
        <p className="font-semibold mb-2">{t("s1Third")}</p>
        <p className="mb-4">{t("s1ThirdP")}</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s2Title")}</h2>
        <p className="mb-4">{t("s2Intro")}</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>{t("s2_1")}</li>
          <li>{t("s2_2")}</li>
          <li>{t("s2_3")}</li>
          <li>{t("s2_4")}</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s3Title")}</h2>
        <p className="mb-4">{t("s3Intro")}</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>{t("s3_1")}</li>
          <li>{t("s3_2")}</li>
          <li>{t("s3_3")}</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s4Title")}</h2>
        <p className="mb-4">{t("s4Intro")}</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>{t("s4_1")}</li>
          <li>{t("s4_2")}</li>
          <li>{t("s4_3")}</li>
        </ul>
        <p className="mb-4">
          {t("s4Contact")}{" "}
          <a href={`mailto:${EMAIL}`} className="text-primary underline">
            {EMAIL}
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s5Title")}</h2>
        <p className="mb-4">{t("s5")}</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s6Title")}</h2>
        <p className="mb-4">{t("s6")}</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s7Title")}</h2>
        <p className="mb-2">{t("s7Intro")}</p>
        <p className="mb-1">
          {t("email")}{" "}
          <a href={`mailto:${EMAIL}`} className="text-primary underline">
            {EMAIL}
          </a>
        </p>
      </div>
    </main>
  );
}
