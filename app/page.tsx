import { UrlInputForm } from '@/components/url-input-form';
import { RecentSites } from '@/components/recent-sites';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
        </div>
        
        {/* Logo/Brand */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <StyleSyncLogo className="size-7" />
          </div>
          <span className="text-2xl font-semibold tracking-tight">StyleSync</span>
        </div>
        
        {/* Headline */}
        <h1 className="mb-4 max-w-3xl text-center text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
          Extract design tokens from any website
        </h1>
        
        {/* Subheadline */}
        <p className="mb-10 max-w-2xl text-center text-lg text-muted-foreground text-balance md:text-xl">
          Transform any website into a design system. Get colors, typography, and spacing tokens in seconds.
        </p>
        
        {/* URL Input Form */}
        <UrlInputForm />
      </section>
      
      {/* Features Section */}
      <section className="border-t border-border bg-muted/30 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Everything you need to build consistent UIs
          </h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<PaletteIcon className="size-6" />}
              title="Color Extraction"
              description="Automatically identify primary, secondary, and accent colors with semantic naming and contrast ratios."
            />
            <FeatureCard
              icon={<TypeIcon className="size-6" />}
              title="Typography Analysis"
              description="Extract font families, sizes, weights, and line heights for headings, body, and monospace text."
            />
            <FeatureCard
              icon={<SpacingIcon className="size-6" />}
              title="Spacing Scale"
              description="Discover consistent spacing values and generate a harmonious spacing scale for your layouts."
            />
            <FeatureCard
              icon={<LockIcon className="size-6" />}
              title="Lock & Protect"
              description="Lock important tokens to prevent accidental changes during re-scrapes or edits."
            />
            <FeatureCard
              icon={<HistoryIcon className="size-6" />}
              title="Version History"
              description="Track all changes with full version history. Revert to any previous state with one click."
            />
            <FeatureCard
              icon={<ExportIcon className="size-6" />}
              title="Export Anywhere"
              description="Export to CSS variables, JSON tokens, or Tailwind config. Ready for any project."
            />
          </div>
        </div>
      </section>
      
      {/* Recent Sites Section */}
      <section className="border-t border-border px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Recently Analyzed
          </h2>
          <RecentSites />
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <StyleSyncLogo className="size-4" />
            <span>StyleSync</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Next.js and Neon
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/20 hover:bg-card/80">
      <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StyleSyncLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="m4.93 4.93 2.83 2.83" />
      <path d="m16.24 16.24 2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="m4.93 19.07 2.83-2.83" />
      <path d="m16.24 7.76 2.83-2.83" />
    </svg>
  );
}

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function TypeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" x2="15" y1="20" y2="20" />
      <line x1="12" x2="12" y1="4" y2="20" />
    </svg>
  );
}

function SpacingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function ExportIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
