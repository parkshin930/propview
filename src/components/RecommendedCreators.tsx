"use client";

const CREATORS = [
  {
    name: "비트신",
    subtitle: "구독자 9.59천명",
    description: "암호화폐·선물 트레이딩 인사이트",
    channelUrl: "https://www.youtube.com/@BITSHIN1",
    avatar: "/avatars/bitshin-logo.png",
  },
  {
    name: "개돼지기법",
    subtitle: "구독자 8.47만명",
    description: "실전 매매 기법과 마인드 공유",
    channelUrl: "https://www.youtube.com/@Mr_anything",
    avatar: "/avatars/gaedwaeji-logo.png",
  },
];

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function RecommendedCreators() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm dark:border-[#1f2937] dark:bg-[#111827] w-full">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded text-red-600 dark:text-red-400" aria-hidden>
          <YoutubeIcon className="h-6 w-6" />
        </span>
        <h2 className="text-base font-semibold text-foreground dark:text-gray-100">
          추천 크리에이터
        </h2>
      </div>
      <ul className="space-y-4">
        {CREATORS.map((creator, i) => (
          <li
            key={i}
            className="rounded-xl border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50"
          >
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
                {creator.avatar ? (
                  <img
                    src={creator.avatar}
                    alt={`${creator.name} 로고`}
                    className="h-full w-full scale-[1.18] object-cover object-center"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm font-semibold" aria-hidden>
                    {creator.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground dark:text-gray-100">{creator.name}</p>
                {creator.subtitle && (
                  <p className="mt-0.5 text-xs text-muted-foreground dark:text-gray-400">
                    {creator.subtitle}
                  </p>
                )}
                {creator.description && (
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed dark:text-gray-400">
                    {creator.description}
                  </p>
                )}
                <a
                  href={creator.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700"
                >
                  <YoutubeIcon className="h-3.5 w-3.5" />
                  구독
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
