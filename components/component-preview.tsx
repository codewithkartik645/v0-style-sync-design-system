'use client';

import { useMemo } from 'react';
import type { DesignToken } from '@/lib/types';

interface Props {
  tokens: DesignToken[];
}

export function ComponentPreview({ tokens }: Props) {
  const colorTokens = useMemo(() => tokens.filter(t => t.category === 'color'), [tokens]);
  const typographyTokens = useMemo(() => tokens.filter(t => t.category === 'typography'), [tokens]);
  const spacingTokens = useMemo(() => tokens.filter(t => t.category === 'spacing'), [tokens]);
  
  // Get primary colors
  const primaryColor = colorTokens.find(t => t.name.includes('primary'))?.value || '#000000';
  const backgroundColor = colorTokens.find(t => t.name.includes('background'))?.value || '#ffffff';
  const textColor = colorTokens.find(t => t.name.includes('text'))?.value || '#000000';
  const accentColor = colorTokens.find(t => t.name.includes('accent'))?.value || primaryColor;
  
  // Get typography
  const headingFont = typographyTokens.find(t => t.name.includes('heading'))?.value || 'system-ui';
  const bodyFont = typographyTokens.find(t => t.name.includes('body'))?.value || 'system-ui';
  const monoFont = typographyTokens.find(t => t.name.includes('mono'))?.value || 'monospace';
  
  // Get spacing
  const spacing = spacingTokens.map(t => t.metadata?.px_value as number || parseInt(t.value)).filter(Boolean);
  const smallSpace = spacing[0] || 8;
  const mediumSpace = spacing[Math.floor(spacing.length / 2)] || 16;
  const largeSpace = spacing[spacing.length - 1] || 32;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Component Preview</h2>
        <p className="text-muted-foreground">See how extracted tokens look on real UI components</p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Buttons Preview */}
        <PreviewCard title="Buttons">
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor, color: backgroundColor }}
            >
              Primary Button
            </button>
            <button
              className="rounded-md border-2 px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Outline Button
            </button>
            <button
              className="rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ backgroundColor: accentColor, color: backgroundColor }}
            >
              Accent Button
            </button>
            <button
              className="rounded-md px-4 py-2 text-sm transition-colors"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              Ghost Button
            </button>
          </div>
        </PreviewCard>
        
        {/* Typography Preview */}
        <PreviewCard title="Typography">
          <div className="space-y-4">
            <h1 
              className="text-3xl font-bold"
              style={{ fontFamily: headingFont, color: textColor }}
            >
              Heading Text
            </h1>
            <h2 
              className="text-xl font-semibold"
              style={{ fontFamily: headingFont, color: textColor }}
            >
              Subheading Text
            </h2>
            <p 
              className="text-base leading-relaxed"
              style={{ fontFamily: bodyFont, color: textColor }}
            >
              This is body text demonstrating the extracted typography styles. 
              It shows how paragraph text will look with the font family and sizing.
            </p>
            <code
              className="inline-block rounded px-2 py-1 text-sm"
              style={{ fontFamily: monoFont, backgroundColor: `${textColor}10`, color: textColor }}
            >
              const code = &quot;monospace&quot;;
            </code>
          </div>
        </PreviewCard>
        
        {/* Card Preview */}
        <PreviewCard title="Cards">
          <div 
            className="rounded-xl border p-4 shadow-sm"
            style={{ 
              backgroundColor: backgroundColor, 
              borderColor: `${textColor}20`,
            }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div 
                className="size-10 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <div>
                <h4 
                  className="font-medium"
                  style={{ fontFamily: headingFont, color: textColor }}
                >
                  Card Title
                </h4>
                <p 
                  className="text-sm opacity-60"
                  style={{ fontFamily: bodyFont, color: textColor }}
                >
                  Card subtitle text
                </p>
              </div>
            </div>
            <p 
              className="mb-4 text-sm"
              style={{ fontFamily: bodyFont, color: textColor }}
            >
              This is a sample card component using the extracted design tokens.
            </p>
            <div className="flex gap-2">
              <button
                className="rounded px-3 py-1.5 text-sm font-medium"
                style={{ backgroundColor: primaryColor, color: backgroundColor }}
              >
                Action
              </button>
              <button
                className="rounded px-3 py-1.5 text-sm"
                style={{ color: textColor }}
              >
                Cancel
              </button>
            </div>
          </div>
        </PreviewCard>
        
        {/* Form Inputs Preview */}
        <PreviewCard title="Form Inputs">
          <div className="space-y-4">
            <div>
              <label 
                className="mb-1.5 block text-sm font-medium"
                style={{ fontFamily: bodyFont, color: textColor }}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
                style={{ 
                  borderColor: `${textColor}30`,
                  backgroundColor: backgroundColor,
                  color: textColor,
                  fontFamily: bodyFont,
                }}
              />
            </div>
            <div>
              <label 
                className="mb-1.5 block text-sm font-medium"
                style={{ fontFamily: bodyFont, color: textColor }}
              >
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                style={{ 
                  borderColor: `${textColor}30`,
                  backgroundColor: backgroundColor,
                  color: textColor,
                  fontFamily: bodyFont,
                }}
              />
            </div>
            <button
              className="w-full rounded-md px-4 py-2 text-sm font-medium"
              style={{ backgroundColor: primaryColor, color: backgroundColor }}
            >
              Sign In
            </button>
          </div>
        </PreviewCard>
        
        {/* Spacing Scale */}
        <PreviewCard title="Spacing Scale">
          <div className="space-y-3">
            {spacingTokens.slice(0, 8).map((token) => {
              const px = token.metadata?.px_value as number || parseInt(token.value);
              return (
                <div key={token.id} className="flex items-center gap-4">
                  <span 
                    className="w-20 text-right font-mono text-sm"
                    style={{ color: textColor }}
                  >
                    {token.value}
                  </span>
                  <div
                    className="h-4 rounded"
                    style={{ 
                      width: Math.min(px, 200),
                      backgroundColor: primaryColor,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </PreviewCard>
        
        {/* Color Palette */}
        <PreviewCard title="Color Palette">
          <div className="grid grid-cols-4 gap-3">
            {colorTokens.slice(0, 12).map((token) => (
              <div key={token.id} className="text-center">
                <div
                  className="mb-2 aspect-square rounded-lg border shadow-sm"
                  style={{ 
                    backgroundColor: token.value,
                    borderColor: `${textColor}10`,
                  }}
                />
                <p 
                  className="truncate text-xs"
                  style={{ color: textColor }}
                >
                  {token.name}
                </p>
              </div>
            ))}
          </div>
        </PreviewCard>
      </div>
    </div>
  );
}

function PreviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}
