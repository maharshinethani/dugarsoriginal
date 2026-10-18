'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 py-4 text-xs">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3 w-3 text-secondary-text/30 rtl:rotate-180" />}
          {item.href ? (
            <Link
              href={item.href}
              className="text-secondary-text/70 transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-heading">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
