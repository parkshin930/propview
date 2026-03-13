"use client";

export function TickerBar() {
  return (
    <div className="w-full border-b border-gray-200 bg-gray-50/80 py-0.5 dark:border-[#1f2937] dark:bg-[#111827]">
      <div className="container mx-auto flex max-w-screen-xl flex-wrap items-center justify-center gap-x-6 gap-y-0.5 px-4 py-0.5 text-sm">
        <span className="font-medium text-foreground dark:text-gray-100">BTC:</span>
        <span className="text-foreground dark:text-gray-100">$71,972.37</span>
        <span className="flex items-center gap-0.5 font-medium text-green-500 dark:text-up">
          <span aria-hidden>▲</span> 2.09%
        </span>

        <span className="ml-1 border-l border-gray-200 pl-4 font-medium text-foreground dark:border-gray-700 dark:text-gray-100">ETH:</span>
        <span className="text-foreground dark:text-gray-100">$2,136.14</span>
        <span className="flex items-center gap-0.5 font-medium text-green-500 dark:text-up">
          <span aria-hidden>▲</span> 3.04%
        </span>

        <span className="ml-1 border-l border-gray-200 pl-4 font-medium text-foreground dark:border-gray-700 dark:text-gray-100">김프:</span>
        <span className="flex items-center gap-0.5 font-medium text-red-500 dark:text-down">
          <span aria-hidden>▼</span> -1.99%
        </span>

        <span className="ml-1 border-l border-gray-200 pl-4 font-medium text-foreground dark:border-gray-700 dark:text-gray-100">BTC 도미넌스:</span>
        <span className="text-foreground dark:text-gray-100">58.81%</span>
      </div>
    </div>
  );
}
