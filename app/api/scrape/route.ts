import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsite, getDomainFromUrl, normalizeUrl } from '@/lib/scraper';
import { createSite, createTokensBatch, getSiteByUrl } from '@/lib/db';
import { generateColorMetadata } from '@/lib/extractors/colors';
import { generateTypographyMetadata } from '@/lib/extractors/typography';
import { generateSpacingMetadata } from '@/lib/extractors/spacing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    // Normalize URL
    let normalizedUrl: string;
    try {
      normalizedUrl = normalizeUrl(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }
    
    // Check if we've already scraped this URL
    const existingSite = await getSiteByUrl(normalizedUrl);
    if (existingSite) {
      return NextResponse.json({
        siteId: existingSite.id,
        cached: true,
        message: 'Site already scraped',
      });
    }
    
    // Scrape the website
    const extraction = await scrapeWebsite(normalizedUrl);
    const domain = getDomainFromUrl(normalizedUrl);
    
    // Create site record
    const site = await createSite(
      normalizedUrl,
      domain,
      extraction.title,
      extraction.favicon
    );
    
    // Prepare tokens for batch insert
    const tokens: Array<{
      siteId: string;
      category: 'color' | 'typography' | 'spacing';
      name: string;
      value: string;
      metadata?: Record<string, unknown>;
    }> = [];
    
    // Add color tokens
    extraction.colors.primary.forEach((color, i) => {
      tokens.push({
        siteId: site.id,
        category: 'color',
        name: `primary-${i + 1}`,
        value: color,
        metadata: generateColorMetadata(color),
      });
    });
    
    extraction.colors.background.forEach((color, i) => {
      tokens.push({
        siteId: site.id,
        category: 'color',
        name: `background-${i + 1}`,
        value: color,
        metadata: generateColorMetadata(color),
      });
    });
    
    extraction.colors.text.forEach((color, i) => {
      tokens.push({
        siteId: site.id,
        category: 'color',
        name: `text-${i + 1}`,
        value: color,
        metadata: generateColorMetadata(color),
      });
    });
    
    extraction.colors.accent.forEach((color, i) => {
      tokens.push({
        siteId: site.id,
        category: 'color',
        name: `accent-${i + 1}`,
        value: color,
        metadata: generateColorMetadata(color),
      });
    });
    
    // Add typography tokens
    extraction.typography.headings.forEach((style, i) => {
      tokens.push({
        siteId: site.id,
        category: 'typography',
        name: `heading-${i + 1}`,
        value: style.fontFamily,
        metadata: generateTypographyMetadata(style),
      });
    });
    
    extraction.typography.body.forEach((style, i) => {
      tokens.push({
        siteId: site.id,
        category: 'typography',
        name: `body-${i + 1}`,
        value: style.fontFamily,
        metadata: generateTypographyMetadata(style),
      });
    });
    
    extraction.typography.mono.forEach((style, i) => {
      tokens.push({
        siteId: site.id,
        category: 'typography',
        name: `mono-${i + 1}`,
        value: style.fontFamily,
        metadata: generateTypographyMetadata(style),
      });
    });
    
    // Add spacing tokens
    extraction.spacing.values.forEach((value, i) => {
      tokens.push({
        siteId: site.id,
        category: 'spacing',
        name: `space-${i + 1}`,
        value: `${value}px`,
        metadata: generateSpacingMetadata(value),
      });
    });
    
    // Batch insert tokens
    await createTokensBatch(tokens);
    
    return NextResponse.json({
      siteId: site.id,
      cached: false,
      tokensCreated: tokens.length,
    });
    
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to scrape website' },
      { status: 500 }
    );
  }
}
