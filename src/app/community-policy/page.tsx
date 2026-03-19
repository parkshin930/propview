"use client";

import { useTranslations } from "next-intl";

const EMAIL = "freefeel0701@gmail.com";

export default function CommunityPolicyPage() {
  const t = useTranslations("communityPolicy");

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
        <p className="mb-6">{t("intro")}</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s1Title")}</h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>{t("s1_1")}</li>
          <li>{t("s1_2")}</li>
          <li>{t("s1_3")}</li>
          <li>{t("s1_4")}</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s2Title")}</h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>{t("s2_1")}</li>
          <li>{t("s2_2")}</li>
          <li>{t("s2_3")}</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s3Title")}</h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>{t("s3_1")}</li>
          <li>{t("s3_2")}</li>
        </ul>
        <ul className="list-none pl-0 mb-4 space-y-2 text-sm text-muted-foreground">
          <li>{t("s3Level_1")}</li>
          <li>{t("s3Level_2")}</li>
          <li>{t("s3Level_3")}</li>
          <li>{t("s3Level_4")}</li>
          <li>{t("s3Level_5")}</li>
        </ul>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>{t("s3_3")}</li>
          <li>{t("s3_4")}</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s4Title")}</h2>
        <p className="mb-2">{t("s4Intro")}</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>{t("s4_1")}</li>
          <li>{t("s4_2")}</li>
          <li>{t("s4_3")}</li>
          <li>{t("s4_4")}</li>
          <li>{t("s4_5")}</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s5Title")}</h2>
        <h3 className="text-sm font-semibold mt-4 mb-2 text-foreground">{t("s5BenefitTitle")}</h3>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>{t("s5Benefit1")}</li>
          <li>{t("s5Benefit2")}</li>
        </ul>
        <h3 className="text-sm font-semibold mt-4 mb-2 text-foreground">{t("s5MethodTitle")}</h3>
        <p className="mb-4">{t("s5Method")}</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">{t("s6Title")}</h2>
        <p className="mb-1">
          {t("s6")}{" "}
          <a href={`mailto:${EMAIL}`} className="text-primary underline">
            {EMAIL}
          </a>
        </p>
      </div>
    </main>
  );
}
