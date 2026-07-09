"use client";

import { Component, ReactNode } from "react";
import { motion } from "framer-motion";
import { RotateCcw, AlertTriangle } from "lucide-react";

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("VELTRA Error Boundary:", error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleHardReset = () => {
    localStorage.removeItem("veltra-demo-store");
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 veltra-ambient">
          <motion.div
            className="relative w-full max-w-md"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="veltra-glass rounded-2xl p-8 veltra-shadow-lg text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <h2 className="text-title text-foreground font-semibold mb-2">
                <span className="text-editorial-italic text-muted-foreground">Something</span> broke.
              </h2>
              <p className="text-caption text-muted-foreground mb-6 leading-relaxed">
                The page hit an unexpected error. Your data is safe. Try reloading — or reset the demo if it persists.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mb-4 p-3 rounded-md bg-red-500/5 border border-red-500/15 text-left">
                  <summary className="text-micro text-red-300 cursor-pointer normal-case tracking-normal">
                    Error details
                  </summary>
                  <pre className="mt-2 text-micro text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                    {this.state.error.message}
                    {this.state.error.stack && "\n\n" + this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-veltra-emerald hover:bg-veltra-emerald-dark text-white text-caption font-medium veltra-transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Try again
                </button>
                <button
                  onClick={this.handleHardReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border/40 bg-foreground/[0.04] text-foreground text-caption font-medium hover:bg-foreground/[0.08] veltra-transition"
                >
                  Reset demo
                </button>
              </div>
            </div>

            <p className="text-center mt-6 text-editorial-italic text-muted-foreground/50 text-sm">
              Technology disappears. Care remains.
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
