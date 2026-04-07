import type { ExtractedSpacing } from '../types';

// Common spacing values to look for
const COMMON_SPACING = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128];

export function extractSpacingFromCSS(css: string): ExtractedSpacing {
  const spacingValues = new Map<number, number>();
  
  // Match padding, margin, gap values
  const spacingRegex = /(?:padding|margin|gap|top|right|bottom|left)\s*:\s*([^;]+)/gi;
  
  let match;
  while ((match = spacingRegex.exec(css)) !== null) {
    const values = parseSpacingValue(match[1]);
    for (const value of values) {
      if (value > 0 && value <= 200) {
        spacingValues.set(value, (spacingValues.get(value) || 0) + 1);
      }
    }
  }
  
  // Also check for rem-based values
  const remRegex = /(\d+(?:\.\d+)?)\s*rem/gi;
  while ((match = remRegex.exec(css)) !== null) {
    const remValue = parseFloat(match[1]);
    const pxValue = Math.round(remValue * 16);
    if (pxValue > 0 && pxValue <= 200) {
      spacingValues.set(pxValue, (spacingValues.get(pxValue) || 0) + 1);
    }
  }
  
  // Sort by frequency
  const sortedValues = Array.from(spacingValues.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([value]) => value);
  
  // Deduplicate similar values and sort
  const uniqueValues = deduplicateSimilarValues(sortedValues);
  const finalValues = uniqueValues
    .sort((a, b) => a - b)
    .slice(0, 12);
  
  // Generate scale
  const scale = finalValues.map(v => {
    if (v % 16 === 0) return `${v / 16}rem`;
    if (v % 4 === 0) return `${v / 4 * 0.25}rem`;
    return `${v}px`;
  });
  
  return {
    values: finalValues,
    scale,
  };
}

function parseSpacingValue(value: string): number[] {
  const values: number[] = [];
  
  // Split by space for shorthand values
  const parts = value.trim().split(/\s+/);
  
  for (const part of parts) {
    // Parse px values
    const pxMatch = part.match(/^(\d+(?:\.\d+)?)\s*px$/i);
    if (pxMatch) {
      values.push(Math.round(parseFloat(pxMatch[1])));
      continue;
    }
    
    // Parse rem values
    const remMatch = part.match(/^(\d+(?:\.\d+)?)\s*rem$/i);
    if (remMatch) {
      values.push(Math.round(parseFloat(remMatch[1]) * 16));
      continue;
    }
    
    // Parse em values
    const emMatch = part.match(/^(\d+(?:\.\d+)?)\s*em$/i);
    if (emMatch) {
      values.push(Math.round(parseFloat(emMatch[1]) * 16));
      continue;
    }
    
    // Parse plain numbers (assume px)
    const numMatch = part.match(/^(\d+)$/);
    if (numMatch) {
      values.push(parseInt(numMatch[1]));
    }
  }
  
  return values;
}

function deduplicateSimilarValues(values: number[], threshold = 2): number[] {
  const unique: number[] = [];
  
  for (const value of values) {
    const isDuplicate = unique.some(existing => 
      Math.abs(existing - value) <= threshold
    );
    
    if (!isDuplicate) {
      // Snap to common spacing values if close
      const snapped = snapToCommon(value);
      if (!unique.includes(snapped)) {
        unique.push(snapped);
      }
    }
  }
  
  return unique;
}

function snapToCommon(value: number): number {
  for (const common of COMMON_SPACING) {
    if (Math.abs(value - common) <= 2) {
      return common;
    }
  }
  return value;
}

export function generateSpacingMetadata(pxValue: number) {
  return {
    px_value: pxValue,
    rem_value: pxValue / 16,
  };
}
