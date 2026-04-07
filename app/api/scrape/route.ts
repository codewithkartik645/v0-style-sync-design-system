import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsite, getDomainFromUrl, normalizeUrl } from '@/lib/scraper';
import { createSite, createDesignTokens, getSiteByUrl, updateSiteStatus, updateSiteTitle } from '@/lib/db';
import { generateColorMetadata } from '@/lib/extractors/colors';
import { generateTypographyMetadata } from '@/lib/extractors/typography';
import { generateSpacingMetadata } from '@/lib/extractors/spacing';
import type { ColorTokens, TypographyTokens, SpacingTokens } from '@/lib/types';

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
    if (existingSite && existingSite.extraction_status === 'completed') {
      return NextResponse.json({
        siteId: existingSite.id,
        cached: true,
        message: 'Site already scraped',
      });
    }
    
    // Create site record first (without favicon)
    const domain = getDomainFromUrl(normalizedUrl);
    const site = await createSite(normalizedUrl, domain);
    
    try {
      // Update status to processing
      await updateSiteStatus(site.id, 'processing');
      
      // Scrape the website
      const extraction = await scrapeWebsite(normalizedUrl);
      
      // Update title if found
      if (extraction.title) {
        await updateSiteTitle(site.id, extraction.title);
      }
      
      // Transform extraction data into JSONB format
      const colors: ColorTokens = {
        primary: extraction.colors.primary.map(color => ({
          value: color,
          ...generateColorMetadata(color),
        })),
        background: extraction.colors.background.map(color => ({
          value: color,
          ...generateColorMetadata(color),
        })),
        text: extraction.colors.text.map(color => ({
          value: color,
          ...generateColorMetadata(color),
        })),
        accent: extraction.colors.accent.map(color => ({
          value: color,
          ...generateColorMetadata(color),
        })),
      };
      
      const typography: TypographyTokens = {
        headings: extraction.typography.headings.map(style => ({
          ...style,
          ...generateTypographyMetadata(style),
        })),
        body: extraction.typography.body.map(style => ({
          ...style,
          ...generateTypographyMetadata(style),
        })),
        mono: extraction.typography.mono.map(style => ({
          ...style,
          ...generateTypographyMetadata(style),
        })),
      };
      
      const spacing: SpacingTokens = {
        values: extraction.spacing.values.map(value => ({
          value: `${value}px`,
          ...generateSpacingMetadata(value),
        })),
      };
      
      // Create design tokens record
      await createDesignTokens(site.id, {
        colors,
        typography,
        spacing,
      });
      
      // Update status to completed
      await updateSiteStatus(site.id, 'completed');
      
      return NextResponse.json({
        siteId: site.id,
        cached: false,
        message: 'Extraction complete',
      });
      
    } catch (extractionError) {
      // Update status to failed
      await updateSiteStatus(
        site.id, 
        'failed', 
        extractionError instanceof Error ? extractionError.message : 'Unknown error'
      );
      throw extractionError;
    }
    
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to scrape website' },
      { status: 500 }
    );
  }
}
