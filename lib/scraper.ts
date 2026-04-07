import * as cheerio from 'cheerio';
import type { ExtractionResult } from './types';
import { extractColorsFromCSS } from './extractors/colors';
import { extractTypographyFromCSS } from './extractors/typography';
import { extractSpacingFromCSS } from './extractors/spacing';

export async function scrapeWebsite(url: string): Promise<ExtractionResult> {
  // Validate URL
  const parsedUrl = new URL(url);
  
  // Fetch the page
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'StyleSync/1.0 (Design Token Extractor)',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // Extract title
  const title = $('title').text().trim() || parsedUrl.hostname;
  
  // Extract favicon
  let favicon: string | undefined;
  const faviconLink = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').first().attr('href');
  if (faviconLink) {
    favicon = new URL(faviconLink, url).href;
  } else {
    // Try default favicon location
    favicon = new URL('/favicon.ico', url).href;
  }
  
  // Collect all CSS
  let allCSS = '';
  
  // Inline styles
  $('style').each((_, el) => {
    allCSS += $(el).text() + '\n';
  });
  
  // Inline style attributes
  $('[style]').each((_, el) => {
    const style = $(el).attr('style');
    if (style) {
      allCSS += `dummy { ${style} }\n`;
    }
  });
  
  // Fetch external stylesheets
  const stylesheetLinks = $('link[rel="stylesheet"]').map((_, el) => $(el).attr('href')).get();
  
  const cssPromises = stylesheetLinks
    .filter((href): href is string => !!href)
    .slice(0, 5) // Limit to 5 stylesheets
    .map(async (href) => {
      try {
        const cssUrl = new URL(href, url).href;
        const cssResponse = await fetch(cssUrl, {
          headers: {
            'User-Agent': 'StyleSync/1.0 (Design Token Extractor)',
          },
        });
        if (cssResponse.ok) {
          return await cssResponse.text();
        }
      } catch (e) {
        // Ignore CSS fetch errors
      }
      return '';
    });
  
  const externalCSS = await Promise.all(cssPromises);
  allCSS += externalCSS.join('\n');
  
  // Extract tokens from CSS
  const colors = extractColorsFromCSS(allCSS);
  const typography = extractTypographyFromCSS(allCSS);
  const spacing = extractSpacingFromCSS(allCSS);
  
  return {
    colors,
    typography,
    spacing,
    favicon,
    title,
  };
}

export function getDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return url;
  }
}

export function normalizeUrl(url: string): string {
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  try {
    const parsed = new URL(url);
    // Remove trailing slash
    return parsed.origin + parsed.pathname.replace(/\/$/, '');
  } catch {
    throw new Error('Invalid URL');
  }
}
