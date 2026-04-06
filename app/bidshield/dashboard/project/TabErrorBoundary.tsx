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
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--bs-amber-dim)" }}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--bs-amber)"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
          </div>
          <h3 className="text-base font-medium mb-1" style={{ color: "var(--bs-text-primary)" }}>
            Something went wrong in {label}
          </h3>
          <p className="text-sm mb-5 max-w-sm" style={{ color: "var(--bs-text-muted)" }}>
            An unexpected error occurred. Your data is safe — try reloading the section.
          </p>
          {this.state.errorMessage && (
            <p className="text-xs font-mono mb-5 rounded px-3 py-2 max-w-sm break-all" style={{ color: "var(--bs-text-dim)", background: "var(--bs-bg-elevated)", border: "1px solid var(--bs-border)" }}>
              {this.state.errorMessage}
            </p>
          )}
          <button
            onClick={this.handleRetry}
            className="px-5 py-2 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            style={{ background: "var(--bs-teal)", color: "#13151a" }}
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
