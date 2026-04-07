'use client';

import useSWR from 'swr';
import Link from 'next/link';
import type { ScrapedSite } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function RecentSites() {
  const { data, isLoading, error } = useSWR<{ sites: ScrapedSite[] }>(
    '/api/sites',
    fetcher
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SiteSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error || !data?.sites?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <GlobeIcon className="size-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">
          No sites analyzed yet. Enter a URL above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.sites.map((site) => (
        <SiteCard key={site.id} site={site} />
      ))}
    </div>
  );
}

function SiteCard({ site }: { site: ScrapedSite }) {
  return (
    <Link
      href={`/dashboard/${site.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-md"
    >
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {site.favicon_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={site.favicon_url}
            alt=""
            className="size-8 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <GlobeIcon className={`size-6 text-muted-foreground ${site.favicon_url ? 'hidden' : ''}`} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium group-hover:text-primary transition-colors">
          {site.title || site.domain}
        </h3>
        <p className="truncate text-sm text-muted-foreground">{site.domain}</p>
      </div>
      <ArrowRightIcon className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

function SiteSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <div className="size-12 shrink-0 animate-pulse rounded-lg bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
