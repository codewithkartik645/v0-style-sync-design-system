import { neon } from '@neondatabase/serverless';
import type { ScrapedSite, DesignTokens, TokenVersion } from './types';

const sql = neon(process.env.DATABASE_URL!);

// Site Operations
export async function createSite(url: string, domain: string, title?: string): Promise<ScrapedSite> {
  const result = await sql`
    INSERT INTO scraped_sites (url, domain, title, extraction_status)
    VALUES (${url}, ${domain}, ${title || null}, 'pending')
    RETURNING *
  `;
  return result[0] as ScrapedSite;
}

export async function getSiteById(id: string): Promise<ScrapedSite | null> {
  const result = await sql`
    SELECT * FROM scraped_sites WHERE id = ${id}
  `;
  return result[0] as ScrapedSite || null;
}

export async function getSiteByUrl(url: string): Promise<ScrapedSite | null> {
  const result = await sql`
    SELECT * FROM scraped_sites WHERE url = ${url}
  `;
  return result[0] as ScrapedSite || null;
}

export async function getRecentSites(limit = 10): Promise<ScrapedSite[]> {
  const result = await sql`
    SELECT s.*, 
           dt.colors, dt.typography, dt.spacing
    FROM scraped_sites s
    LEFT JOIN design_tokens dt ON s.id = dt.site_id
    WHERE s.extraction_status = 'completed'
    ORDER BY s.created_at DESC 
    LIMIT ${limit}
  `;
  return result as ScrapedSite[];
}

export async function updateSiteStatus(
  id: string, 
  status: 'pending' | 'processing' | 'completed' | 'failed',
  errorMessage?: string
): Promise<ScrapedSite> {
  const result = await sql`
    UPDATE scraped_sites 
    SET 
      extraction_status = ${status},
      error_message = ${errorMessage || null},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] as ScrapedSite;
}

export async function updateSiteTitle(id: string, title: string): Promise<ScrapedSite> {
  const result = await sql`
    UPDATE scraped_sites 
    SET title = ${title}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] as ScrapedSite;
}

// Token Operations (using JSONB storage)
export async function createDesignTokens(
  siteId: string,
  tokens: {
    colors?: object;
    typography?: object;
    spacing?: object;
    shadows?: object;
    radii?: object;
  }
): Promise<DesignTokens> {
  const result = await sql`
    INSERT INTO design_tokens (site_id, colors, typography, spacing, shadows, radii)
    VALUES (
      ${siteId}, 
      ${JSON.stringify(tokens.colors || {})},
      ${JSON.stringify(tokens.typography || {})},
      ${JSON.stringify(tokens.spacing || {})},
      ${JSON.stringify(tokens.shadows || {})},
      ${JSON.stringify(tokens.radii || {})}
    )
    RETURNING *
  `;
  return result[0] as DesignTokens;
}

export async function getTokensBySiteId(siteId: string): Promise<DesignTokens | null> {
  const result = await sql`
    SELECT * FROM design_tokens WHERE site_id = ${siteId}
  `;
  return result[0] as DesignTokens || null;
}

export async function updateDesignTokens(
  siteId: string,
  updates: {
    colors?: object;
    typography?: object;
    spacing?: object;
    shadows?: object;
    radii?: object;
  }
): Promise<DesignTokens> {
  // Get current tokens first
  const current = await getTokensBySiteId(siteId);
  if (!current) throw new Error('Tokens not found for site');

  const result = await sql`
    UPDATE design_tokens 
    SET 
      colors = ${JSON.stringify(updates.colors || current.colors)},
      typography = ${JSON.stringify(updates.typography || current.typography)},
      spacing = ${JSON.stringify(updates.spacing || current.spacing)},
      shadows = ${JSON.stringify(updates.shadows || current.shadows)},
      radii = ${JSON.stringify(updates.radii || current.radii)},
      updated_at = NOW()
    WHERE site_id = ${siteId}
    RETURNING *
  `;
  
  return result[0] as DesignTokens;
}

// Lock Operations
export async function lockToken(siteId: string, tokenPath: string, value: string): Promise<void> {
  await sql`
    INSERT INTO locked_tokens (site_id, token_path, locked_value)
    VALUES (${siteId}, ${tokenPath}, ${value})
    ON CONFLICT (site_id, token_path) DO UPDATE SET locked_value = ${value}, locked_at = NOW()
  `;
}

export async function unlockToken(siteId: string, tokenPath: string): Promise<void> {
  await sql`DELETE FROM locked_tokens WHERE site_id = ${siteId} AND token_path = ${tokenPath}`;
}

export async function getLockedTokens(siteId: string): Promise<Array<{ token_path: string; locked_value: string }>> {
  const result = await sql`
    SELECT token_path, locked_value FROM locked_tokens WHERE site_id = ${siteId}
  `;
  return result as Array<{ token_path: string; locked_value: string }>;
}

export async function isTokenLocked(siteId: string, tokenPath: string): Promise<boolean> {
  const result = await sql`
    SELECT 1 FROM locked_tokens WHERE site_id = ${siteId} AND token_path = ${tokenPath}
  `;
  return result.length > 0;
}

// Version Operations
export async function createTokenVersion(
  siteId: string,
  tokenPath: string,
  previousValue: string | null,
  newValue: string,
  changeType: 'extracted' | 'manual_edit' | 'locked' | 'unlocked'
): Promise<TokenVersion> {
  const result = await sql`
    INSERT INTO token_versions (site_id, token_path, previous_value, new_value, change_type)
    VALUES (${siteId}, ${tokenPath}, ${previousValue}, ${newValue}, ${changeType})
    RETURNING *
  `;
  return result[0] as TokenVersion;
}

export async function getTokenVersions(siteId: string, tokenPath?: string): Promise<TokenVersion[]> {
  if (tokenPath) {
    const result = await sql`
      SELECT * FROM token_versions 
      WHERE site_id = ${siteId} AND token_path = ${tokenPath}
      ORDER BY created_at DESC
    `;
    return result as TokenVersion[];
  }
  
  const result = await sql`
    SELECT * FROM token_versions 
    WHERE site_id = ${siteId}
    ORDER BY created_at DESC
    LIMIT 50
  `;
  return result as TokenVersion[];
}

// Combined site + tokens fetch
export async function getSiteWithTokens(id: string): Promise<{ site: ScrapedSite; tokens: DesignTokens | null; lockedTokens: string[] } | null> {
  const site = await getSiteById(id);
  if (!site) return null;
  
  const tokens = await getTokensBySiteId(id);
  const locked = await getLockedTokens(id);
  
  return {
    site,
    tokens,
    lockedTokens: locked.map(l => l.token_path)
  };
}
