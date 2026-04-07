'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import type { ScrapedSite, DesignTokens, ColorToken, TypographyToken, SpacingToken } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ColorTokenCard } from '@/components/token-editors/color-token-card';
import { TypographyTokenCard } from '@/components/token-editors/typography-token-card';
import { SpacingTokenCard } from '@/components/token-editors/spacing-token-card';
import { ComponentPreview } from '@/components/component-preview';
import { ExportDialog } from '@/components/export-dialog';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Props {
  initialSite: ScrapedSite;
  initialTokens: DesignTokens | null;
}

// Helper to flatten color tokens from JSONB structure
function flattenColorTokens(colors: DesignTokens['colors'] | undefined, lockedPaths: Set<string>) {
  if (!colors) return [];
  const result: Array<{ path: string; category: string; token: ColorToken; isLocked: boolean }> = [];
  
  for (const [category, tokens] of Object.entries(colors)) {
    if (Array.isArray(tokens)) {
      tokens.forEach((token, index) => {
        const path = `colors.${category}.${index}`;
        result.push({
          path,
          category,
          token,
          isLocked: lockedPaths.has(path),
        });
      });
    }
  }
  return result;
}

// Helper to flatten typography tokens
function flattenTypographyTokens(typography: DesignTokens['typography'] | undefined, lockedPaths: Set<string>) {
  if (!typography) return [];
  const result: Array<{ path: string; category: string; token: TypographyToken; isLocked: boolean }> = [];
  
  for (const [category, tokens] of Object.entries(typography)) {
    if (Array.isArray(tokens)) {
      tokens.forEach((token, index) => {
        const path = `typography.${category}.${index}`;
        result.push({
          path,
          category,
          token,
          isLocked: lockedPaths.has(path),
        });
      });
    }
  }
  return result;
}

// Helper to flatten spacing tokens
function flattenSpacingTokens(spacing: DesignTokens['spacing'] | undefined, lockedPaths: Set<string>) {
  if (!spacing?.values) return [];
  return spacing.values.map((token, index) => {
    const path = `spacing.values.${index}`;
    return {
      path,
      token,
      isLocked: lockedPaths.has(path),
    };
  });
}

export function DashboardClient({ initialSite, initialTokens }: Props) {
  const [activeTab, setActiveTab] = useState<'tokens' | 'preview'>('tokens');
  const [activeCategory, setActiveCategory] = useState<'all' | 'color' | 'typography' | 'spacing'>('all');
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  const { data, mutate } = useSWR<{ site: ScrapedSite; tokens: DesignTokens | null; lockedTokens?: string[] }>(
    `/api/sites/${initialSite.id}`,
    fetcher,
    { fallbackData: { site: initialSite, tokens: initialTokens, lockedTokens: [] } }
  );
  
  const site = data?.site || initialSite;
  const tokens = data?.tokens || initialTokens;
  const lockedPaths = useMemo(() => new Set(data?.lockedTokens || []), [data?.lockedTokens]);
  
  // Flatten tokens for display
  const colorTokens = useMemo(
    () => flattenColorTokens(tokens?.colors, lockedPaths),
    [tokens?.colors, lockedPaths]
  );
  
  const typographyTokens = useMemo(
    () => flattenTypographyTokens(tokens?.typography, lockedPaths),
    [tokens?.typography, lockedPaths]
  );
  
  const spacingTokens = useMemo(
    () => flattenSpacingTokens(tokens?.spacing, lockedPaths),
    [tokens?.spacing, lockedPaths]
  );
  
  const totalTokens = colorTokens.length + typographyTokens.length + spacingTokens.length;
  
  // Generate CSS variables for preview
  const cssVariables = useMemo(() => {
    const vars: Record<string, string> = {};
    
    // Color variables
    colorTokens.forEach(({ path, token }) => {
      const name = path.replace(/\./g, '-');
      vars[`--extracted-${name}`] = token.value;
    });
    
    // Typography variables
    typographyTokens.forEach(({ path, token }) => {
      const name = path.replace(/\./g, '-');
      vars[`--extracted-${name}-family`] = token.fontFamily;
      vars[`--extracted-${name}-size`] = token.fontSize;
      vars[`--extracted-${name}-weight`] = String(token.fontWeight);
      vars[`--extracted-${name}-line-height`] = token.lineHeight;
    });
    
    // Spacing variables
    spacingTokens.forEach(({ path, token }) => {
      const name = path.replace(/\./g, '-');
      vars[`--extracted-${name}`] = token.value;
    });
    
    return vars;
  }, [colorTokens, typographyTokens, spacingTokens]);
  
  async function handleTokenUpdate(tokenPath: string, value: string) {
    await fetch(`/api/tokens/${initialSite.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenPath, value }),
    });
    mutate();
  }
  
  async function handleToggleLock(tokenPath: string, isLocked: boolean, value: string) {
    if (isLocked) {
      await fetch(`/api/tokens/${initialSite.id}/lock`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenPath }),
      });
    } else {
      await fetch(`/api/tokens/${initialSite.id}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenPath, value }),
      });
    }
    mutate();
  }

  if (!tokens) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No tokens found</h2>
          <p className="mt-2 text-muted-foreground">This site hasn&apos;t been analyzed yet.</p>
          <Link href="/" className="mt-4 inline-block text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={cssVariables as React.CSSProperties}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-auto min-h-16 max-w-7xl flex-col gap-3 px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeftIcon className="size-4" />
              <span className="sr-only sm:not-sr-only text-sm">Back</span>
            </Link>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-semibold">{site.title || site.domain}</h1>
              <p className="truncate text-xs text-muted-foreground">{site.url}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-1 rounded-lg border border-border p-1 sm:flex-none">
              <button
                onClick={() => setActiveTab('tokens')}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none sm:px-4 ${
                  activeTab === 'tokens'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tokens
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none sm:px-4 ${
                  activeTab === 'preview'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Preview
              </button>
            </div>
            
            <Button onClick={() => setIsExportOpen(true)} size="sm" className="sm:size-default">
              <ExportIcon className="size-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
      </header>
      
      {activeTab === 'tokens' ? (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {/* Category Filter */}
          <div className="mb-6 -mx-4 px-4 overflow-x-auto sm:mx-0 sm:px-0 sm:mb-8">
            <div className="flex items-center gap-2 min-w-max pb-2 sm:pb-0">
            <CategoryPill
              label="All"
              count={totalTokens}
              isActive={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
            />
            <CategoryPill
              label="Colors"
              count={colorTokens.length}
              isActive={activeCategory === 'color'}
              onClick={() => setActiveCategory('color')}
            />
            <CategoryPill
              label="Typography"
              count={typographyTokens.length}
              isActive={activeCategory === 'typography'}
              onClick={() => setActiveCategory('typography')}
            />
            <CategoryPill
              label="Spacing"
              count={spacingTokens.length}
              isActive={activeCategory === 'spacing'}
              onClick={() => setActiveCategory('spacing')}
            />
            </div>
          </div>
          
          {/* Token Grid */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(activeCategory === 'all' || activeCategory === 'color') &&
              colorTokens.map(({ path, category, token, isLocked }) => (
                <ColorTokenCard
                  key={path}
                  tokenPath={path}
                  category={category}
                  token={token}
                  isLocked={isLocked}
                  onUpdate={(value) => handleTokenUpdate(path, value)}
                  onToggleLock={() => handleToggleLock(path, isLocked, token.value)}
                />
              ))}
            
            {(activeCategory === 'all' || activeCategory === 'typography') &&
              typographyTokens.map(({ path, category, token, isLocked }) => (
                <TypographyTokenCard
                  key={path}
                  tokenPath={path}
                  category={category}
                  token={token}
                  isLocked={isLocked}
                  onUpdate={(value) => handleTokenUpdate(path, value)}
                  onToggleLock={() => handleToggleLock(path, isLocked, token.fontFamily)}
                />
              ))}
            
            {(activeCategory === 'all' || activeCategory === 'spacing') &&
              spacingTokens.map(({ path, token, isLocked }) => (
                <SpacingTokenCard
                  key={path}
                  tokenPath={path}
                  token={token}
                  isLocked={isLocked}
                  onUpdate={(value) => handleTokenUpdate(path, value)}
                  onToggleLock={() => handleToggleLock(path, isLocked, token.value)}
                />
              ))}
          </div>
          
          {totalTokens === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">No tokens extracted yet.</p>
            </div>
          )}
        </div>
      ) : (
        <ComponentPreview tokens={tokens} />
      )}
      
      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        siteId={site.id}
        siteDomain={site.domain}
      />
    </div>
  );
}

function CategoryPill({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
      }`}
    >
      <span>{label}</span>
      <span className={`rounded-full px-2 py-0.5 text-xs ${
        isActive ? 'bg-primary-foreground/20' : 'bg-background'
      }`}>
        {count}
      </span>
    </button>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
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
