'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import type { ScrapedSite, DesignToken } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ColorTokenCard } from '@/components/token-editors/color-token-card';
import { TypographyTokenCard } from '@/components/token-editors/typography-token-card';
import { SpacingTokenCard } from '@/components/token-editors/spacing-token-card';
import { ComponentPreview } from '@/components/component-preview';
import { ExportDialog } from '@/components/export-dialog';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Props {
  initialSite: ScrapedSite;
  initialTokens: DesignToken[];
}

export function DashboardClient({ initialSite, initialTokens }: Props) {
  const [activeTab, setActiveTab] = useState<'tokens' | 'preview'>('tokens');
  const [activeCategory, setActiveCategory] = useState<'all' | 'color' | 'typography' | 'spacing'>('all');
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  const { data, mutate } = useSWR<{ site: ScrapedSite; tokens: DesignToken[] }>(
    `/api/sites/${initialSite.id}`,
    fetcher,
    { fallbackData: { site: initialSite, tokens: initialTokens } }
  );
  
  const site = data?.site || initialSite;
  const tokens = data?.tokens || initialTokens;
  
  const colorTokens = useMemo(() => tokens.filter(t => t.category === 'color'), [tokens]);
  const typographyTokens = useMemo(() => tokens.filter(t => t.category === 'typography'), [tokens]);
  const spacingTokens = useMemo(() => tokens.filter(t => t.category === 'spacing'), [tokens]);
  
  const filteredTokens = useMemo(() => {
    if (activeCategory === 'all') return tokens;
    return tokens.filter(t => t.category === activeCategory);
  }, [tokens, activeCategory]);
  
  // Generate CSS variables for preview
  const cssVariables = useMemo(() => {
    const vars: Record<string, string> = {};
    for (const token of tokens) {
      vars[`--extracted-${token.name}`] = token.value;
      if (token.category === 'typography' && token.metadata) {
        if (token.metadata.font_size) vars[`--extracted-${token.name}-size`] = token.metadata.font_size;
        if (token.metadata.font_weight) vars[`--extracted-${token.name}-weight`] = String(token.metadata.font_weight);
        if (token.metadata.line_height) vars[`--extracted-${token.name}-line-height`] = token.metadata.line_height;
      }
    }
    return vars;
  }, [tokens]);
  
  async function handleTokenUpdate(tokenId: string, value: string, metadata?: Record<string, unknown>) {
    await fetch(`/api/tokens/${tokenId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, metadata }),
    });
    mutate();
  }
  
  async function handleToggleLock(tokenId: string, isLocked: boolean) {
    if (isLocked) {
      await fetch(`/api/tokens/${tokenId}/lock`, { method: 'DELETE' });
    } else {
      await fetch(`/api/tokens/${tokenId}/lock`, { method: 'POST' });
    }
    mutate();
  }

  return (
    <div className="min-h-screen bg-background" style={cssVariables as React.CSSProperties}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeftIcon className="size-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              {site.favicon_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={site.favicon_url} alt="" className="size-6 rounded" />
              )}
              <div>
                <h1 className="font-semibold">{site.title || site.domain}</h1>
                <p className="text-xs text-muted-foreground">{site.url}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg border border-border p-1">
              <button
                onClick={() => setActiveTab('tokens')}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === 'tokens'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tokens
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Preview
              </button>
            </div>
            
            <Button onClick={() => setIsExportOpen(true)}>
              <ExportIcon className="size-4" />
              Export
            </Button>
          </div>
        </div>
      </header>
      
      {activeTab === 'tokens' ? (
        <div className="mx-auto max-w-7xl px-6 py-8">
          {/* Category Filter */}
          <div className="mb-8 flex items-center gap-2">
            <CategoryPill
              label="All"
              count={tokens.length}
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
          
          {/* Token Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTokens.map((token) => {
              if (token.category === 'color') {
                return (
                  <ColorTokenCard
                    key={token.id}
                    token={token}
                    onUpdate={(value, metadata) => handleTokenUpdate(token.id, value, metadata)}
                    onToggleLock={() => handleToggleLock(token.id, token.is_locked)}
                  />
                );
              }
              if (token.category === 'typography') {
                return (
                  <TypographyTokenCard
                    key={token.id}
                    token={token}
                    onUpdate={(value, metadata) => handleTokenUpdate(token.id, value, metadata)}
                    onToggleLock={() => handleToggleLock(token.id, token.is_locked)}
                  />
                );
              }
              if (token.category === 'spacing') {
                return (
                  <SpacingTokenCard
                    key={token.id}
                    token={token}
                    onUpdate={(value, metadata) => handleTokenUpdate(token.id, value, metadata)}
                    onToggleLock={() => handleToggleLock(token.id, token.is_locked)}
                  />
                );
              }
              return null;
            })}
          </div>
          
          {filteredTokens.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">No tokens found in this category.</p>
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
