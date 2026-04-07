// StyleSync Types

export interface ScrapedSite {
  id: string;
  url: string;
  domain: string;
  title: string | null;
  favicon_url: string | null;
  screenshot_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DesignToken {
  id: string;
  site_id: string;
  category: 'color' | 'typography' | 'spacing';
  name: string;
  value: string;
  metadata: TokenMetadata;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenMetadata {
  // Color metadata
  hex?: string;
  rgb?: string;
  hsl?: string;
  contrast_ratio?: number;
  semantic_name?: string;
  
  // Typography metadata
  font_family?: string;
  font_weight?: string | number;
  font_size?: string;
  line_height?: string;
  letter_spacing?: string;
  
  // Spacing metadata
  px_value?: number;
  rem_value?: number;
  
  // Common
  source?: string;
  occurrences?: number;
}

export interface TokenVersion {
  id: string;
  token_id: string;
  previous_value: string;
  new_value: string;
  previous_metadata: TokenMetadata;
  new_metadata: TokenMetadata;
  created_at: string;
}

export interface LockedToken {
  id: string;
  site_id: string;
  token_id: string;
  locked_at: string;
}

// API Request/Response Types
export interface ScrapeRequest {
  url: string;
}

export interface ScrapeResponse {
  site: ScrapedSite;
  tokens: DesignToken[];
}

export interface UpdateTokenRequest {
  value: string;
  metadata?: Partial<TokenMetadata>;
}

export interface ExportFormat {
  type: 'css' | 'json' | 'tailwind';
}

// Extraction Types
export interface ExtractedColors {
  primary: string[];
  background: string[];
  text: string[];
  accent: string[];
  all: string[];
}

export interface ExtractedTypography {
  headings: TypographyStyle[];
  body: TypographyStyle[];
  mono: TypographyStyle[];
}

export interface TypographyStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: string | number;
  lineHeight: string;
  letterSpacing?: string;
}

export interface ExtractedSpacing {
  values: number[];
  scale: string[];
}

export interface ExtractionResult {
  colors: ExtractedColors;
  typography: ExtractedTypography;
  spacing: ExtractedSpacing;
  favicon?: string;
  title?: string;
}
