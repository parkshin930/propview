"use client";

import { useTranslations } from "next-intl";

const EMAIL = "freefeel0701@gmail.com";

export default function TermsPage() {
  const t = useTranslations("terms");

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("lastUpdated")}</p>

        <p className="mb-4">{t("intro1")}</p>
        <p className="mb-4">{t("intro2")}</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s1Title")}</h2>
        <p className="mb-4">{t("s1_1")}</p>
        <p className="mb-4">{t("s1_2")}</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s2Title")}</h2>
        <p className="mb-4">{t("s2_1")}</p>
        <p className="mb-4">{t("s2_2")}</p>
        <p className="mb-4">{t("s2_3")}</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s3Title")}</h2>
        <p className="mb-3 font-semibold">{t("s3_1")}</p>
        <p className="mb-3 font-semibold">{t("s3_2")}</p>
        <p className="mb-4 font-semibold">{t("s3_3")}</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s4Title")}</h2>
        <p className="mb-4">{t("s4Intro")}</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>{t("s4_1")}</li>
          <li>{t("s4_2")}</li>
          <li>{t("s4_3")}</li>
          <li>{t("s4_4")}</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s5Title")}</h2>
        <p className="mb-4">{t("s5")}</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s6Title")}</h2>
        <p className="mb-4">{t("s6_1")}</p>
        <p className="mb-4">{t("s6_2")}</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s7Title")}</h2>
        <p className="mb-4">{t("s7")}</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s8Title")}</h2>
        <p className="mb-2">{t("s8Intro")}</p>
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
