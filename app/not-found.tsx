import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mx-auto max-w-md">
        <p className="font-serif text-7xl font-light tracking-[0.1em] text-gold sm:text-8xl">404</p>
        <div className="mx-auto my-6 h-px w-16 bg-gold/40" />
        <h1 className="font-serif text-2xl font-light text-body sm:text-3xl">
          Page Not Found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-secondary-text/60">
          The page you are looking for may have been moved or no longer exists.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="border border-gold/40 px-8 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold hover:text-soft-black"
          >
            Return Home
          </Link>
          <Link
            href="/jewellery"
            className="px-8 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-secondary-text/70 transition-colors hover:text-body"
          >
            Explore Jewellery
          </Link>
        </div>
      </div>
    </div>
  );
}
