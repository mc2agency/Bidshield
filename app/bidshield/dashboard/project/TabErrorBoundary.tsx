"use client";

import React from "react";

interface Props {
  tabLabel?: string;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
  retryKey: number; // P1-3: incremented on retry to force full re-mount
}

export default class TabErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "", retryKey: 0 };
  }

  static getDerivedStateFromError(error: unknown): Partial<State> {
    const msg = error instanceof Error ? error.message : String(error);
    return { hasError: true, errorMessage: msg };
  }

  handleRetry = () => {
    // P1-3: Increment retryKey to force React to unmount and re-mount the
    // child tree. This ensures Convex useQuery() hooks re-subscribe and
    // fresh data is fetched, rather than just clearing the error visually.
    this.setState((prev) => ({
      hasError: false,
      errorMessage: "",
      retryKey: prev.retryKey + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      const label = this.props.tabLabel ?? "this section";
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            Something went wrong in {label}
          </h3>
          <p className="text-sm text-slate-500 mb-5 max-w-sm">
            An unexpected error occurred. Your data is safe — try reloading the section.
          </p>
          {this.state.errorMessage && (
            <p className="text-xs text-slate-400 font-mono mb-5 bg-slate-50 border border-slate-200 rounded px-3 py-2 max-w-sm break-all">
              {this.state.errorMessage}
            </p>
          )}
          <button
            onClick={this.handleRetry}
            className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    // Key rotation forces a full unmount/remount on retry
    return <React.Fragment key={this.state.retryKey}>{this.props.children}</React.Fragment>;
  }
}
