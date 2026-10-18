'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mx-auto max-w-md">
        <p className="font-serif text-6xl font-light tracking-[0.1em] text-gold sm:text-7xl">500</p>
        <div className="mx-auto my-6 h-px w-16 bg-gold/40" />
        <h1 className="font-serif text-2xl font-light text-body sm:text-3xl">
          Something Went Wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-secondary-text/60">
          An unexpected error occurred. Please try again, or return to the homepage.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="border border-gold/40 px-8 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold hover:text-soft-black"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-8 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-secondary-text/70 transition-colors hover:text-body"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
