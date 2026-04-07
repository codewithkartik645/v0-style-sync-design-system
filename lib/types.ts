// StyleSync Types

export interface ScrapedSite {
  id: string;
  url: string;
  domain: string;
  title: string | null;
  raw_css: string | null;
  extraction_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  updated_at: string;
  // Joined from design_tokens
  colors?: ColorTokens;
  typography?: TypographyTokens;
  spacing?: SpacingTokens;
}

export interface DesignTokens {
  id: string;
  site_id: string;
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  shadows: ShadowTokens;
  radii: RadiiTokens;
  created_at: string;
  updated_at: string;
}

export interface ColorToken {
  value: string;
  hex: string;
  rgb: string;
  hsl: string;
  contrast_ratio?: number;
  semantic_name?: string;
  source?: string;
  occurrences?: number;
}

export interface ColorTokens {
  primary: ColorToken[];
  background: ColorToken[];
  text: ColorToken[];
  accent: ColorToken[];
}

export interface TypographyToken {
  fontFamily: string;
  fontSize: string;
  fontWeight: string | number;
  lineHeight: string;
  letterSpacing?: string;
  source?: string;
}

export interface TypographyTokens {
  headings: TypographyToken[];
  body: TypographyToken[];
  mono: TypographyToken[];
}

export interface SpacingToken {
  value: string;
  px: number;
  rem: number;
  source?: string;
  occurrences?: number;
}

export interface SpacingTokens {
  values: SpacingToken[];
}

export interface ShadowTokens {
  values: Array<{
    value: string;
    source?: string;
  }>;
}

export interface RadiiTokens {
  values: Array<{
    value: string;
    px: number;
    source?: string;
  }>;
}

export interface TokenVersion {
  id: string;
  site_id: string;
  token_path: string;
  previous_value: string | null;
  new_value: string;
  change_type: 'extracted' | 'manual_edit' | 'locked' | 'unlocked';
  created_at: string;
}

export interface LockedToken {
  id: string;
  site_id: string;
  token_path: string;
  locked_value: string;
  locked_at: string;
}

// API Request/Response Types
export interface ScrapeRequest {
  url: string;
}

export interface ScrapeResponse {
  siteId: string;
  cached: boolean;
  message?: string;
}

export interface UpdateTokenRequest {
  tokenPath: string;
  value: string;
}

export interface ExportFormat {
  type: 'css' | 'json' | 'tailwind';
}

// Extraction Types (intermediate format before saving to DB)
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
