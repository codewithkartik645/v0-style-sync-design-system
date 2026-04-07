import type { ExtractedColors } from '../types';

// Color parsing utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function parseColor(color: string): string | null {
  color = color.trim().toLowerCase();
  
  // Already hex
  if (/^#[0-9a-f]{3,8}$/i.test(color)) {
    // Expand shorthand
    if (color.length === 4) {
      return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    }
    return color.slice(0, 7); // Remove alpha if present
  }
  
  // RGB/RGBA
  const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return rgbToHex(parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]));
  }
  
  // HSL/HSLA
  const hslMatch = color.match(/hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }
  
  // Named colors
  const namedColors: Record<string, string> = {
    white: '#ffffff', black: '#000000', red: '#ff0000', green: '#008000',
    blue: '#0000ff', yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff',
    gray: '#808080', grey: '#808080', orange: '#ffa500', purple: '#800080',
    pink: '#ffc0cb', brown: '#a52a2a', transparent: null as unknown as string,
  };
  
  return namedColors[color] || null;
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

// Calculate relative luminance for contrast ratio
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Semantic color detection
export function getSemanticName(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'unknown';
  
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  // Grayscale
  if (s < 10) {
    if (l > 95) return 'white';
    if (l > 80) return 'light-gray';
    if (l > 60) return 'gray';
    if (l > 40) return 'dark-gray';
    if (l > 20) return 'charcoal';
    return 'black';
  }
  
  // Colored
  if (h < 15 || h >= 345) return l > 60 ? 'light-red' : 'red';
  if (h < 45) return l > 60 ? 'light-orange' : 'orange';
  if (h < 70) return l > 60 ? 'light-yellow' : 'yellow';
  if (h < 150) return l > 60 ? 'light-green' : 'green';
  if (h < 200) return l > 60 ? 'light-cyan' : 'cyan';
  if (h < 260) return l > 60 ? 'light-blue' : 'blue';
  if (h < 290) return l > 60 ? 'light-purple' : 'purple';
  if (h < 345) return l > 60 ? 'light-pink' : 'pink';
  
  return 'color';
}

// Extract colors from CSS text
export function extractColorsFromCSS(css: string): ExtractedColors {
  const colorRegex = /#[0-9a-f]{3,8}|rgba?\s*\([^)]+\)|hsla?\s*\([^)]+\)/gi;
  const matches = css.match(colorRegex) || [];
  
  const colorCounts = new Map<string, number>();
  const backgroundColors = new Set<string>();
  const textColors = new Set<string>();
  
  // Parse all colors
  for (const match of matches) {
    const hex = parseColor(match);
    if (hex) {
      colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
    }
  }
  
  // Categorize by context (simple heuristic based on property names)
  const bgRegex = /(?:background(?:-color)?|bg)\s*:\s*(#[0-9a-f]{3,8}|rgba?\s*\([^)]+\)|hsla?\s*\([^)]+\))/gi;
  const textRegex = /(?:^color|[^-]color)\s*:\s*(#[0-9a-f]{3,8}|rgba?\s*\([^)]+\)|hsla?\s*\([^)]+\))/gi;
  
  let bgMatch;
  while ((bgMatch = bgRegex.exec(css)) !== null) {
    const hex = parseColor(bgMatch[1]);
    if (hex) backgroundColors.add(hex);
  }
  
  let textMatch;
  while ((textMatch = textRegex.exec(css)) !== null) {
    const hex = parseColor(textMatch[1]);
    if (hex) textColors.add(hex);
  }
  
  // Sort all colors by frequency
  const sortedColors = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([color]) => color);
  
  // Deduplicate similar colors
  const uniqueColors = deduplicateSimilarColors(sortedColors);
  
  // Categorize
  const primary: string[] = [];
  const accent: string[] = [];
  
  for (const color of uniqueColors.slice(0, 15)) {
    const rgb = hexToRgb(color);
    if (!rgb) continue;
    
    const { s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    if (s > 30 && l > 20 && l < 80) {
      if (primary.length < 3) {
        primary.push(color);
      } else if (accent.length < 3) {
        accent.push(color);
      }
    }
  }
  
  return {
    primary,
    background: Array.from(backgroundColors).slice(0, 5),
    text: Array.from(textColors).slice(0, 5),
    accent,
    all: uniqueColors.slice(0, 20),
  };
}

// Remove colors that are too similar
function deduplicateSimilarColors(colors: string[], threshold = 15): string[] {
  const unique: string[] = [];
  
  for (const color of colors) {
    const rgb = hexToRgb(color);
    if (!rgb) continue;
    
    const isDuplicate = unique.some(existing => {
      const existingRgb = hexToRgb(existing);
      if (!existingRgb) return false;
      
      const distance = Math.sqrt(
        Math.pow(rgb.r - existingRgb.r, 2) +
        Math.pow(rgb.g - existingRgb.g, 2) +
        Math.pow(rgb.b - existingRgb.b, 2)
      );
      
      return distance < threshold;
    });
    
    if (!isDuplicate) {
      unique.push(color);
    }
  }
  
  return unique;
}

// Generate color metadata
export function generateColorMetadata(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return { hex };
  
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  return {
    hex,
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    semantic_name: getSemanticName(hex),
    contrast_ratio: getContrastRatio(hex, '#ffffff'),
  };
}
