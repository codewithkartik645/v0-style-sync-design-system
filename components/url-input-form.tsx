'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

export function UrlInputForm() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze website');
      }

      router.push(`/dashboard/${data.siteId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex flex-col gap-4">
        <div className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
              <GlobeIcon className="size-5 text-muted-foreground" />
            </div>
            <Input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter any website URL..."
              className="h-14 pl-12 pr-4 text-base"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !url.trim()}
            className="h-14 px-8"
          >
            {isLoading ? (
              <>
                <Spinner className="size-4" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <ArrowRightIcon className="size-4" />
                <span>Extract Tokens</span>
              </>
            )}
          </Button>
        </div>
        
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircleIcon className="size-4" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Try:</span>
          <button
            type="button"
            onClick={() => setUrl('vercel.com')}
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            vercel.com
          </button>
          <span>or</span>
          <button
            type="button"
            onClick={() => setUrl('linear.app')}
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            linear.app
          </button>
          <span>or</span>
          <button
            type="button"
            onClick={() => setUrl('stripe.com')}
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            stripe.com
          </button>
        </div>
      </div>
    </form>
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

function AlertCircleIcon({ className }: { className?: string }) {
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
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}
