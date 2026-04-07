import type { ExtractedTypography, TypographyStyle } from '../types';

// Common font stacks for categorization
const SERIF_FONTS = ['georgia', 'times', 'serif', 'cambria', 'palatino', 'garamond'];
const MONO_FONTS = ['mono', 'courier', 'consolas', 'menlo', 'fira code', 'jetbrains', 'source code'];
const SYSTEM_FONTS = ['-apple-system', 'blinkmacsystemfont', 'segoe ui', 'roboto', 'helvetica', 'arial', 'sans-serif'];

export function extractTypographyFromCSS(css: string): ExtractedTypography {
  const styles: TypographyStyle[] = [];
  
  // Match font-family declarations
  const fontFamilyRegex = /font-family\s*:\s*([^;]+)/gi;
  const fontSizeRegex = /font-size\s*:\s*([^;]+)/gi;
  const fontWeightRegex = /font-weight\s*:\s*([^;]+)/gi;
  const lineHeightRegex = /line-height\s*:\s*([^;]+)/gi;
  const letterSpacingRegex = /letter-spacing\s*:\s*([^;]+)/gi;
  
  // Extract all font families
  const fontFamilies = new Map<string, number>();
  let match;
  
  while ((match = fontFamilyRegex.exec(css)) !== null) {
    const family = cleanFontFamily(match[1]);
    if (family) {
      fontFamilies.set(family, (fontFamilies.get(family) || 0) + 1);
    }
  }
  
  // Extract font sizes
  const fontSizes = new Map<string, number>();
  while ((match = fontSizeRegex.exec(css)) !== null) {
    const size = match[1].trim();
    if (size) {
      fontSizes.set(size, (fontSizes.get(size) || 0) + 1);
    }
  }
  
  // Extract font weights
  const fontWeights = new Map<string, number>();
  while ((match = fontWeightRegex.exec(css)) !== null) {
    const weight = normalizeWeight(match[1].trim());
    if (weight) {
      fontWeights.set(weight, (fontWeights.get(weight) || 0) + 1);
    }
  }
  
  // Extract line heights
  const lineHeights = new Map<string, number>();
  while ((match = lineHeightRegex.exec(css)) !== null) {
    const height = match[1].trim();
    if (height) {
      lineHeights.set(height, (lineHeights.get(height) || 0) + 1);
    }
  }
  
  // Extract letter spacings
  const letterSpacings = new Map<string, number>();
  while ((match = letterSpacingRegex.exec(css)) !== null) {
    const spacing = match[1].trim();
    if (spacing) {
      letterSpacings.set(spacing, (letterSpacings.get(spacing) || 0) + 1);
    }
  }
  
  // Sort by frequency
  const sortedFamilies = Array.from(fontFamilies.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([family]) => family);
  
  const sortedSizes = Array.from(fontSizes.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([size]) => size);
  
  const sortedWeights = Array.from(fontWeights.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([weight]) => weight);
  
  const defaultLineHeight = Array.from(lineHeights.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '1.5';
  
  // Categorize fonts
  const headingFonts: string[] = [];
  const bodyFonts: string[] = [];
  const monoFonts: string[] = [];
  
  for (const family of sortedFamilies) {
    const lower = family.toLowerCase();
    
    if (MONO_FONTS.some(m => lower.includes(m))) {
      if (monoFonts.length < 2) monoFonts.push(family);
    } else if (SERIF_FONTS.some(s => lower.includes(s))) {
      if (headingFonts.length < 2) headingFonts.push(family);
    } else {
      if (bodyFonts.length < 2) bodyFonts.push(family);
      if (headingFonts.length < 2 && bodyFonts.length > 1) {
        headingFonts.push(family);
      }
    }
  }
  
  // If we don't have distinct heading fonts, use the same as body
  if (headingFonts.length === 0 && bodyFonts.length > 0) {
    headingFonts.push(bodyFonts[0]);
  }
  
  // Create typography styles
  const headings: TypographyStyle[] = headingFonts.slice(0, 1).map(font => ({
    fontFamily: font,
    fontSize: findHeadingSize(sortedSizes) || '2rem',
    fontWeight: findHeadingWeight(sortedWeights) || '700',
    lineHeight: '1.2',
  }));
  
  const body: TypographyStyle[] = bodyFonts.slice(0, 1).map(font => ({
    fontFamily: font,
    fontSize: findBodySize(sortedSizes) || '1rem',
    fontWeight: '400',
    lineHeight: defaultLineHeight,
  }));
  
  const mono: TypographyStyle[] = monoFonts.slice(0, 1).map(font => ({
    fontFamily: font,
    fontSize: '0.875rem',
    fontWeight: '400',
    lineHeight: '1.5',
  }));
  
  // Add fallbacks if empty
  if (headings.length === 0) {
    headings.push({
      fontFamily: 'system-ui, sans-serif',
      fontSize: '2rem',
      fontWeight: '700',
      lineHeight: '1.2',
    });
  }
  
  if (body.length === 0) {
    body.push({
      fontFamily: 'system-ui, sans-serif',
      fontSize: '1rem',
      fontWeight: '400',
      lineHeight: '1.5',
    });
  }
  
  if (mono.length === 0) {
    mono.push({
      fontFamily: 'ui-monospace, monospace',
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.5',
    });
  }
  
  return { headings, body, mono };
}

function cleanFontFamily(raw: string): string {
  return raw
    .split(',')[0]
    .trim()
    .replace(/['"]/g, '')
    .replace(/!important/gi, '')
    .trim();
}

function normalizeWeight(weight: string): string {
  const weightMap: Record<string, string> = {
    'normal': '400',
    'bold': '700',
    'lighter': '300',
    'bolder': '700',
  };
  
  return weightMap[weight.toLowerCase()] || weight;
}

function findHeadingSize(sizes: string[]): string | null {
  // Look for larger sizes (typically headings)
  for (const size of sizes) {
    const value = parseFloat(size);
    if (size.includes('rem') && value >= 1.5) return size;
    if (size.includes('px') && value >= 24) return size;
    if (size.includes('em') && value >= 1.5) return size;
  }
  return sizes[0] || null;
}

function findBodySize(sizes: string[]): string | null {
  // Look for medium sizes (typically body)
  for (const size of sizes) {
    const value = parseFloat(size);
    if (size.includes('rem') && value >= 0.875 && value <= 1.125) return size;
    if (size.includes('px') && value >= 14 && value <= 18) return size;
  }
  return '1rem';
}

function findHeadingWeight(weights: string[]): string | null {
  // Look for bold weights
  for (const weight of weights) {
    const value = parseInt(weight);
    if (value >= 600) return weight;
  }
  return '700';
}

export function generateTypographyMetadata(style: TypographyStyle) {
  return {
    font_family: style.fontFamily,
    font_size: style.fontSize,
    font_weight: String(style.fontWeight),
    line_height: style.lineHeight,
    letter_spacing: style.letterSpacing,
  };
}
