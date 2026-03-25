"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-destructive/10 border-2 border-destructive p-8 max-w-lg neo-shadow-sm">
        <AlertCircle size={48} className="text-destructive mx-auto mb-6" />
        <h2 className="text-[24px] font-serif font-bold italic mb-4 text-destructive">Something went wrong!</h2>
        <p className="text-foreground/70 mb-8 max-w-sm mx-auto text-[14px]">
          We encountered an unexpected error while loading this page. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-card border-2 border-border font-bold text-[12px] uppercase tracking-widest hover:bg-muted transition-colors neo-shadow-sm flex items-center gap-2 mx-auto"
        >
          <RefreshCcw size={16} /> TRY AGAIN
        </button>
      </div>
    </div>
  );
}
