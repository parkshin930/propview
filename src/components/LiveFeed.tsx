"use client";

import { NewsCard } from "./NewsCard";
import type { NewsItem } from "@/types/news";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

const sampleNews: NewsItem[] = [
  {
    id: "1",
    timestamp: "17:34",
    title: "BTC volatility driver shifting from macro to geopolitical risk, says analyst",
    description:
      "The primary driver of Bitcoin's price volatility is shifting from macroeconomic indicators to geopolitical variables amid rising tensions in the Middle East, according to a new analysis. DL News reported that James Butterfill, Head of Research at CoinShares, said the influence of traditional macro data such as interest rate outlooks and employment figures has weakened, while geopolitical risk has emerged as a new key variable.",
    tag: {
      name: "BTC",
      icon: "https://ext.same-assets.com/2233031264/369368678.webp",
      color: "#f7931a",
    },
    metrics: { views: 10, bookmarks: 5, comments: 0 },
    hasQuickOrder: true,
  },
  {
    id: "2",
    timestamp: "17:13",
    title: "Iranian security chief says war 'will not end soon'",
    description:
      "An Iranian security chief has stated that the ongoing war will not end soon, Walter Bloomberg reported. The comment follows an earlier statement from U.S. President Donald Trump, who said the war with Iran would be over shortly and that he could end it at any time if he chose to do so.",
    metrics: { views: 12, bookmarks: 12, comments: 0 },
  },
  {
    id: "3",
    timestamp: "16:53",
    title: "ETH could fall to $1.5K if bear market persists, says analyst",
    description:
      "The price of ETH could fall to $1,500 in the second half of this year if the cryptocurrency bear market continues, according to on-chain analytics firm CryptoQuant. The firm explained that while Ethereum's daily active addresses recently hit an all-time high, surpassing 2021 bull market levels, the price of ETH has dropped more than 50% from its cycle peak.",
    tag: {
      name: "ETH",
      icon: "https://ext.same-assets.com/2233031264/1193813634.svg",
      color: "#627eea",
    },
    metrics: { views: 120, bookmarks: 24, comments: 0 },
    hasQuickOrder: true,
  },
  {
    id: "4",
    timestamp: "16:49",
    title: "US Fed to release proposal on Basel's 1250% crypto risk weight next week",
    description:
      "The U.S. Federal Reserve is expected to release a public proposal next week on how to apply the Basel III Accord's 1250% risk weight rule to American banks. Conor Brown, managing director of the Bitcoin Policy Institute (BPI), noted on X that under the current Basel framework, Bitcoin is classified as a harmful asset and is subject to an exceptionally high 1250% risk weight.",
    metrics: { views: 80, bookmarks: 59, comments: 0 },
  },
  {
    id: "5",
    timestamp: "16:45",
    title: "Sui integrates OpenZeppelin to bolster smart contract infrastructure",
    description:
      "Sui announced on X that OpenZeppelin, an industry-standard smart contract library, has been integrated into the Sui ecosystem. OpenZeppelin will provide verified DeFi math primitives and access control features to the Move language-based environment.",
    tag: {
      name: "SUI",
      icon: "https://ext.same-assets.com/2233031264/1196828301.svg",
      color: "#52c68f",
    },
    metrics: { views: 123, bookmarks: 15, comments: 0 },
    hasQuickOrder: true,
  },
  {
    id: "6",
    timestamp: "16:34",
    title: "US Senate passes housing bill with provision to ban CBDC",
    description:
      "The U.S. Senate has passed a housing-related bill with an overwhelming majority that includes a provision to ban the issuance of a central bank digital currency (CBDC), CoinDesk reported. However, the bill's passage in the House of Representatives remains uncertain.",
    metrics: { views: 136, bookmarks: 15, comments: 0 },
  },
  {
    id: "7",
    timestamp: "14:18",
    title: "250 million USDC minted",
    description: "Whale Alert reported that 250 million USDC has been minted at the USDC Treasury.",
    isHighlighted: true,
    metrics: { views: 140, bookmarks: 17, comments: 1 },
  },
  {
    id: "8",
    timestamp: "14:04",
    title: "Grayscale deposits $20.9M in BTC to Coinbase Prime",
    description:
      "Grayscale has deposited 296 BTC, worth $20.86 million, to Coinbase Prime via its Grayscale Bitcoin Trust (GBTC), according to Arkham.",
    tag: {
      name: "BTC",
      icon: "https://ext.same-assets.com/2233031264/369368678.webp",
      color: "#f7931a",
    },
    metrics: { views: 221, bookmarks: 62, comments: 0 },
    hasQuickOrder: true,
  },
  {
    id: "9",
    timestamp: "13:46",
    title: "Yield-bearing stablecoin protocol Unitas raises $13.3M",
    description:
      "Unitas, a yield-bearing stablecoin protocol, announced it has completed a $13.33 million (approx. 17.5 billion won) seed funding round. The round included participation from Amber Group, Blockchain Builders Fund, Taisu Ventures, Bixin Ventures, and SevenX Ventures.",
    metrics: { views: 154, bookmarks: 21, comments: 0 },
  },
  {
    id: "10",
    timestamp: "13:31",
    title: "US stocks open lower",
    description:
      "The three major U.S. stock indices opened lower today.\n- S&P 500: -0.79%\n- Nasdaq: -0.89%\n- Dow Jones: -0.99%",
    metrics: { views: 114, bookmarks: 180, comments: 0 },
  },
];

export function LiveFeed() {
  const t = useTranslations("common");
  const today = "Thursday, March 12, 2026";

  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Title */}
      <h1 className="text-3xl font-bold text-foreground mb-6">{t("title")}</h1>

      {/* Date */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
        <Calendar className="w-5 h-5 text-[#52c68f]" />
        <span className="text-sm text-muted-foreground">{t("today")}, {today}</span>
      </div>

      {/* News Items */}
      <div className="space-y-0">
        {sampleNews.map((item, index) => (
          <div key={item.id} className="relative">
            <NewsCard item={item} />
            {index === sampleNews.length - 1 && (
              <div className="absolute left-[55px] bottom-0 w-px h-8 bg-gradient-to-b from-border to-transparent" />
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-8 flex justify-center">
        <Button
          variant="outline"
          className="w-full max-w-md h-12 text-muted-foreground hover:text-foreground border-border"
        >
          {t("more")}
        </Button>
      </div>
    </section>
  );
}
