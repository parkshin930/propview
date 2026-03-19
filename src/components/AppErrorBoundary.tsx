"use client";

import type { ReactNode } from "react";
import React from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error?: unknown;
};

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    // Keep log minimal but visible; do not crash whole app.
    console.error("[AppErrorBoundary] caught error:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-[40vh] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-foreground">화면을 불러오지 못했습니다.</p>
          <p className="mt-2 text-xs text-muted-foreground">
            잠시 후 다시 시도해주세요. 문제가 계속되면 새로고침으로 해결될 수 있습니다.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-[#52c68f] px-4 text-sm font-semibold text-white hover:bg-[#45b07d]"
            onClick={() => window.location.reload()}
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }
}

